from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from models.attestation_model import Attestation, Action_Type
from firebase import db

router = APIRouter(prefix="/trace", tags=["Trace"])

@router.get("/search/", response_model=List[Attestation])
def search_attestations(
    party_name: Optional[str],
    data_controller: Optional[str],
    action_type: Optional[Action_Type],
    provider: Optional[str],
    user: Optional[str],
    consent: Optional[str],
    start_time: Optional[datetime],
    end_time: Optional[datetime]
):
    """
    Search for attestations using multiple filters.
    """
    query_ref = db.collection("attestations")

    # Apply filters dynamically based on user input
    filters = {
        "party.name": party_name,
        "party.data_controller": data_controller,
        "action.type": action_type.value if action_type else None,
        "action.information.provider": provider,
        "action.information.user": user,
        "action.information.consent": consent,
    }

    for key, value in filters.items():
        if value:
            query_ref = query_ref.where(key, "==", value)

    if start_time:
        query_ref = query_ref.where("timestamp", ">=", start_time)
    if end_time:
        query_ref = query_ref.where("timestamp", "<=", end_time)

    results = query_ref.stream()
    attestations = [doc.to_dict() for doc in results]

    if not attestations:
        raise HTTPException(status_code=404, detail="No matching attestations found.")

    return attestations
