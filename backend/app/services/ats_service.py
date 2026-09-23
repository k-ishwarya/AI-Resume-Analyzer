import re
from typing import Dict, Any, List, Optional

# ─── Strong Action Verbs (what good resumes should use) ───────────────────────
ACTION_VERBS = {
    "developed", "built", "engineered", "designed", "implemented", "optimized",
    "created", "deployed", "spearheaded", "architected", "integrated", "automated",
    "managed", "collaborated", "reduced", "increased", "boosted", "accelerated",
    "refactored", "orchestrated", "executed", "configured", "debugged", "resolved",
    "analyzed", "delivered", "established", "improved", "launched", "led",
    "maintained", "migrated", "published", "scaled", "streamlined", "tested",
    "transformed", "upgraded", "visualized", "wrote", "coordinated", "directed",
    "drove", "evaluated", "generated", "handled", "identified", "mentored",
    "monitored", "planned", "researched", "reviewed", "simplified", "supported",
}

# ─── Passive / Weak phrases to penalize ──────────────────────────────────────
PASSIVE_PATTERNS = [
    r"\bwas (responsible|involved|tasked|asked|able)\b",
    r"\bhelped (with|to)\b",
    r"\bworked on\b",
    r"\bassisted (with|in|to)\b",
    r"\bwas part of\b",
    r"\bgained (experience|exposure|knowledge)\b",
    r"\blearned (about|to)\b",
    r"\bexposed to\b",
    r"\bfamiliar with\b",
    r"\bpart of a team\b",
    r"\bknowledge of\b",
]

# ─── Real metric patterns ─────────────────────────────────────────────────────
METRIC_PATTERNS = [
    r"\b\d+\s*%",                         # 20%, 50 %
    r"\b\d+\s*x\b",                       # 3x faster
    r"\$\s*\d+",                          # $50k
    r"\b\d{2,}\s*(users|requests|clients|students|records|features|transactions|endpoints|members|servers)\b",
    r"\b(reduced|increased|improved|boosted|decreased|accelerated).{1,40}\b\d+",
    r"\b\d+\s*(ms|seconds|hours|days|weeks)\b",
]

STANDARD_SECTIONS = {
    "education": ["education", "academic", "qualification", "degree"],
    "skills": ["skills", "technical skills", "technologies", "proficiencies", "competencies"],
    "projects": ["projects", "personal projects", "academic projects", "key projects"],
    "experience": ["experience", "work experience", "employment", "internships", "professional experience"],
    "certifications": ["certifications", "certificates", "licenses"],
    "achievements": ["achievements", "accomplishments", "awards", "honors"],
    "summary": ["summary", "professional summary", "about me", "profile", "objective"],
}


def detect_sections(text: str, parsed_info: Optional[Dict[str, Any]] = None) -> Dict[str, bool]:
    text_lower = text.lower()
    detected = {}
    for section_name, keywords in STANDARD_SECTIONS.items():
        detected[section_name] = any(
            re.search(rf'(?:^|\n|[\s,;:]){re.escape(kw)}(?:$|\n|[\s,;:])', text_lower) for kw in keywords
        )
    if parsed_info:
        if parsed_info.get("education") and len(parsed_info["education"]) > 0:
            detected["education"] = True
        skills_obj = parsed_info.get("skills", {})
        if (isinstance(skills_obj, dict) and any(skills_obj.values())) or (isinstance(skills_obj, list) and skills_obj):
            detected["skills"] = True
        if parsed_info.get("projects") and len(parsed_info["projects"]) > 0:
            detected["projects"] = True
        if parsed_info.get("experience") and len(parsed_info["experience"]) > 0:
            detected["experience"] = True
        if parsed_info.get("certifications") and len(parsed_info["certifications"]) > 0:
            detected["certifications"] = True
        if parsed_info.get("achievements") and len(parsed_info["achievements"]) > 0:
            detected["achievements"] = True
    return detected


def _count_passive_sentences(text: str) -> int:
    """Count bullet points / sentences that use weak or passive language."""
    count = 0
    text_lower = text.lower()
    for pattern in PASSIVE_PATTERNS:
        matches = re.findall(pattern, text_lower)
        count += len(matches)
    return count


def _count_real_metrics(text: str) -> int:
    """Count genuine quantifiable metric instances in the text."""
    count = 0
    for pattern in METRIC_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        count += len(matches)
    return count


def _count_bullet_points(text: str) -> int:
    """Estimate number of bullet points (lines starting with -, •, *, or digit.)"""
    lines = text.split('\n')
    return sum(1 for line in lines if re.match(r'^\s*[-•*●▪▸◦]|\s*\d+[.)]\s+', line.strip()))


def calculate_ats_metrics(text: str, parsed_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Production-grade ATS scoring engine.
    Penalizes passive language, rewards quantifiable metrics,
    and evaluates sentence quality — matching industry tool behavior.
    """
    text_lower = text.lower()
    detected_sections = detect_sections(text, parsed_info)

    # ── 1. Contact Info Score (max 100) — 12% weight ─────────────────────────
    contact_score = 0
    personal = parsed_info.get("personal_info", {})
    if personal.get("name") and len(str(personal["name"]).strip()) > 1:
        contact_score += 25
    if personal.get("email") and "@" in str(personal["email"]):
        contact_score += 25
    if personal.get("phone") and len(re.findall(r'\d', str(personal["phone"]))) >= 7:
        contact_score += 20
    if personal.get("linkedin"):
        contact_score += 15
    if personal.get("github") or personal.get("portfolio"):
        contact_score += 15
    contact_score = min(100, max(0, contact_score))

    # ── 2. Section Structure Score (max 100) — 15% weight ────────────────────
    structure_score = 0
    if detected_sections.get("education"):   structure_score += 20
    if detected_sections.get("skills"):      structure_score += 25
    if detected_sections.get("projects"):    structure_score += 20
    if detected_sections.get("experience"):  structure_score += 20
    if detected_sections.get("summary"):     structure_score += 10
    if detected_sections.get("certifications") or detected_sections.get("achievements"):
        structure_score += 5
    structure_score = min(100, max(0, structure_score))

    # ── 3. Skills Score (max 100) — 20% weight ───────────────────────────────
    skills_data = parsed_info.get("skills", {})
    total_skills = 0
    if isinstance(skills_data, dict):
        for cat, skills_list in skills_data.items():
            if isinstance(skills_list, list):
                total_skills += len([s for s in skills_list if s and str(s).strip()])
    elif isinstance(skills_data, list):
        total_skills = len([s for s in skills_data if s and str(s).strip()])

    if total_skills >= 18:
        skills_score = 100
    elif total_skills >= 14:
        skills_score = 85
    elif total_skills >= 10:
        skills_score = 70
    elif total_skills >= 7:
        skills_score = 55
    elif total_skills >= 4:
        skills_score = 35
    elif total_skills >= 1:
        skills_score = 20
    else:
        skills_score = 0

    # ── 4. Keyword & Action Verb Quality (max 100) — 15% weight ──────────────
    words = re.findall(r'\b[a-z]{3,}\b', text_lower)
    found_verbs = [w for w in set(words) if w in ACTION_VERBS]
    verb_count = len(found_verbs)

    if verb_count >= 14:
        verb_base_score = 100
    elif verb_count >= 10:
        verb_base_score = 85
    elif verb_count >= 7:
        verb_base_score = 70
    elif verb_count >= 4:
        verb_base_score = 50
    elif verb_count >= 2:
        verb_base_score = 30
    else:
        verb_base_score = 10

    # Apply passive voice penalty: each passive phrase docks 8 points
    passive_count = _count_passive_sentences(text)
    passive_penalty = min(50, passive_count * 8)
    keywords_score = max(0, verb_base_score - passive_penalty)

    # ── 5. Projects & Quantified Impact (max 100) — 18% weight ───────────────
    projects = parsed_info.get("projects", [])
    valid_projects = [p for p in projects if isinstance(p, dict) and p.get("name")]
    num_projects = len(valid_projects)
    metric_count = _count_real_metrics(text)
    bullet_count = _count_bullet_points(text)

    # Base score from project count
    if num_projects == 0:
        proj_base = 0
    elif num_projects == 1:
        proj_base = 40
    elif num_projects == 2:
        proj_base = 60
    elif num_projects == 3:
        proj_base = 75
    else:
        proj_base = 85

    # Metric bonus — reward actual quantification
    if metric_count >= 5:
        metric_bonus = 15
    elif metric_count >= 3:
        metric_bonus = 10
    elif metric_count >= 1:
        metric_bonus = 5
    else:
        metric_bonus = 0

    projects_score = min(100, proj_base + metric_bonus)

    # ── 6. Sentence Quality Score (max 100) — 10% weight ─────────────────────
    # New dimension: evaluates bullet point writing quality
    if bullet_count == 0:
        quality_score = 30  # No bullet points at all
    else:
        # What % of bullets are passive / weak?
        passive_ratio = min(passive_count / max(bullet_count, 1), 1.0)
        quality_score = round(100 - (passive_ratio * 70))

        # Bonus for having real metrics in bullets
        if metric_count >= 3:
            quality_score = min(100, quality_score + 15)
        elif metric_count >= 1:
            quality_score = min(100, quality_score + 8)

    # ── 7. Readability & Length (max 100) — 10% weight ───────────────────────
    word_count = len(text.split())
    if 350 <= word_count <= 900:
        readability_score = 100
    elif 250 <= word_count < 350 or 901 <= word_count <= 1100:
        readability_score = 80
    elif 150 <= word_count < 250 or 1101 <= word_count <= 1400:
        readability_score = 55
    elif word_count > 0:
        readability_score = 25
    else:
        readability_score = 0

    # ── Final Weighted Score ──────────────────────────────────────────────────
    overall_score = round(
        (contact_score   * 0.12) +
        (structure_score * 0.15) +
        (skills_score    * 0.20) +
        (keywords_score  * 0.15) +
        (projects_score  * 0.18) +
        (quality_score   * 0.10) +
        (readability_score * 0.10)
    )
    overall_score = max(0, min(100, overall_score))

    breakdown = {
        "contact_information": contact_score,
        "section_structure": structure_score,
        "technical_skills": skills_score,
        "keywords_and_verbs": keywords_score,
        "projects_and_impact": projects_score,
        "sentence_quality": quality_score,
        "readability_and_length": readability_score,
    }

    # ── Strengths ─────────────────────────────────────────────────────────────
    strengths = []
    if contact_score >= 80:
        strengths.append("Complete contact information with professional profile links")
    if total_skills >= 10:
        strengths.append(f"Strong technical skills section with {total_skills} verified competencies")
    if num_projects >= 2:
        strengths.append(f"Solid project portfolio demonstrating real-world experience ({num_projects} projects)")
    if detected_sections.get("experience"):
        strengths.append("Includes professional or internship work experience")
    if verb_count >= 7:
        strengths.append(f"Good use of action verbs ({', '.join(list(found_verbs)[:4])})")
    if metric_count >= 2:
        strengths.append(f"Quantifiable impact metrics found ({metric_count} instances)")
    if detected_sections.get("summary"):
        strengths.append("Includes a professional summary or career objective")

    # ── Weaknesses / Areas to Improve ─────────────────────────────────────────
    weaknesses = []
    if passive_count >= 2:
        weaknesses.append(
            f"Found {passive_count} weak or passive phrase(s) (e.g. 'was responsible for', 'worked on'). "
            "Replace with strong action verbs like 'Engineered', 'Optimized', 'Orchestrated'."
        )
    if metric_count == 0:
        weaknesses.append(
            "No quantifiable achievements found. Add real metrics: "
            "'Reduced API latency by 40%', 'Served 500+ users', 'Achieved 95% test coverage'."
        )
    elif metric_count < 3:
        weaknesses.append("Only a few metrics detected. Add more quantified results to strengthen impact.")
    if not personal.get("linkedin"):
        weaknesses.append("Add a LinkedIn profile URL to your contact section")
    if not personal.get("github") and not personal.get("portfolio"):
        weaknesses.append("Add a GitHub or portfolio link to showcase your projects")
    if not detected_sections.get("certifications"):
        weaknesses.append("Consider adding relevant certifications or online course credentials")
    if not detected_sections.get("summary"):
        weaknesses.append("Add a 2-3 line professional summary at the top to grab recruiter attention")
    if verb_count < 5:
        weaknesses.append("Increase use of strong action verbs — aim for at least 7-10 unique verbs")
    if total_skills < 10:
        weaknesses.append("Expand your skills section — aim for 10-15+ skills across categories")

    return {
        "overall_score": overall_score,
        "breakdown": breakdown,
        "strengths": strengths if strengths else ["Basic resume structure detected"],
        "weaknesses": weaknesses if weaknesses else ["Continue refining your project descriptions with stronger phrasing"],
        "detected_sections": detected_sections,
    }
