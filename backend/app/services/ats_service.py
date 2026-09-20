import re
from typing import Dict, Any, List

ACTION_VERBS = {
    "developed", "built", "engineered", "designed", "implemented", "optimized",
    "created", "deployed", "spearheaded", "architected", "integrated", "automated",
    "managed", "collaborated", "reduced", "increased", "boosted", "accelerated",
    "refactored", "orchestrated", "executed", "configured", "debugged", "resolved"
}

STANDARD_SECTIONS = {
    "education": ["education", "academic", "qualification", "degree"],
    "skills": ["skills", "technical skills", "technologies", "proficiencies", "competencies"],
    "projects": ["projects", "personal projects", "academic projects", "key projects"],
    "experience": ["experience", "work experience", "employment", "internships", "professional experience"],
    "certifications": ["certifications", "certificates", "licenses"],
    "achievements": ["achievements", "accomplishments", "awards", "honors"],
    "summary": ["summary", "professional summary", "about me", "profile", "objective"]
}

def detect_sections(text: str) -> Dict[str, bool]:
    text_lower = text.lower()
    detected = {}
    for section_name, keywords in STANDARD_SECTIONS.items():
        detected[section_name] = any(
            re.search(rf'\b{re.escape(kw)}\b', text_lower) for kw in keywords
        )
    return detected

def calculate_ats_metrics(text: str, parsed_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes a transparent, deterministic ATS Compatibility evaluation based on
    the extracted resume text and structured entities.
    """
    text_lower = text.lower()
    detected_sections = detect_sections(text)
    
    # 1. Contact Info Score (max 100)
    contact_score = 0
    personal = parsed_info.get("personal_info", {})
    if personal.get("name"): contact_score += 25
    if personal.get("email"): contact_score += 25
    if personal.get("phone"): contact_score += 20
    if personal.get("linkedin"): contact_score += 15
    if personal.get("github") or personal.get("portfolio"): contact_score += 15
    contact_score = min(100, max(20, contact_score))

    # 2. Section Structure Score (max 100)
    # Core: education, skills, projects are essential for students/freshers
    structure_score = 0
    if detected_sections.get("skills"): structure_score += 25
    if detected_sections.get("projects"): structure_score += 25
    if detected_sections.get("education"): structure_score += 25
    if detected_sections.get("experience"): structure_score += 15
    if detected_sections.get("summary"): structure_score += 5
    if detected_sections.get("certifications") or detected_sections.get("achievements"): structure_score += 5
    structure_score = min(100, max(30, structure_score))

    # 3. Skills Score (max 100)
    skills_data = parsed_info.get("skills", {})
    total_skills = 0
    if isinstance(skills_data, dict):
        for cat, skills_list in skills_data.items():
            if isinstance(skills_list, list):
                total_skills += len(skills_list)
    elif isinstance(skills_data, list):
        total_skills = len(skills_data)

    if total_skills >= 15:
        skills_score = 95
    elif total_skills >= 10:
        skills_score = 85
    elif total_skills >= 6:
        skills_score = 75
    elif total_skills >= 3:
        skills_score = 60
    else:
        skills_score = 40

    # 4. Keywords & Action Verbs (max 100)
    words = re.findall(r'\b[a-z]{3,}\b', text_lower)
    found_verbs = [w for w in set(words) if w in ACTION_VERBS]
    verb_ratio = len(found_verbs)
    if verb_ratio >= 10:
        keywords_score = 92
    elif verb_ratio >= 6:
        keywords_score = 82
    elif verb_ratio >= 3:
        keywords_score = 70
    else:
        keywords_score = 55

    # 5. Projects & Impact Metrics (max 100)
    projects = parsed_info.get("projects", [])
    has_metrics = bool(re.search(r'\b(\d+[\%kK\+]?|\$\d+)\b', text))
    projects_score = 60
    if len(projects) >= 3:
        projects_score += 25
    elif len(projects) >= 1:
        projects_score += 15
    if has_metrics:
        projects_score += 15
    projects_score = min(100, projects_score)

    # 6. Readability & Length (max 100)
    word_count = len(text.split())
    if 250 <= word_count <= 800:  # Ideal single/two-page resume
        readability_score = 92
    elif 150 <= word_count <= 1200:
        readability_score = 80
    else:
        readability_score = 65

    # Weighted overall score
    overall_score = round(
        (contact_score * 0.15) +
        (structure_score * 0.20) +
        (skills_score * 0.25) +
        (keywords_score * 0.15) +
        (projects_score * 0.15) +
        (readability_score * 0.10)
    )
    overall_score = max(25, min(98, overall_score))

    breakdown = {
        "contact_information": contact_score,
        "section_structure": structure_score,
        "skills": skills_score,
        "keywords": keywords_score,
        "projects": projects_score,
        "readability": readability_score
    }

    # Generate Strengths
    strengths = []
    if contact_score >= 80:
        strengths.append("Complete contact info detected (Email, Phone, Professional Profiles)")
    if detected_sections.get("skills"):
        strengths.append("Dedicated technical skills section detected with clear taxonomy")
    if detected_sections.get("projects") and len(projects) > 0:
        strengths.append(f"Strong project portfolio highlighting {len(projects)} distinct practical implementation(s)")
    if len(found_verbs) >= 5:
        strengths.append(f"Effective use of impactful action verbs ({', '.join(found_verbs[:4])})")
    if has_metrics:
        strengths.append("Quantifiable metrics or numbers found in bullet points")

    # Generate Areas to Improve
    weaknesses = []
    if not personal.get("linkedin") or not personal.get("github"):
        weaknesses.append("Missing active LinkedIn or GitHub portfolio links to verify hands-on code")
    if not has_metrics:
        weaknesses.append("Add measurable outcomes (e.g., '% latency reduced', 'X users supported', 'Y% accuracy')")
    if len(found_verbs) < 5:
        weaknesses.append("Replace passive descriptions with powerful action verbs (e.g., Engineered, Orchestrated, Optimized)")
    if not detected_sections.get("certifications"):
        weaknesses.append("Include relevant technical certifications or verified course credentials")
    if not detected_sections.get("summary"):
        weaknesses.append("Add a concise 2-3 line Career Objective / Professional Summary at the top")

    return {
        "overall_score": overall_score,
        "breakdown": breakdown,
        "strengths": strengths if strengths else ["Basic structure present"],
        "weaknesses": weaknesses if weaknesses else ["Continue optimizing project descriptions with modern frameworks"],
        "detected_sections": detected_sections
    }
