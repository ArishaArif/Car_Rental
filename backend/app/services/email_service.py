"""
Email service using Resend.com API.
Sends OTP emails with a professional HTML template.
"""

import resend
from app.config import settings

resend.api_key = settings.RESEND_API_KEY


def _build_otp_email_html(full_name: str, otp_code: str, purpose: str, expire_minutes: int) -> str:
    """Build a premium HTML email for OTP delivery."""
    action = "verify your email" if purpose == "email_verification" else "reset your password"
    title = "Email Verification" if purpose == "email_verification" else "Password Reset"

    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title} — Car Rental</title>
    </head>
    <body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0"
              style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
                     border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#6C63FF,#FF6584);
                            padding:32px;text-align:center;">
                  <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;
                              letter-spacing:-0.5px;">🚗 Car Rental</h1>
                  <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">
                    {title}
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <p style="color:#e2e8f0;font-size:16px;margin:0 0 16px;">
                    Hi <strong>{full_name}</strong>,
                  </p>
                  <p style="color:#a0aec0;font-size:15px;line-height:1.6;margin:0 0 32px;">
                    Use the verification code below to {action}.
                    This code expires in <strong style="color:#fff;">{expire_minutes} minutes</strong>.
                  </p>

                  <!-- OTP Box -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <div style="background:rgba(108,99,255,0.15);border:2px solid #6C63FF;
                                    border-radius:12px;padding:24px 40px;display:inline-block;">
                          <span style="font-size:42px;font-weight:800;letter-spacing:14px;
                                       color:#fff;font-family:monospace;">{otp_code}</span>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <p style="color:#718096;font-size:13px;margin:32px 0 0;line-height:1.6;">
                    If you didn't request this, you can safely ignore this email.
                    Never share this code with anyone.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px 32px;border-top:1px solid rgba(255,255,255,0.06);">
                  <p style="color:#4a5568;font-size:12px;margin:0;text-align:center;">
                    © 2025 Car Rental. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """


import httpx

async def send_otp_email(
    recipient_email: str,
    full_name: str,
    otp_code: str,
    purpose: str = "email_verification",
) -> bool:
    """
    Send an OTP email with Brevo (Primary) and Resend (Fallback).

    Args:
        recipient_email: Target email address
        full_name: User's display name
        otp_code: The 6-digit OTP
        purpose: 'email_verification' | 'password_reset'

    Returns:
        True on success, False on failure
    """
    print(f"[EmailService] >>> OTP Code for {recipient_email} ({purpose}): {otp_code} <<<")
    subjects = {
        "email_verification": "🔐 Verify Your Email — Car Rental",
        "password_reset": "🔑 Reset Your Password — Car Rental",
    }
    subject = subjects.get(purpose, "Your OTP Code — Car Rental")
    html_content = _build_otp_email_html(
        full_name=full_name,
        otp_code=otp_code,
        purpose=purpose,
        expire_minutes=settings.OTP_EXPIRE_MINUTES,
    )

    # 1. Primary Delivery: Brevo API (Supports sending to any user email)
    if settings.BREVO_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.brevo.com/v3/smtp/email",
                    headers={
                        "api-key": settings.BREVO_API_KEY,
                        "Content-Type": "application/json",
                    },
                    json={
                        "sender": {
                            "name": settings.BREVO_SENDER_NAME,
                            "email": settings.BREVO_SENDER_EMAIL,
                        },
                        "to": [{"email": recipient_email, "name": full_name}],
                        "subject": subject,
                        "htmlContent": html_content,
                    },
                )
                if res.status_code in (200, 201, 202):
                    print(f"[EmailService] Brevo email successfully delivered to {recipient_email}")
                    return True
                else:
                    print(f"[EmailService] Brevo returned {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[EmailService] Brevo request failed: {e}")

    # 2. Fallback Delivery: Resend API
    try:
        resend.api_key = settings.RESEND_API_KEY
        from_email = settings.RESEND_FROM_EMAIL
        if not from_email or "yourdomain.com" in from_email:
            from_email = "Velox Security <onboarding@resend.dev>"

        params = {
            "from": from_email,
            "to": [recipient_email],
            "subject": subject,
            "html": html_content,
        }
        resend.Emails.send(params)
        print(f"[EmailService] Resend email successfully delivered to {recipient_email}")
        return True
    except Exception as e:
        print(f"[EmailService] Failed to send email to {recipient_email}: {e}")
        return False
