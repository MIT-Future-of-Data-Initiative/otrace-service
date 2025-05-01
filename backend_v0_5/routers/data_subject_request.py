from fastapi import APIRouter, HTTPException
from models.data_subject_request_model import DataSubjectRequest, RequestStatus, RequestType
from firebase import db
from uuid import uuid4
from datetime import datetime

router = APIRouter(prefix="/dsr", tags=["Data Subject Request"])

@router.post("/request/")
def send_request(subject: str, controller: str, request_type: RequestType):
    """
    Allows a subject to send a data subject request to a controller.
    """
    request = DataSubjectRequest(
        id=str(uuid4()),
        subject=subject,
        controller=controller,
        request_type=request_type,
        status=RequestStatus.Received,
        timestamp=datetime.now()
    )

    db.collection("data_subject_requests").document(request.id).set(request.model_dump())

    return {
        "message": f"Request {request.request_type} submitted by {request.subject} to {request.controller}.",
        "request_id": request.id,
        "status": request.status
    }

@router.get("/request/{request_id}")
def get_request(request_id: str):
    """
    Retrieves a data subject request by its id.
    """
    doc = db.collection("data_subject_requests").document(request_id).get()
    if doc.exists:
        return doc.to_dict()
    raise HTTPException(status_code=404, detail="Request not found")

@router.put("/request/{request_id}/status")
def update_request_status(request_id: str, status: RequestStatus):
    """
    Updates the status of a data subject request.
    """
    doc_ref = db.collection("data_subject_requests").document(request_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Request not found")

    updated_data = {"status": status, "timestamp": datetime.now()}
    doc_ref.update(updated_data)

    return {"message": f"Request {request_id} updated to {status}.", "details": updated_data}
