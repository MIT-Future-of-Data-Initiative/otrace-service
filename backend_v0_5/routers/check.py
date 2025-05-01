from fastapi import APIRouter, HTTPException
from datetime import datetime
from models.consent_model import ConsentState
from firebase import db

router = APIRouter(prefix="/check", tags=["Check"])

@router.get("/{data_use_id}/{consent_id}")
def check_attestation_validity(data_use_id: str, consent_id: str):
    """
    Checks whether an attestation (data use) is valid under a given consent (basis).
    Returns True if it is valid, or False otherwise.
    """
    # Retrieve attestation
    data_use_doc = db.collection("data_uses").document(data_use_id).get()
    if not data_use_doc.exists:
        raise HTTPException(status_code=404, detail="Data use not found")

    data_use = data_use_doc.to_dict()
    print(data_use)

    # Retrieve consent (basis)
    consent_doc = db.collection("consents").document(consent_id).get()
    if not consent_doc.exists:
        raise HTTPException(status_code=404, detail="Consent not found")

    consent = consent_doc.to_dict()
    print(consent)

    # Ensure the consent is accepted 
    if consent["state"] != ConsentState.accepted:
        return {"valid": False, "message": "Consent was never accepted."}
    
    # Ensure the consent user is the same as the data use subject
    
    if consent["user"] != data_use["data_subject"]:
        return {"valid": False, "message": "Consent's user does not match data use subject."}
        
    # Compare consent expiry timestamp and date use time
    consent_expiry = consent["expiry_timestamp"] 
    data_use_time = data_use["timestamp"]

    if consent_expiry < data_use_time:
        return {"valid": False, "message": "Consent was expired when used for operation."}
 
    if data_use["operator"] != consent["operator"]:
        return {"valid": False, "message": "Consent operator does not much data use operator."}

    # Validate if operations used matches consent operations
    data_use_action = data_use["operation"]
    consent_operations = consent["operations_permitted"]


    if data_use_action in consent_operations:
        return {
            "valid": True,
            "message": "Attestation is valid under the given consent."
        }
    else:
        return {"valid": False, "message": "Data use operation not in consent allowed operations."}
