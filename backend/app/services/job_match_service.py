import re
import logging
from typing import Dict, Any, List, Set
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

TECH_SKILLS_DICTIONARY = {
    # Programming Languages
    "python", "javascript", "typescript", "java", "c++", "c", "c#", "ruby", "go", "golang",
    "php", "rust", "kotlin", "swift", "dart", "html", "html5", "css", "css3", "sql", "pl/sql",
    "r", "scala", "bash", "shell", "powershell", "perl",

    # Frontend & Mobile Frameworks
    "react", "react.js", "next.js", "vue", "vue.js", "nuxt.js", "angular", "svelte", "jquery",
    "react native", "flutter", "ionic", "tailwind", "tailwind css", "bootstrap", "sass", "less",
    "material ui", "chakra ui", "redux", "zustand", "mobx", "vite", "webpack",

    # Backend & API Frameworks
    "node", "node.js", "express", "express.js", "fastapi", "django", "flask", "spring", "spring boot",
    "asp.net", ".net", ".net core", "laravel", "ruby on rails", "nest.js", "graphql", "apollo",
    "grpc", "rest", "rest api", "restful", "restful api", "soap", "websocket", "websockets",

    # Databases & Caching
    "postgresql", "postgres", "mysql", "sqlite", "mongodb", "redis", "firebase", "firestore",
    "dynamodb", "cassandra", "oracle", "mariadb", "elasticsearch", "sql server", "supabase",
    "neo4j", "couchdb", "memcached",

    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "ci/cd", "jenkins",
    "github actions", "gitlab ci", "terraform", "ansible", "helm", "linux", "unix", "nginx",
    "apache", "cloudwatch", "prometheus", "grafana", "datadog", "splunk",

    # Testing & QA
    "qa", "quality assurance", "testing", "unit testing", "integration testing", "automation testing",
    "manual testing", "selenium", "cypress", "playwright", "jest", "mocha", "pytest", "junit",
    "testng", "postman", "swagger", "openapi", "insomnia", "soapui", "load testing", "jmeter",

    # Enterprise, Support, & Project Tools
    "jira", "confluence", "trello", "asana", "servicenow", "workday", "salesforce", "sap",
    "mulesoft", "anypoint", "production support", "incident management", "troubleshooting",
    "root cause analysis", "log analysis", "monitoring", "deployments", "ticket resolution",

    # Version Control & Collaboration
    "git", "github", "gitlab", "bitbucket",

    # AI, ML & Data
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "opencv", "data analysis", "data science", "tableau",
    "power bi", "etl", "big data", "spark", "hadoop", "gemini", "openai", "llm",

    # Architecture, Methodologies & Security
    "agile", "scrum", "kanban", "sdlc", "microservices", "oop", "system design", "orm",
    "sso", "saml", "oauth", "oauth2", "jwt", "iam", "cybersecurity", "client communication",
    "stakeholder management"
}

SKILL_NAME_MAPPING = {
    "c++": "C++",
    "c#": "C#",
    "aws": "AWS",
    "gcp": "GCP",
    "ci/cd": "CI/CD",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "sql": "SQL",
    "nosql": "NoSQL",
    "pl/sql": "PL/SQL",
    "nlp": "NLP",
    "llm": "LLM",
    "jwt": "JWT",
    "rest api": "REST APIs",
    "rest": "REST APIs",
    "restful": "RESTful APIs",
    "restful api": "RESTful APIs",
    "soap": "SOAP",
    "grpc": "gRPC",
    "oop": "OOP",
    "orm": "ORM",
    "react.js": "React.js",
    "node.js": "Node.js",
    "vue.js": "Vue.js",
    "next.js": "Next.js",
    "nuxt.js": "Nuxt.js",
    "nest.js": "Nest.js",
    "tailwind css": "Tailwind CSS",
    "jira": "Jira",
    "qa": "QA Testing",
    "sso": "SSO",
    "saml": "SAML",
    "oauth": "OAuth2",
    "oauth2": "OAuth2",
    "iam": "IAM",
    "workday": "Workday",
    "anypoint": "Anypoint Platform",
    "mulesoft": "MuleSoft",
    "servicenow": "ServiceNow",
    "postman": "Postman",
    "sdlc": "SDLC",
    "k8s": "Kubernetes",
    "github actions": "GitHub Actions",
    "production support": "Production Support",
    "root cause analysis": "Root Cause Analysis",
    "log analysis": "Log Analysis",
    "incident management": "Incident Management",
    "client communication": "Client Communication"
}

def format_skill_name(skill: str) -> str:
    """Formats raw skill key to a polished display name."""
    s_clean = skill.lower().strip()
    if s_clean in SKILL_NAME_MAPPING:
        return SKILL_NAME_MAPPING[s_clean]
    return skill.strip().title()

def extract_skills_and_keywords(text: str) -> Set[str]:
    """Extracts known tech skills, tools, and domain keywords from a block of text."""
    text_lower = text.lower()
    found = set()
    for skill in TECH_SKILLS_DICTIONARY:
        pattern = rf'(?:^|[\s,;()./:\-\[\]])({re.escape(skill)})(?:$|[\s,;()./:\-\[\]])'
        if re.search(pattern, text_lower):
            found.add(skill)
    return found

def extract_domain_terms_from_jd(jd_text: str) -> Set[str]:
    """Extracts additional requirement phrases when standard dictionary coverage is limited."""
    found = set()
    patterns = [
        r'(?:experience with|knowledge of|proficient in|familiarity with|hands-on with|skills in|understanding of)\s+([A-Za-z0-9\s/+#\.-]{3,35})(?:[,.\n;]|$)',
        r'(?:responsible for|working with|reviewing|monitoring|coordinating|implementing)\s+([A-Za-z0-9\s/+#\.-]{3,35})(?:[,.\n;]|$)',
    ]
    for p in patterns:
        matches = re.findall(p, jd_text, re.IGNORECASE)
        for m in matches:
            clean = m.strip().lower()
            if len(clean) > 3 and not any(clean.startswith(w) for w in ["a ", "an ", "the ", "our "]):
                words = clean.split()
                if len(words) <= 3:
                    found.add(" ".join(words))
    return found

async def analyze_job_match(
    resume_text: str,
    job_title: str,
    job_description: str,
    resume_analysis: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Compares resume content against job description.
    Uses Gemini AI if available; otherwise uses high-precision heuristic matcher.
    """
    # 1. Try Gemini AI if available
    if gemini_service.client:
        try:
            ai_result = await gemini_service.match_job_with_gemini(
                resume_text=resume_text,
                job_title=job_title,
                job_description=job_description,
                resume_analysis=resume_analysis
            )
            if ai_result:
                return ai_result
        except Exception as e:
            logger.warning(f"Fallback to heuristic job matcher due to Gemini error: {e}")

    # 2. Enhanced Heuristic Match Engine
    resume_text_lower = resume_text.lower()
    jd_lower = job_description.lower()

    # Extract skills from resume text
    extracted_resume_skills = extract_skills_and_keywords(resume_text_lower)

    # Merge structured skills from analysis if available
    skills_obj = resume_analysis.get("skills", {})
    if isinstance(skills_obj, dict):
        for cat, skills_list in skills_obj.items():
            if isinstance(skills_list, list):
                for s in skills_list:
                    extracted_resume_skills.add(s.lower().strip())

    # Extract required skills from JD
    jd_skills = extract_skills_and_keywords(jd_lower)

    # If JD skills are sparse, extract domain phrases from requirements
    if len(jd_skills) < 3:
        domain_terms = extract_domain_terms_from_jd(job_description)
        jd_skills.update(list(domain_terms)[:6])

    # If still empty, fall back to sensible baseline
    if not jd_skills:
        words = set(re.findall(r'\b[a-z]{4,}\b', jd_lower))
        jd_skills = {w for w in words if w in TECH_SKILLS_DICTIONARY}
        if not jd_skills:
            jd_skills = {"python", "sql", "git", "rest api"}

    matched_set = {s for s in jd_skills if any(
        s == rs or (len(s) > 3 and s in rs) or (len(rs) > 3 and rs in s)
        for rs in extracted_resume_skills
    )}
    missing_set = jd_skills - matched_set

    # Calculate skill match ratio
    total_jd_skills = len(jd_skills)
    matched_count = len(matched_set)
    skill_ratio = matched_count / total_jd_skills if total_jd_skills > 0 else 0.5

    # Check Title Match
    title_words = [w for w in job_title.lower().split() if len(w) > 3 and w not in ["with", "from", "lead", "role"]]
    title_match = any(w in resume_text_lower for w in title_words)

    # Experience indicators
    has_experience_section = bool(resume_analysis.get("experience"))
    has_internship = "intern" in resume_text_lower or "internship" in resume_text_lower
    exp_words = ["senior", "lead", "staff", "architect", "5+ years", "3+ years", "years of experience"]
    jd_demands_senior = any(ew in jd_lower for ew in exp_words)

    if jd_demands_senior and not has_experience_section:
        experience_match = "Limited"
    elif has_experience_section or has_internship:
        experience_match = "Good"
    else:
        experience_match = "Partial"

    # Base match score computation:
    # 60% weight on skill match ratio, 20% on title alignment, 20% on experience depth
    skill_component = skill_ratio * 60
    title_component = 20 if title_match else 5
    exp_component = 20 if experience_match == "Good" else (12 if experience_match == "Partial" else 5)

    raw_score = int(round(skill_component + title_component + exp_component))
    # Bound realistically between 15% and 96%
    match_score = max(15, min(96, raw_score))

    matched_skills = [format_skill_name(s) for s in sorted(matched_set)]
    missing_skills = [format_skill_name(s) for s in sorted(missing_set)]

    # Important keywords from job description (high-frequency technical/domain terms)
    jd_words = re.findall(r'\b[a-z]{4,}\b', jd_lower)
    stop_words = {
        "with", "that", "this", "from", "have", "will", "your", "must", "work", "team",
        "year", "years", "role", "join", "help", "good", "well", "being", "across",
        "make", "sure", "mode", "pings", "both", "also", "into", "their"
    }
    meaningful_words = [w for w in jd_words if w not in stop_words and w not in jd_skills]
    keyword_freq = {}
    for w in meaningful_words:
        keyword_freq[w] = keyword_freq.get(w, 0) + 1
    sorted_keywords = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)
    relevant_keywords = [w[0].title() for w in sorted_keywords[:7]] if sorted_keywords else ["Software Engineering", "Problem Solving", "System Integration"]

    # Actionable suggestions adhering strictly to truthful resume building
    suggestions = []
    if missing_skills:
        missing_preview = ", ".join(missing_skills[:4])
        suggestions.append(f"Consider learning or building small demonstrator projects for key missing skills: {missing_preview}.")
        suggestions.append("IMPORTANT: Only list technical skills on your resume that you genuinely understand and can discuss in an interview.")
    else:
        suggestions.append("Great alignment! You cover all primary technical competencies extracted from the job posting.")

    if matched_skills:
        matched_preview = ", ".join(matched_skills[:3])
        suggestions.append(f"Ensure your strongest matched skills ({matched_preview}) appear prominently in your top skills list and project descriptions.")

    suggestions.append(f"Align your resume's terminology with this role by naturally incorporating relevant industry keywords like {', '.join(relevant_keywords[:3])} in your project bullet points.")

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "keywords": relevant_keywords,
        "experience_match": experience_match,
        "suggestions": suggestions
    }
