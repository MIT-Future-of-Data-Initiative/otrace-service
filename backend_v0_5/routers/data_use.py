from fastapi import APIRouter, HTTPException
from datetime import datetime
from uuid import UUID, uuid4
from models.data_use_model import DataUse, Operator, DataSubject, Data, Operation, Basis
from firebase import db

router = APIRouter(prefix="/data_use", tags=["Data Use"])

# POST endpoint to record a data use
@router.post("/use/", response_model=DataUse)
def record_data_use(operator: Operator, data: Data, data_subject: DataSubject, operation: Operation, basis: Basis):
    """
    Operator records the use of data from a subject for an operation under a basis.
    """
    data_use_id = uuid4()
    data_use = DataUse(
        id=str(data_use_id),
        operator=operator,
        data=data,
        data_subject=data_subject,
        operation=operation,
        basis=basis,
        timestamp=datetime.now(),
    )

    db.collection("data_uses").document(data_use.id).set(data_use.model_dump())
    return data_use

# GET endpoint to get the basis of a data use by ID
@router.get("/get_basis/{data_use_id}/", response_model=Basis)
def get_basis(data_use_id: UUID):
    """
    Get the basis of the data use by ID.
    """
    data_use_ref = db.collection("data_uses").document(str(data_use_id))
    data_use_doc = data_use_ref.get()

    if not data_use_doc.exists:
        raise HTTPException(status_code=404, detail="Data use not found")

    data_use_data = data_use_doc.to_dict()

    return data_use_data["basis"]
