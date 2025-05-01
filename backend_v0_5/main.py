from fastapi import FastAPI, Depends
from auth import router as auth_router, get_current_user
from routers import introduction, attestation, consent, data_use, data_subject_request, trace, check

app = FastAPI(
    title="Otrace API V1",
    swagger_ui_parameters={"persistAuthorization": True},
)

# Apply authentication globally
app.dependency_overrides[get_current_user] = get_current_user

# Public routes
app.include_router(auth_router, prefix="/auth")

# Secure routers
for router in [introduction.router, attestation.router, consent.router, data_use.router, data_subject_request.router, trace.router, check.router]:
    app.include_router(router, dependencies=[Depends(get_current_user)])

@app.get("/")
def home():
    return {"message": "Welcome to OTrace V1 FastAPI Version!"}
