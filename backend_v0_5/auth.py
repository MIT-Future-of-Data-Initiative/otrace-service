import os
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

router = APIRouter()

load_dotenv()

username = os.getenv("MOCK_USER_NAME")
user_password = os.getenv("MOCK_USER_PASSWORD")
user_token = os.getenv("MOCK_USER_TOKEN")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if not username or user_password != form_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"access_token": user_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme)):
    if user_token == token:
        return {"username": username}
    raise HTTPException(status_code=401, detail="Invalid token")
