import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import SessionLocal, engine, Base
from app.database.models import User, Resume, ResumeAnalysis, JobAnalysis, ChatMessage
from app.core.security import hash_password

def seed_database():
    print("Creating tables if they do not exist...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create Admin
        admin_email = "admin@gmail.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                name="System Administrator",
                email=admin_email,
                password_hash=hash_password("Admin@12345"),
                role="ADMIN"
            )
            db.add(admin)
            print(f"Created Admin account: {admin_email} / Admin@12345")
        else:
            print(f"Admin account {admin_email} already exists.")

        # 2. Create Student / Job Seeker
        student_email = "student@gmail.com"
        student = db.query(User).filter(User.email == student_email).first()
        if not student:
            student = User(
                name="Alex Rivers",
                email=student_email,
                password_hash=hash_password("Student@12345"),
                role="USER"
            )
            db.add(student)
            db.commit()
            db.refresh(student)
            print(f"Created Demo Student account: {student_email} / Student@12345")
        else:
            print(f"Student account {student_email} already exists.")

        # 3. Create Sample Resume if not exists
        sample_resume = db.query(Resume).filter(Resume.user_id == student.id).first()
        if not sample_resume:
            sample_text = """ALEX RIVERS
San Francisco, CA | alex.rivers@example.com | (555) 234-5678
LinkedIn: linkedin.com/in/alexrivers-dev | GitHub: github.com/alexrivers-code | Portfolio: alexrivers.dev

CAREER OBJECTIVE
Enthusiastic and detail-oriented Computer Science graduate with hands-on experience in full-stack web development, RESTful APIs, and cloud services. Seeking a Junior Software Engineer position to contribute to scalable web applications.

EDUCATION
Bachelor of Science in Computer Science
California State University, Long Beach
Graduation: May 2024 | GPA: 3.82 / 4.0

TECHNICAL SKILLS
- Programming Languages: Python, JavaScript (ES6+), TypeScript, SQL, HTML5, CSS3, C++
- Frameworks & Libraries: React.js, Next.js, FastAPI, Node.js, Express.js, Tailwind CSS
- Databases: PostgreSQL, SQLite, MongoDB, Redis
- Developer Tools: Git, GitHub, Docker, Postman, VS Code, Linux, Vite
- Cloud & Concepts: AWS (S3, EC2), RESTful APIs, Agile/Scrum, CI/CD, Microservices

PROJECTS
1. AI Code Reviewer Platform | React, FastAPI, Python, PostgreSQL, Gemini API
- Engineered a web-based code review assistant that automatically analyzes Python and JavaScript pull requests for syntax flaws and performance bottlenecks.
- Integrated Google Gemini API to generate actionable refactoring suggestions, reducing code review turnaround time by 35%.
- Implemented JWT-based user authentication and PostgreSQL database storage with SQLAlchemy ORM.

2. Campus Event Management Portal | React.js, Node.js, Express, MongoDB, Tailwind CSS
- Developed a responsive full-stack event discovery portal utilized by 1,200+ university students to register and track campus hackathons.
- Built real-time RSVP notification services and streamlined search filters by category and date.
- Achieved 98+ Google Lighthouse performance rating through code-splitting and asset optimization.

3. Distributed Task Queue Service | Python, Redis, Docker
- Architected an asynchronous background job processing system executing scheduled compute tasks with failure retries.
- Containerized development and deployment workflows utilizing Docker and Docker Compose.

WORK EXPERIENCE
Software Engineering Intern | TechSphere Innovations | June 2023 - August 2023
- Collaborated with a team of 5 engineers to develop and maintain customer-facing dashboard features using React.js.
- Optimized frontend bundle sizes by 28% through lazy loading and component modularization.
- Authored 30+ comprehensive unit and integration tests using Jest and React Testing Library.

CERTIFICATIONS
- AWS Certified Cloud Practitioner (2023)
- Meta Front-End Developer Professional Certificate (Coursera, 2023)

ACHIEVEMENTS
- 1st Place Winner, CSU Annual Hackathon (2023) - Built an accessibility tool for visually impaired web users.
- Dean's Honor List for 6 consecutive academic semesters.
"""

            sample_resume = Resume(
                user_id=student.id,
                file_name="Alex_Rivers_Resume.pdf",
                file_type="pdf",
                file_size=142850,
                extracted_text=sample_text
            )
            db.add(sample_resume)
            db.commit()
            db.refresh(sample_resume)
            print("Created sample resume for demo student.")

            # 4. Create Analysis for this resume
            sample_analysis = ResumeAnalysis(
                resume_id=sample_resume.id,
                ats_score=86,
                ats_breakdown={
                    "contact_information": 100,
                    "section_structure": 95,
                    "skills": 90,
                    "keywords": 82,
                    "projects": 85,
                    "readability": 90
                },
                personal_info={
                    "name": "Alex Rivers",
                    "email": "alex.rivers@example.com",
                    "phone": "(555) 234-5678",
                    "linkedin": "linkedin.com/in/alexrivers-dev",
                    "github": "github.com/alexrivers-code",
                    "portfolio": "alexrivers.dev"
                },
                education=[
                    {
                        "degree": "Bachelor of Science in Computer Science",
                        "college": "California State University, Long Beach",
                        "graduation_year": "May 2024",
                        "cgpa_percentage": "3.82 / 4.0"
                    }
                ],
                skills={
                    "programming_languages": ["Python", "JavaScript (ES6+)", "TypeScript", "SQL", "C++", "HTML5", "CSS3"],
                    "frameworks": ["React.js", "Next.js", "FastAPI", "Node.js", "Express.js", "Tailwind CSS"],
                    "databases": ["PostgreSQL", "SQLite", "MongoDB", "Redis"],
                    "tools": ["Git", "GitHub", "Docker", "Postman", "VS Code", "Linux", "Vite"],
                    "cloud": ["AWS (S3, EC2)"],
                    "ai_ml": ["Gemini API", "Prompt Engineering"],
                    "other": ["RESTful APIs", "Agile/Scrum", "CI/CD", "Microservices"]
                },
                projects=[
                    {
                        "name": "AI Code Reviewer Platform",
                        "technologies": ["React", "FastAPI", "Python", "PostgreSQL", "Gemini API"],
                        "description": "Engineered a web-based code review assistant that automatically analyzes pull requests for syntax flaws and performance bottlenecks.",
                        "key_contributions": [
                            "Integrated Google Gemini API to generate actionable refactoring suggestions, reducing turnaround by 35%",
                            "Implemented JWT-based authentication and PostgreSQL database storage"
                        ]
                    },
                    {
                        "name": "Campus Event Management Portal",
                        "technologies": ["React.js", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
                        "description": "Developed a responsive full-stack event discovery portal utilized by 1,200+ university students to register and track campus hackathons.",
                        "key_contributions": [
                            "Built real-time RSVP notification services and streamlined search filters",
                            "Achieved 98+ Google Lighthouse performance rating through code-splitting"
                        ]
                    },
                    {
                        "name": "Distributed Task Queue Service",
                        "technologies": ["Python", "Redis", "Docker"],
                        "description": "Architected an asynchronous background job processing system executing scheduled compute tasks with failure retries.",
                        "key_contributions": [
                            "Containerized development workflows with Docker and Docker Compose"
                        ]
                    }
                ],
                experience=[
                    {
                        "company": "TechSphere Innovations",
                        "role": "Software Engineering Intern",
                        "duration": "June 2023 - August 2023",
                        "responsibilities": [
                            "Collaborated with a team of 5 engineers to develop and maintain customer-facing dashboard features using React.js",
                            "Optimized frontend bundle sizes by 28% through lazy loading and component modularization",
                            "Authored 30+ comprehensive unit and integration tests using Jest and React Testing Library"
                        ]
                    }
                ],
                certifications=[
                    "AWS Certified Cloud Practitioner (2023)",
                    "Meta Front-End Developer Professional Certificate (Coursera, 2023)"
                ],
                achievements=[
                    "1st Place Winner, CSU Annual Hackathon (2023) - Built an accessibility tool for visually impaired web users",
                    "Dean's Honor List for 6 consecutive academic semesters"
                ],
                strengths=[
                    "Complete contact info detected (Email, Phone, LinkedIn, GitHub, Portfolio)",
                    "Dedicated technical skills section detected with clear taxonomy",
                    "Strong project portfolio highlighting 3 distinct practical implementations",
                    "Effective use of impactful action verbs (Engineered, Integrated, Developed, Architected)",
                    "Quantifiable metrics and percentages present in project & internship bullet points"
                ],
                weaknesses=[
                    "Consider expanding AWS cloud capabilities into serverless patterns (Lambda, API Gateway)",
                    "Add testing frameworks (Jest, PyTest) explicitly to technical skills list",
                    "Ensure bullet points in the Distributed Task Queue project also highlight concrete throughput numbers"
                ],
                suggestions=[
                    {
                        "current": "Worked on backend using Python and database.",
                        "suggested": "Engineered scalable RESTful API endpoints using Python and optimized database queries to enhance response times.",
                        "reason": "Uses proactive action verbs ('Engineered', 'Optimized') and specifies clear technical responsibilities."
                    },
                    {
                        "current": "Made frontend in React.",
                        "suggested": "Architected a responsive, component-driven user interface with React.js and Tailwind CSS for seamless cross-device usability.",
                        "reason": "Replaces generic phrasing with industry-standard terminology and specifies key frontend frameworks."
                    }
                ],
                detected_sections={
                    "education": True,
                    "skills": True,
                    "projects": True,
                    "experience": True,
                    "certifications": True,
                    "achievements": True,
                    "summary": True
                }
            )
            db.add(sample_analysis)

            # 5. Create Sample Job Match
            sample_job = JobAnalysis(
                resume_id=sample_resume.id,
                job_title="Full Stack Software Engineer (Junior/Associate)",
                company="CloudTech Solutions",
                job_description="""We are seeking a talented Junior Full Stack Software Engineer to join our agile product engineering team.
You will build responsive, user-friendly frontend web interfaces with React and design reliable backend APIs using Python/FastAPI and Node.js.
Requirements:
- Strong proficiency in Python, JavaScript, and modern React.js
- Experience working with relational databases like PostgreSQL
- Familiarity with RESTful APIs, Git version control, and Docker containerization
- Basic knowledge of AWS cloud services is a plus
- Passion for writing clean, maintainable, and testable code
- Excellent collaboration and problem-solving skills""",
                match_score=84,
                matched_skills=["Python", "JavaScript", "React.js", "FastAPI", "PostgreSQL", "Git", "Docker", "AWS", "REST APIs"],
                missing_skills=["Kubernetes", "GraphQL", "CI/CD Pipelines"],
                keywords=["Full Stack", "Agile", "APIs", "Collaboration", "Clean Code"],
                experience_match="Good",
                suggestions=[
                    "Ensure your strongest matched skills (Python, React.js, FastAPI) appear prominently in your top skills list.",
                    "Highlight your Docker containerization experience in your distributed task queue project.",
                    "Review basic CI/CD pipeline principles to comfortably address deployment questions in interviews."
                ]
            )
            db.add(sample_job)

            # 6. Create sample chat messages
            sample_chat1 = ChatMessage(
                user_id=student.id,
                resume_id=sample_resume.id,
                role="user",
                message="What are the strongest parts of my resume?"
            )
            sample_chat2 = ChatMessage(
                user_id=student.id,
                resume_id=sample_resume.id,
                role="assistant",
                message="Your resume is well-structured! Its three standout strengths are:\n1. **High Impact Projects**: You clearly describe full-stack applications with concrete technologies and measurable outcomes (e.g., '35% turnaround reduction', '1,200+ users').\n2. **Clean Skill Taxonomy**: Your skills are separated into logical categories (Languages, Frameworks, Databases, Tools), making it easy for both ATS parsers and hiring managers to scan.\n3. **Internship Experience**: Having practical experience with code review, bundle optimization, and automated testing makes you a competitive candidate for Junior Software Engineer roles."
            )
            db.add(sample_chat1)
            db.add(sample_chat2)

            db.commit()
            print("Successfully seeded sample resume, analysis, job match, and chat history.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
