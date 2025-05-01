from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from uuid import UUID, uuid4
from models.consent_model import Consent, User, Operator, Data, Operation, ConsentState
from firebase import db

router = APIRouter(prefix="/consents", tags=["Consents"])

# POST endpoint to offer a consent
@router.post("/offer/", response_model=Consent)
def offer_consent(expiry_timestamp: datetime, operator: Operator, user: User, data: Data, operations: List[Operation]):
    """
    Operator offers consent to the user for using certain data for certain operations until the expiry time.
    """
    _id = uuid4()
    consent = Consent(
        id=str(_id),
        operator=operator,
        user=user,
        data=data,
        operations_permitted=operations,
        expiry_timestamp=expiry_timestamp,
        state=ConsentState.offered,
    )

    db.collection("consents").document(consent.id).set(consent.model_dump())
    return consent

# POST endpoint to accept a consent
@router.post("/accept/{consent_id}/")
def accept_consent(consent_id: UUID, user: User):
    """
    User accepts an offered consent.
    """
    consent_ref = db.collection("consents").document(str(consent_id))
    consent_doc = consent_ref.get()

    if not consent_doc.exists:
        raise HTTPException(status_code=404, detail="Consent does not exist.")

    consent_data = consent_doc.to_dict()
    consent = Consent(**consent_data)

    if consent.user != user:
        raise HTTPException(status_code=400, detail="User does not match the consent's user")

    consent.state = ConsentState.accepted
    consent_ref.set(consent.model_dump())
    return consent

# POST endpoint to deny a consent
@router.post("/deny/{consent_id}/")
def deny_consent(consent_id: UUID, user: User):
    """
    User denies an offered consent.
    """
    consent_ref = db.collection("consents").document(str(consent_id))
    consent_doc = consent_ref.get()

    if not consent_doc.exists:
        raise HTTPException(status_code=404, detail="Consent does not exist.")

    consent_data = consent_doc.to_dict()
    consent = Consent(**consent_data)

    if consent.user != user:
        raise HTTPException(status_code=400, detail="User does not match the consent's user.")

    consent.state = ConsentState.denied
    consent_ref.set(consent.model_dump())
    return consent

# POST endpoint to revoke a consent
@router.post("/revoke/{consent_id}/")
def revoke_consent(consent_id: UUID, user: User):
    """
    User revokes a consent, moving it from accepted to denied.
    """
    consent_ref = db.collection("consents").document(str(consent_id))
    consent_doc = consent_ref.get()

    if not consent_doc.exists:
        raise HTTPException(status_code=404, detail="Consent does not exist.")

    consent_data = consent_doc.to_dict()
    consent = Consent(**consent_data)

    if consent.user != user:
        raise HTTPException(status_code=400, detail="User does not match the consent's user.")

    consent.state = ConsentState.revoked
    consent_ref.set(consent.model_dump())
    return consent

# GET endpoint to get a consent by ID
@router.get("/{consent_id}/", response_model=Consent)
def get_consent(consent_id: UUID):
    """
    Get a consent object by its ID.
    """
    consent_ref = db.collection("consents").document(str(consent_id))
    consent_doc = consent_ref.get()

    if consent_doc.exists:
        consent_data = consent_doc.to_dict()
        return Consent(**consent_data)

    raise HTTPException(status_code=404, detail="Consent not found")

# GET endpoint to list all consents for a user name
@router.get("/list/{user_name}/", response_model=List[Consent])
def list_user_consents(user_name: str):
    """
    List all offered, accepted, and denied consents for a user.
    """
    user_consents = []
    consents_ref = db.collection("consents")
    query = consents_ref.where("user.name", "==", user_name)

    for consent_doc in query.stream():
        consent_data = consent_doc.to_dict()
        user_consents.append(Consent(**consent_data))

    return user_consents
