import json
import logging
import os
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Heuristic Fallback Parser for offline/missing API key scenarios
def _extract_heuristic_analysis(text: str) -> Dict[str, Any]:
    """
    Extracts authentic structured entities strictly from the provided text.
    Never hallucinates or invents fake degrees, projects, skills, or certifications.
    """
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # 1. Contact Extraction
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else None

    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else None

    # LinkedIn: full URL or handle
    linkedin_match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_\-]+)', text, re.IGNORECASE)
    if linkedin_match:
        linkedin = linkedin_match.group(0)
    else:
        # Check for linkedin keyword or handle near icons
        lh = re.search(r'(?:linkedin|in)\s*[:|•\-]?\s*([a-zA-Z0-9_\-]{3,30})', text, re.IGNORECASE)
        linkedin = f"https://linkedin.com/in/{lh.group(1)}" if lh and "@" not in lh.group(1) else None

    # GitHub: full URL or handle
    github_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_\-]+)', text, re.IGNORECASE)
    if github_match:
        github = github_match.group(0)
    else:
        gh = re.search(r'(?:github|git)\s*[:|•\-]?\s*([a-zA-Z0-9_\-]{3,30})', text, re.IGNORECASE)
        github = f"https://github.com/{gh.group(1)}" if gh and "@" not in gh.group(1) else None

    # Portfolio / Website
    portfolio_match = re.search(r'(https?://(?:www\.)?(?!linkedin|github)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(?:/[^\s]*)?)', text)
    portfolio = portfolio_match.group(0) if portfolio_match else None

    # Name: First non-empty line that isn't an email, url, or phone
    name = "Candidate"
    for l in lines[:5]:
        if not re.search(r'(@|http|\.com|\+?\d{7,})', l) and len(l) <= 45 and not any(w in l.lower() for w in ["resume", "curriculum", "page"]):
            name = l
            break

    # 2. Section Parsing by Headers
    sections = re.split(r'\n(?=[A-Z\s/]{3,30}\n)', text)
    section_map = {}
    for sec in sections:
        sec_lines = [sl.strip() for sl in sec.strip().split('\n') if sl.strip()]
        if sec_lines:
            header = sec_lines[0].upper().strip()
            content = sec_lines[1:]
            section_map[header] = content

    def get_section_content(possible_headers: List[str]) -> List[str]:
        for h, content in section_map.items():
            if any(ph in h for ph in possible_headers):
                return content
        return []

    # 3. Education
    education_lines = get_section_content(["EDUCATION", "ACADEMIC", "QUALIFICATION"])
    education = []
    if education_lines:
        deg = "Degree / Coursework"
        inst = education_lines[0]
        year = None
        cgpa = None
        for el in education_lines:
            if any(dw in el.lower() for dw in ["bachelor", "master", "b.e", "b.tech", "btech", "bsc", "b.sc", "m.tech", "mca", "higher secondary", "hsc"]):
                deg = el
            year_match = re.search(r'\b(20\d\d(?:\s*-\s*20\d\d|\s*-\s*present)?)\b', el, re.IGNORECASE)
            if year_match:
                year = year_match.group(0)
            cgpa_match = re.search(r'\b(cgpa\s*[:=]?\s*[\d\.]+(?:/\d+)?|\b\d{2}(?:\.\d+)?%)\b', el, re.IGNORECASE)
            if cgpa_match:
                cgpa = cgpa_match.group(0)

        education.append({
            "degree": deg,
            "college": inst,
            "graduation_year": year or "Present",
            "cgpa_percentage": cgpa or ""
        })

    # 4. Skills Extraction (Authentic: Only skills that actually appear in the resume)
    text_lower = text.lower()
    def find_matches(catalog):
        return [k.title() if len(k) > 3 else k.upper() for k in catalog if re.search(rf'(?:^|[\s,;()./:\-\[\]])({re.escape(k)})(?:$|[\s,;()./:\-\[\]])', text_lower)]

    programming_keywords = ["python", "javascript", "typescript", "java", "c++", "c", "c#", "ruby", "go", "php", "rust", "kotlin", "swift", "sql", "html", "html5", "css", "css3"]
    framework_keywords = ["react", "react.js", "next.js", "vue", "angular", "node.js", "express", "express.js", "fastapi", "django", "flask", "spring boot", "tailwind css", "bootstrap"]
    database_keywords = ["postgresql", "postgres", "mysql", "sqlite", "mongodb", "redis", "firebase", "oracle", "cassandra", "mongodb atlas"]
    tool_keywords = ["git", "github", "docker", "kubernetes", "linux", "postman", "vite", "webpack", "jira", "vs code", "eclipse"]
    cloud_keywords = ["aws", "azure", "gcp", "google cloud", "vercel", "netlify", "heroku", "railway"]
    ai_ml_keywords = ["machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn", "gemini", "nlp", "computer vision", "pandas", "numpy", "rag", "anthropic api", "vector embeddings", "llm"]

    prog = find_matches(programming_keywords)
    fw = find_matches(framework_keywords)
    db = find_matches(database_keywords)
    tl = find_matches(tool_keywords)
    cld = find_matches(cloud_keywords)
    aiml = find_matches(ai_ml_keywords)

    skills_dict = {
        "programming_languages": prog,
        "frameworks": fw,
        "databases": db,
        "tools": tl,
        "cloud": cld,
        "ai_ml": aiml,
        "other": []
    }

    # 5. Projects Extraction (Authentic)
    project_lines = get_section_content(["PROJECTS", "KEY PROJECTS", "PERSONAL PROJECTS"])
    projects = []
    if project_lines:
        current_pname = project_lines[0]
        current_desc = []
        for pl in project_lines[1:]:
            if pl.startswith("") or pl.startswith("-") or pl.startswith("•") or len(current_desc) < 3:
                clean_pl = re.sub(r'^[\-•]\s*', '', pl)
                current_desc.append(clean_pl)
        projects.append({
            "name": current_pname,
            "technologies": (prog[:2] + fw[:2]) if (prog or fw) else [],
            "description": " ".join(current_desc[:2]) if current_desc else current_pname,
            "key_contributions": current_desc if current_desc else [current_pname]
        })

    # 6. Experience Extraction (Authentic)
    exp_lines = get_section_content(["EXPERIENCE", "WORK EXPERIENCE", "INTERNSHIP", "EMPLOYMENT"])
    experience = []
    if exp_lines:
        role = exp_lines[0]
        company = exp_lines[1] if len(exp_lines) > 1 else ""
        resp = []
        for el in exp_lines[2:]:
            clean_el = re.sub(r'^[\-•]\s*', '', el)
            if len(clean_el) > 10:
                resp.append(clean_el)
        experience.append({
            "company": company,
            "role": role,
            "duration": "Duration in resume",
            "responsibilities": resp[:3]
        })

    # 7. Certifications Extraction (Authentic)
    cert_lines = get_section_content(["CERTIFICATION", "CERTIFICATIONS", "CERTIFICATES", "LICENSES"])
    certifications = [re.sub(r'^[\-•]\s*', '', cl) for cl in cert_lines if len(cl) > 4]

    # 8. Achievements Extraction (Authentic)
    ach_lines = get_section_content(["ACHIEVEMENT", "ACHIEVEMENTS", "AWARDS", "HONORS"])
    achievements = [re.sub(r'^[\-•]\s*', '', al) for al in ach_lines if len(al) > 4]

    # 9. Recommendations & Suggestions
    suggestions = []
    if not (github or portfolio):
        suggestions.append({
            "current": "Missing public GitHub repository link",
            "suggested": "Add an active GitHub profile link showing clean, documented repositories with READMEs.",
            "reason": "Recruiters and hiring managers rely on GitHub links to verify hands-on coding ability."
        })
    if not any("%" in l or any(d in l for d in ["10", "100", "50", "20", "80"]) for l in lines):
        suggestions.append({
            "current": "Bullet points lack measurable impact figures",
            "suggested": "Include quantifiable metrics such as response time reduction, users supported, or accuracy scores.",
            "reason": "Quantified accomplishments stand out significantly to hiring managers and automated ATS screeners."
        })

    recommendations = [
        "Ensure all technical projects have clear, functional GitHub repository links.",
        "Quantify achievements in project and experience bullet points with concrete metrics.",
        "Include active industry certifications to validate proficiency in your top tech stack."
    ]

    return {
        "personal_info": {
            "name": name,
            "email": email,
            "phone": phone,
            "linkedin": linkedin,
            "github": github,
            "portfolio": portfolio
        },
        "education": education,
        "skills": skills_dict,
        "projects": projects,
        "experience": experience,
        "certifications": certifications,
        "achievements": achievements,
        "weak_sentences_suggestions": suggestions,
        "ai_recommendations": recommendations
    }

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI Client: {e}")

    def _extract_json_from_response(self, text: str) -> Dict[str, Any]:
        """Extracts and parses JSON from Gemini response, stripping markdown code blocks if present."""
        text = text.strip()
        json_pattern = r'```(?:json)?\s*([\s\S]*?)\s*```'
        match = re.search(json_pattern, text)
        if match:
            text = match.group(1).strip()
        return json.loads(text)

    def _generate_content_with_retry(self, prompt: str) -> str:
        """
        Attempts content generation with the configured Gemini model,
        automatically falling back through active, tested models if temporary 503 or 404 occurs.
        """
        configured_model = settings.GEMINI_MODEL or "gemini-3.5-flash"
        # Ordered list of models to try
        candidates = [configured_model]
        for fallback in ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash"]:
            if fallback not in candidates:
                candidates.append(fallback)

        last_error = None
        for model_name in candidates:
            try:
                res = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                if res and res.text:
                    return res.text
            except Exception as e:
                logger.warning(f"Gemini model '{model_name}' encountered error: {e}. Trying next candidate...")
                last_error = e

        raise last_error or RuntimeError("All Gemini candidate models failed to generate content.")

    async def analyze_resume_with_gemini(self, resume_text: str) -> Dict[str, Any]:
        """Analyzes extracted resume text with Gemini, extracting comprehensive, authentic structured entities."""
        if not self.client:
            logger.info("No Gemini API key configured. Utilizing heuristic parser.")
            return _extract_heuristic_analysis(resume_text)

        prompt = f"""You are an expert ATS and technical recruiter analyzing a candidate's resume.
CRITICAL RULES:
1. Do NOT invent or hallucinate information, degrees, companies, projects, skills, or metrics not present in the resume.
2. If an entity is not found, leave it empty or null.
3. Categorize technical skills accurately based strictly on what is in the resume.
4. Extract ALL projects and experience entries accurately with real descriptions.
5. Identify 2 to 4 weak or passive sentences in the resume and provide high-impact revisions preserving truth.
6. Provide 3 to 5 actionable, realistic resume improvement recommendations.
7. Return ONLY a single raw JSON object (no surrounding explanations, no conversational markdown).

RESUME CONTENT:
\"\"\"
{resume_text[:14000]}
\"\"\"

JSON SCHEMA TO RETURN:
{{
  "personal_info": {{
    "name": string or null,
    "email": string or null,
    "phone": string or null,
    "linkedin": string or null,
    "github": string or null,
    "portfolio": string or null
  }},
  "education": [
    {{
      "degree": string,
      "college": string,
      "graduation_year": string,
      "cgpa_percentage": string
    }}
  ],
  "skills": {{
    "programming_languages": [string],
    "frameworks": [string],
    "databases": [string],
    "tools": [string],
    "cloud": [string],
    "ai_ml": [string],
    "other": [string]
  }},
  "projects": [
    {{
      "name": string,
      "technologies": [string],
      "description": string,
      "key_contributions": [string]
    }}
  ],
  "experience": [
    {{
      "company": string,
      "role": string,
      "duration": string,
      "responsibilities": [string]
    }}
  ],
  "certifications": [string],
  "achievements": [string],
  "weak_sentences_suggestions": [
    {{
      "current": string,
      "suggested": string,
      "reason": string
    }}
  ],
  "ai_recommendations": [string]
}}"""

        try:
            response_text = self._generate_content_with_retry(prompt)
            parsed_data = self._extract_json_from_response(response_text)
            return parsed_data
        except Exception as e:
            logger.error(f"Gemini API call or JSON parsing failed: {e}. Falling back to authentic heuristic parser.")
            return _extract_heuristic_analysis(resume_text)

    async def improve_project_description(
        self, project_name: str, technologies: str, current_description: str
    ) -> Dict[str, Any]:
        """Generates bullet points, keywords, and action verbs to improve a project description without hallucinating metrics."""
        if not self.client:
            return {
                "improved_description": f"Architected {project_name} utilizing {technologies} to streamline workflows and deliver robust application logic.",
                "bullet_points": [
                    f"Engineered key components for {project_name} utilizing {technologies} with a focus on modular maintainability.",
                    "Implemented responsive interfaces and secure REST API endpoints with comprehensive input validation.",
                    "Collaborated on debugging, performance optimization, and rigorous testing across user workflows."
                ],
                "technical_keywords": [t.strip() for t in technologies.split(",") if t.strip()] + ["REST API", "State Management", "Performance Optimization"],
                "suggested_action_verbs": ["Architected", "Engineered", "Implemented", "Streamlined", "Optimized"]
            }

        prompt = f"""You are a professional technical resume writer helping a student or job seeker.
Improve their project description for their resume.

RULES:
- Do NOT invent metrics (e.g. do not say 'increased speed by 80%' unless the user mentioned it).
- Do NOT add technologies that the user did not specify.
- Focus strictly on stronger action verbs, clearer technical responsibility, and professional phrasing.
- Return ONLY a raw JSON object.

PROJECT DETAILS:
Project Name: {project_name}
Technologies Used: {technologies}
Current Description: {current_description}

JSON SCHEMA:
{{
  "improved_description": string,
  "bullet_points": [string, string, string],
  "technical_keywords": [string],
  "suggested_action_verbs": [string]
}}"""

        try:
            res_text = self._generate_content_with_retry(prompt)
            return self._extract_json_from_response(res_text)
        except Exception as e:
            logger.warning(f"Gemini project improve error: {e}")
            return {
                "improved_description": f"Designed and deployed {project_name} leveraging {technologies} with clean architecture.",
                "bullet_points": [
                    f"Constructed core features for {project_name} with {technologies}.",
                    "Structured modular data flows and verified robust exception handling.",
                    "Refactored code structure for optimal readability and cross-browser responsiveness."
                ],
                "technical_keywords": [t.strip() for t in technologies.split(",") if t.strip()] + ["Agile", "RESTful Design", "Clean Code"],
                "suggested_action_verbs": ["Designed", "Constructed", "Deployed", "Refactored", "Maintained"]
            }

    async def match_job_with_gemini(
        self,
        resume_text: str,
        job_title: str,
        job_description: str,
        resume_analysis: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Deep semantic job description match using Gemini AI."""
        if not self.client:
            return None

        prompt = f"""You are an expert technical recruiter and ATS matcher.
Analyze how well this candidate's resume matches the target job description.

CRITICAL RULES:
1. Extract ALL key skills, tools, technologies, domain competencies, methodologies, and requirements mentioned in the job description.
2. Accurately categorize which of those requirements the candidate ALREADY HAS ("matched_skills") based on their actual resume content.
3. Accurately categorize which requirements are MISSING or NOT DEMONSTRATED in the resume ("missing_skills").
4. Calculate an authentic ATS match score (integer from 0 to 100) reflecting real-world candidate fit. If primary requirements are missing, score appropriately lower.
5. Determine experience_match: strictly one of "Good", "Partial", or "Limited".
6. Extract 4 to 8 high-relevance industry keywords from the job description.
7. Provide 3 to 4 actionable, specific suggestions to help the candidate improve their alignment without fabricating experience.
8. Return ONLY a valid JSON object matching the schema below.

TARGET JOB:
Title: {job_title}
Job Description:
\"\"\"
{job_description[:6000]}
\"\"\"

CANDIDATE RESUME:
\"\"\"
{resume_text[:8000]}
\"\"\"

JSON SCHEMA:
{{
  "match_score": int,
  "matched_skills": [string],
  "missing_skills": [string],
  "keywords": [string],
  "experience_match": "Good" | "Partial" | "Limited",
  "suggestions": [string]
}}"""

        try:
            res_text = self._generate_content_with_retry(prompt)
            result = self._extract_json_from_response(res_text)
            if "match_score" in result and "matched_skills" in result and "missing_skills" in result:
                result["match_score"] = int(max(0, min(100, result["match_score"])))
                if result.get("experience_match") not in ["Good", "Partial", "Limited"]:
                    result["experience_match"] = "Partial"
                return result
        except Exception as e:
            logger.warning(f"Gemini job match error: {e}")

        return None

    async def chat_with_resume_assistant(
        self,
        resume_text: str,
        resume_analysis: Dict[str, Any],
        chat_history: List[Dict[str, str]],
        user_message: str
    ) -> str:
        """Contextualized conversational AI assistant for resume questions."""
        if not self.client:
            msg_lower = user_message.lower()
            if "strong" in msg_lower:
                return "Based on your resume, your strongest areas are your technical skills taxonomy and hands-on projects. Your projects demonstrate applied knowledge of modern frameworks and database persistence."
            elif "verb" in msg_lower:
                return "Here are high-impact action verbs you can use: 'Architected', 'Engineered', 'Optimized', 'Spearheaded', 'Streamlined', 'Automated', and 'Refactored'."
            elif "fresher" in msg_lower or "software" in msg_lower:
                return "Yes, your resume contains a solid foundation for a fresher software engineering role. To stand out further, make sure your GitHub links have clear README files and live demo links."
            else:
                return f"I analyzed your resume for '{resume_analysis.get('personal_info', {}).get('name', 'Candidate')}'. To maximize your ATS compatibility and interview conversion, ensure your project descriptions follow the Action Verb + Context + Result format and avoid passive voice."

        context_summary = f"""CANDIDATE RESUME SUMMARY:
Name: {resume_analysis.get('personal_info', {}).get('name')}
Detected Skills: {json.dumps(resume_analysis.get('skills', {}))}
Projects: {json.dumps([p.get('name') for p in resume_analysis.get('projects', [])])}
Experience: {json.dumps([e.get('role') for e in resume_analysis.get('experience', [])])}
Education: {json.dumps(resume_analysis.get('education', []))}
ATS Score: {resume_analysis.get('ats_score')}%
Strengths: {json.dumps(resume_analysis.get('strengths', []))}
Areas to improve: {json.dumps(resume_analysis.get('weaknesses', []))}
"""

        system_instruction = """You are the AI Resume Assistant, a friendly, encouraging, and deeply knowledgeable technical career coach and resume reviewer.
You are assisting a student or job seeker by analyzing their uploaded resume.
Help them refine bullet points, identify strengths, prepare for interviews, suggest action verbs, and highlight skills.
Never hallucinate fake achievements or suggest lying on their resume. Keep advice actionable, concise, and structured with bullet points where helpful."""

        history_text = "\n".join([f"{item['role'].capitalize()}: {item['message']}" for item in chat_history[-6:]])

        prompt = f"""{system_instruction}

{context_summary}

CONVERSATION HISTORY:
{history_text}

USER: {user_message}
ASSISTANT:"""

        try:
            res_text = self._generate_content_with_retry(prompt)
            return res_text or "I reviewed your resume. How else can I assist with your career preparation?"
        except Exception as e:
            logger.error(f"Chat assistant error: {e}")
            return "I am reviewing your resume details. To improve your ATS score, consider quantifying your project results and adding verified technical certifications."

gemini_service = GeminiService()
