"""
Google OAuth2 Service — verifies Google ID tokens sent from the client.

Flow:
  1. Frontend signs in with Google and gets an id_token
  2. Frontend sends id_token to our /auth/google endpoint
  3. We verify the token with Google's public keys
  4. Extract user info (email, name, picture, google_id)
"""

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException, status

from app.config import settings


class GoogleUserInfo:
    def __init__(self, google_id: str, email: str, full_name: str, picture: str | None):
        self.google_id = google_id
        self.email = email
        self.full_name = full_name
        self.picture = picture


def verify_google_token(token: str) -> GoogleUserInfo:
    """
    Verify a Google ID token and extract user information.

    Args:
        token: Google ID token from client (e.g., from Google Sign-In SDK)

    Returns:
        GoogleUserInfo with verified user data

    Raises:
        HTTPException 401 — if token is invalid or audience mismatch
    """
    try:
        id_info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )

        # Ensure this is a valid Google token
        if id_info.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
            raise ValueError("Token issuer is not Google")

        return GoogleUserInfo(
            google_id=id_info["sub"],
            email=id_info["email"],
            full_name=id_info.get("name", id_info.get("email", "").split("@")[0]),
            picture=id_info.get("picture"),
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not verify Google credentials",
        )
