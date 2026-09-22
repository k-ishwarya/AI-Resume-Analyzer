import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("uvicorn")

def send_password_reset_email(to_email: str, reset_token: str, user_name: Optional[str] = None) -> bool:
    """
    Sends a secure password reset link via SMTP if configured,
    and logs the one-click reset link to the console for development testing.
    """
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    greeting = f"Hi {user_name}," if user_name else "Hello,"

    # Prominent console output for development / local testing (ASCII-safe for Windows console)
    print("\n" + "=" * 80)
    print(f"[*] [PASSWORD RESET REQUEST] For: {to_email}")
    print(f"[*] One-Click Reset Link (Valid for 15 mins):")
    print(f"    {reset_url}")
    print("=" * 80 + "\n")


    # If SMTP is configured, attempt real email transmission
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            sender = settings.EMAILS_FROM_EMAIL or settings.SMTP_USER
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Reset your password - {settings.APP_NAME}"
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{sender}>"
            msg["To"] = to_email

            text_body = f"""{greeting}

We received a request to reset your password for your {settings.APP_NAME} account.

Please visit the link below to set a new password (valid for 15 minutes):
{reset_url}

If you did not request a password reset, you can safely ignore this email.
"""

            html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }}
    .container {{ max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }}
    .logo {{ display: inline-flex; align-items: center; gap: 8px; font-weight: 800; font-size: 18px; color: #4f46e5; margin-bottom: 24px; }}
    .btn {{ display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: 600; padding: 12px 28px; border-radius: 10px; text-decoration: none; margin: 20px 0; font-size: 14px; }}
    .footer {{ font-size: 11px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }}
    .link-box {{ font-size: 12px; color: #64748b; word-break: break-all; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡ {settings.APP_NAME}</div>
    <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; color: #0f172a;">Password Reset Request</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">{greeting}</p>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      We received a request to reset the password associated with your account. Click the button below to choose a new password:
    </p>
    <div style="text-align: center;">
      <a href="{reset_url}" class="btn">Reset Password</a>
    </div>
    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
      <strong>Note:</strong> This link is valid for <strong>15 minutes</strong> and can only be used once.
    </p>
    <div class="link-box">
      If the button above does not work, copy and paste this URL into your browser:<br>
      <a href="{reset_url}" style="color: #4f46e5;">{reset_url}</a>
    </div>
    <div class="footer">
      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </div>
  </div>
</body>
</html>
"""

            msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            clean_password = settings.SMTP_PASSWORD.replace(" ", "").strip() if settings.SMTP_PASSWORD else ""
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.login(settings.SMTP_USER, clean_password)
                server.sendmail(sender, to_email, msg.as_string())


            logger.info(f"Password reset email sent via SMTP to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email via SMTP to {to_email}: {e}")
            return False

    return True
