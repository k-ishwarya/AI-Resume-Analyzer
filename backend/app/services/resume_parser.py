import io
import re
import pymupdf as fitz  # PyMuPDF
import docx  # python-docx
from fastapi import HTTPException, status, UploadFile
from app.core.config import settings

def clean_extracted_text(text: str) -> str:
    """Cleans and sanitizes raw extracted text from resumes."""
    if not text:
        return ""
    # Normalize unicode spaces and quotes
    text = text.replace('\xa0', ' ').replace('\u2013', '-').replace('\u2014', '--')
    text = text.replace('\u2018', "'").replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"')
    
    # Replace multiple continuous blank lines with a single blank line
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    # Remove control characters except newline and tab
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    # Strip trailing/leading whitespace on each line
    lines = [line.strip() for line in text.split('\n')]
    cleaned = '\n'.join(lines).strip()
    return cleaned

def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF bytes using PyMuPDF (fitz)."""
    try:
        doc = fitz.open(stream=content, filetype="pdf")
        full_text = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text:
                full_text.append(text)
        doc.close()
        return clean_extracted_text("\n".join(full_text))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text from PDF: {str(e)}"
        )

def extract_text_from_docx(content: bytes) -> str:
    """Extract text from DOCX bytes using python-docx."""
    try:
        file_stream = io.BytesIO(content)
        doc = docx.Document(file_stream)
        full_text = []
        
        # Extract from paragraphs
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text)
                
        # Also extract from tables if present
        for table in doc.tables:
            for row in table.rows:
                row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_text:
                    full_text.append(" | ".join(row_text))
                    
        return clean_extracted_text("\n".join(full_text))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text from DOCX: {str(e)}"
        )

async def parse_and_validate_resume(file: UploadFile) -> tuple[str, str, int]:
    """
    Validates file extension and size, extracts text, cleans it,
    and returns (file_name, file_type, file_size, extracted_text).
    """
    filename = file.filename or "resume"
    extension = filename.split(".")[-1].lower() if "." in filename else ""
    
    if extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{extension}'. Please upload a PDF or DOCX file."
        )
        
    file_size = 0
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    content_chunks = []
    
    while True:
        chunk = await file.read(1024 * 1024)  # Read in 1MB chunks
        if not chunk:
            break
        file_size += len(chunk)
        if file_size > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
            )
        content_chunks.append(chunk)
        
    content = b"".join(content_chunks)
        
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty."
        )
        
    if extension == "pdf":
        text = extract_text_from_pdf(content)
    elif extension == "docx":
        text = extract_text_from_docx(content)
    else:
        text = ""

    if not text or len(text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract readable text from the document. Please ensure it contains selectable text and is not an empty scanned image."
        )
        
    return filename, extension, file_size, text
