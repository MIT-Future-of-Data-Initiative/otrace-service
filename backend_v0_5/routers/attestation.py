from uuid import uuid4
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from models.attestation_model import Action, Attestation, Party
from firebase import db

router = APIRouter(prefix="/attestations", tags=["Attestations"])

# POST endpoint to create a new attestation
@router.post("/attest/{party_name}/{data_controller}/", response_model=Attestation)
def attest(party_name: str, data_controller: str, action: Action):
    """
    Record an attestation for a specific party.
    """
    _id = uuid4()
    new_attestation = Attestation(
        id=str(_id),
        party=Party(name=party_name, data_controller=data_controller),
        action=Action(type=action.type.value, information=action.information),
        timestamp=datetime.now(),
    )

    db.collection("attestations").document(new_attestation.id).set(new_attestation.model_dump())

    return new_attestation

# GET endpoint to get all attestations of a party
@router.get("/{party_name}/all/", response_model=List[Attestation])
def get_all_attestations(party_name: str):
    """
    Get all attestations for a specific party.
    """
    docs = db.collection("attestations").where("party.name", "==", party_name).stream()

    attestations = [doc.to_dict() for doc in docs]

    if not attestations:
        raise HTTPException(status_code=404, detail="No attestations found for this party")

    return attestations

# GET endpoint to get attestations within a timestamp range
@router.get("/{party_name}/up_to_date/", response_model=List[Attestation])
def get_up_to_date_attestations(party_name: str, start_time: datetime, end_time: datetime):
    """
    Get attestations for a party that fall within the specified timestamp range.
    """

    docs = (
        db.collection("attestations")
        .where("party.name", "==", party_name)
        .where("timestamp", ">=", start_time)
        .where("timestamp", "<=", end_time)
        .stream()
    )

    attestations = [doc.to_dict() for doc in docs]

    if not attestations:
        raise HTTPException(status_code=404, detail="No attestations found in the given time range.")

    return attestations
