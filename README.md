# AI Resume Analyzer

> **Tagline:** *Analyze. Improve. Get Career Ready.*

A modern, professional, full-stack AI-powered resume analysis platform designed for students, freshers, and job seekers. The application provides instant **Estimated ATS Compatibility** scores, deep semantic resume parsing, targeted **Job Description Matching**, actionable **Sentence Improvement Suggestions**, an interactive **AI Resume Assistant**, and complete **Admin Management**.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Folder Structure](#folder-structure)
5. [Database Setup & Schema](#database-setup--schema)
6. [Environment Variables](#environment-variables)
7. [Google Gemini API Setup](#google-gemini-api-setup)
8. [Installation & Local Setup](#installation--local-setup)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
9. [Default Demo Credentials](#default-demo-credentials)
10. [REST API Documentation](#rest-api-documentation)
11. [Screenshots & Visual Tour](#screenshots--visual-tour)
12. [College Viva / Project Review Notes](#college-viva--project-review-notes)
13. [Future Enhancements](#future-enhancements)

---

## Key Features

### Candidate & Job Seeker Features
- **Document Text Extraction:** Accurate parsing of `.pdf` (using PyMuPDF) and `.docx` (using python-docx) documents with structure preservation and text sanitization.
- **Estimated ATS Compatibility Score:** Transparent evaluation modeled after real-world ATS scanners. Breaks down:
  - Contact Information completeness
  - Standard Section Headings
  - Skills taxonomy & volume
  - High-impact action verbs & keywords
  - Quantifiable metrics & project impact
  - Formatting & Readability heuristics
- **Structured Resume Taxonomy:** Categorizes extracted technical skills across Programming Languages, Frameworks, Databases, Tools, Cloud/DevOps, and AI/ML.
- **Job Description Matcher:** Pastes any job posting to compare skill overlap, compute match score, identify matched vs. missing skills, and rate experience suitability.
- **Skill Gap Detection:** Clearly visualizes "Already Have" vs. "Missing / Recommended to Learn" skills with strict truthfulness ethics (never advises hallucinating skills).
- **Sentence-by-Sentence Rewriter:** Side-by-side weak vs. strong phrasing comparisons with explanations and 1-click clipboard copying.
- **Project Description Improver:** Takes project name, technologies, and raw drafts to generate professional resume bullet points, relevant action verbs, and keywords.
- **Contextual AI Resume Assistant:** Conversational chatbot powered by Google Gemini 3.8 Flash that answers candidate questions tailored to their uploaded resume.
- **Analysis History:** Review, inspect, and delete previously uploaded resumes and analyses.

### Administrator Features
- **Admin Dashboard:** Platform KPIs (Total Users, Total Resumes, Total Analyses, Total Job Matches, Average ATS score).
- **Users Management:** Inspect registered candidate details, joined dates, and safely delete accounts.
- **Resume Records Management:** Monitor document metadata, file sizes, ATS scores, and delete inappropriate or orphaned uploads.

---

## Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (modern, responsive palette)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **HTTP Client:** Axios with JWT Bearer interceptors

### Backend
- **Framework:** FastAPI (Python 3.12)
- **Data Validation:** Pydantic v2 & Pydantic-Settings
- **Database ORM:** SQLAlchemy 2.0
- **Authentication:** JWT (JSON Web Tokens) with salted `bcrypt` password hashing
- **File Parsing:** PyMuPDF (`fitz`) for PDF & `python-docx` for Word documents
- **AI Engine:** Google Gemini API (`gemini-3.8-flash`) via official `google-genai` SDK

### Database
- **Primary / Production:** PostgreSQL (compatible with Supabase PostgreSQL)
- **Local Development / Offline Demo:** SQLite (`sqlite:///./resume_analyzer.db`) for zero-friction local execution

---

## System Architecture

```
[Candidate / Admin Browser]
           │
           │ HTTP / REST + Bearer Token
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend Monolith                 │
│                                                             │
│  ┌────────────────┐   ┌───────────────┐   ┌──────────────┐  │
│  │ Authentication │   │ Resume Parser │   │  ATS Engine  │  │
│  │ (Bcrypt + JWT) │   │(PyMuPDF/docx) │   │ (Heuristics) │  │
│  └────────────────┘   └───────────────┘   └──────────────┘  │
│                                                             │
│  ┌────────────────┐   ┌───────────────┐   ┌──────────────┐  │
│  │   Job Match    │   │  AI Assistant │   │  Admin Portal│  │
│  │    Service     │   │ (Gemini 3.8)  │   │  Management  │  │
│  └────────────────┘   └───────────────┘   └──────────────┘  │
└──────────────┬──────────────────────────────────┬───────────┘
               │                                  │
               ▼                                  ▼
┌─────────────────────────────┐    ┌──────────────────────────┐
│   Database (SQLAlchemy)     │    │  Google Gemini 3.8 Flash │
│  SQLite (Local) / Postgres  │    │  Generative AI Cloud API │
└─────────────────────────────┘    └──────────────────────────┘
```

---

## Folder Structure

```
AI Resume Analyzer/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py             # Settings & Environment variables
│   │   │   ├── deps.py               # Auth & Admin route dependencies
│   │   │   └── security.py           # Bcrypt hashing & JWT logic
│   │   ├── database/
│   │   │   ├── database.py           # SQLAlchemy session & engine
│   │   │   └── models.py             # User, Resume, ResumeAnalysis, JobAnalysis, ChatMessage
│   │   ├── routes/
│   │   │   ├── admin.py              # /api/admin/*
│   │   │   ├── analysis.py           # /api/analysis/*
│   │   │   ├── auth.py               # /api/auth/*
│   │   │   ├── chatbot.py            # /api/chat/*
│   │   │   ├── job.py                # /api/job-match/*
│   │   │   └── resume.py             # /api/resumes/*
│   │   ├── schemas/
│   │   │   ├── analysis.py           # Pydantic schemas for reports & suggestions
│   │   │   ├── auth.py               # Register, Login, Token schemas
│   │   │   ├── chatbot.py            # Chat message payloads
│   │   │   ├── job.py                # Job match request/response
│   │   │   └── resume.py             # Resume upload schemas
│   │   ├── services/
│   │   │   ├── ats_service.py        # Deterministic ATS factor engine
│   │   │   ├── gemini_service.py     # Gemini 3.8 client & structured analysis
│   │   │   ├── job_match_service.py  # Skill gap & JD keyword comparison
│   │   │   └── resume_parser.py      # PyMuPDF & python-docx extraction
│   │   ├── utils/
│   │   │   └── helpers.py            # Size formatting & helpers
│   │   └── main.py                   # FastAPI app instance, CORS, handlers
│   ├── .env                          # Local environment variables
│   ├── .env.example                  # Template configuration
│   ├── requirements.txt              # Python package dependencies
│   └── seed.py                       # Demo seed script for viva / testing
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx             # Alert messages banner
│   │   │   ├── EmptyState.jsx        # Clean empty placeholders
│   │   │   ├── FileUpload.jsx        # Drag & drop PDF/DOCX area
│   │   │   ├── LoadingSpinner.jsx    # Step-by-step progress animation
│   │   │   ├── Navbar.jsx            # Responsive navigation header
│   │   │   ├── ProgressBar.jsx       # ATS factor progress bar
│   │   │   ├── ProtectedRoute.jsx    # Role-based route guard
│   │   │   ├── ScoreCard.jsx         # Circular SVG ATS gauge
│   │   │   ├── Sidebar.jsx           # Candidate & Admin sidebar
│   │   │   └── SkillBadge.jsx        # Matched/missing skill pills
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # User state & JWT persistence
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── ResumeManagement.jsx
│   │   │   │   └── Users.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── JobMatch.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResumeAnalysis.jsx
│   │   │   ├── ResumeAssistant.jsx
│   │   │   ├── Suggestions.jsx
│   │   │   └── UploadResume.jsx
│   │   ├── services/
│   │   │   ├── adminService.js
│   │   │   ├── analysisService.js
│   │   │   ├── api.js                # Axios client with bearer token
│   │   │   ├── authService.js
│   │   │   ├── chatService.js
│   │   │   ├── jobService.js
│   │   │   └── resumeService.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx                   # React Router route tree
│   │   ├── index.css                 # Tailwind directives & styling
│   │   └── main.jsx                  # React DOM mount
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## Database Setup & Schema

The application uses SQLAlchemy ORM models configured to work seamlessly on both **SQLite** and **PostgreSQL (Supabase)**.

### Tables
1. **`users`**: `id`, `name`, `email`, `password_hash`, `role` (`USER` or `ADMIN`), `created_at`.
2. **`resumes`**: `id`, `user_id` (FK), `file_name`, `file_type`, `file_size`, `extracted_text`, `created_at`.
3. **`resume_analyses`**: `id`, `resume_id` (FK), `ats_score`, `ats_breakdown` (JSON), `personal_info` (JSON), `education` (JSON), `skills` (JSON), `projects` (JSON), `experience` (JSON), `certifications` (JSON), `achievements` (JSON), `strengths` (JSON), `weaknesses` (JSON), `suggestions` (JSON), `detected_sections` (JSON), `created_at`.
4. **`job_analyses`**: `id`, `resume_id` (FK), `job_title`, `company`, `job_description`, `match_score`, `matched_skills` (JSON), `missing_skills` (JSON), `keywords` (JSON), `experience_match`, `suggestions` (JSON), `created_at`.
5. **`chat_history`**: `id`, `user_id` (FK), `resume_id` (FK), `role`, `message`, `created_at`.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
APP_ENV=development
PORT=8000
SECRET_KEY=ai_resume_analyzer_super_secure_jwt_secret_token_2026_xyz
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Configuration:
# Default local SQLite:
DATABASE_URL=sqlite:///./resume_analyzer.db
# Or PostgreSQL / Supabase:
# DATABASE_URL=postgresql://postgres.yourproject:yourpassword@aws-0-region.pooler.supabase.com:6543/postgres

# Google Gemini API
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

MAX_FILE_SIZE_MB=10
```

---

## Google Gemini API Setup

1. Get a free API key from Google AI Studio: [https://aistudio.google.com/](https://aistudio.google.com/)
2. Paste the key in `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
3. If no key is configured, the system gracefully utilizes an intelligent heuristic analyzer fallback so the platform remains fully demonstrable in offline college vivas!

---

## Installation & Local Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment:
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Windows Command Prompt:
.venv\Scripts\activate.bat
# Linux / macOS:
source .venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Run database seed script (creates tables + demo admin & user accounts)
python seed.py

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: `http://127.0.0.1:8000`  
Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup

In a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Default Demo Credentials

For rapid review, viva presentation, and evaluation, the seed script provisions:

| Role | Email | Password |
|---|---|---|
| **Demo Student** | `student@resumeai.com` | `Student@12345` |
| **Administrator** | `admin@resumeai.com` | `Admin@12345` |

*(On the Login page, 1-click quick-fill buttons are provided for instant evaluation)*

---

## REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new candidate account
- `POST /api/auth/login` — Authenticate and receive JWT access token
- `GET /api/auth/me` — Get current user profile

### Resumes (`/api/resumes`)
- `POST /api/resumes/upload` — Upload PDF/DOCX file and extract sanitized text
- `GET /api/resumes` — List all resumes belonging to user
- `GET /api/resumes/{resume_id}` — Get resume details and extracted text
- `DELETE /api/resumes/{resume_id}` — Delete resume and cascade delete analyses

### Analysis (`/api/analysis`)
- `POST /api/analysis/{resume_id}` — Trigger Gemini AI analysis & ATS scoring
- `GET /api/analysis/{resume_id}` — Get latest analysis report
- `GET /api/analysis/detail/{analysis_id}` — Get specific analysis by ID
- `DELETE /api/analysis/{analysis_id}` — Delete analysis report
- `POST /api/analysis/improve-project` — Generate improved project bullet points and verbs

### Job Match (`/api/job-match`)
- `POST /api/job-match/{resume_id}` — Match resume against job description
- `GET /api/job-match/{job_analysis_id}` — Get job match report
- `GET /api/job-match/resume/{resume_id}` — List all job matches for a resume

### AI Resume Assistant (`/api/chat`)
- `POST /api/chat` — Contextual chat with candidate resume
- `GET /api/chat/history/{resume_id}` — Get conversation history
- `DELETE /api/chat/history/{resume_id}` — Clear conversation history

### Admin (`/api/admin`)
- `GET /api/admin/statistics` — Get platform-wide metrics
- `GET /api/admin/users` — List registered users
- `DELETE /api/admin/users/{user_id}` — Delete user account
- `GET /api/admin/resumes` — List all uploaded resumes and metadata
- `DELETE /api/admin/resumes/{resume_id}` — Delete resume record

---

## College Viva / Project Review Notes

When presenting this project to your examiner or viva panel:
1. **Full-Stack Separation:** Explain how React (Vite) interacts with FastAPI via RESTful endpoints and JWT Bearer headers.
2. **Text Extraction Pipeline:** Mention that raw PDF files are parsed on the backend using PyMuPDF (`fitz`), and DOCX files using `python-docx`. Raw text is cleaned, sanitized, and stored before being sent to Gemini AI.
3. **Structured Prompting & Schema:** Show how Pydantic schemas enforce type safety on Gemini's output, avoiding runtime UI crashes.
4. **Transparent ATS Scoring:** Emphasize that ATS scores are not arbitrary black-box claims; they are calculated through deterministic factors (contact completeness, section presence, skill volume, action verbs, impact metrics).
5. **Role-Based Authorization:** Demonstrate candidate route isolation and how the admin portal is protected by role verification on both the frontend router and backend dependencies.

---

## Future Enhancements

- Integration with LinkedIn profile auto-import
- Export improved resume to customizable LaTeX and PDF templates
- Multi-language resume parsing support
- Interview question simulator tailored to detected project technologies
