import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import SessionLocal
from app.database.models import User
from app.core.security import hash_password


def reset_admin_password():
    db = SessionLocal()

    try:
        admin = db.query(User).filter(
        User.email == "admin@gmail.com"
).first()

        if admin:
            new_hash = hash_password("Admin@12345")
            admin.password_hash = new_hash
            db.commit()

            print("Admin password reset successfully!")
            print("  Email: admin@gmail.com")
            print("  Password: Admin@12345")
            print(f"  Role: {admin.role}")

        else:
            print("No admin account found with email admin@resumeai.com")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    reset_admin_password()