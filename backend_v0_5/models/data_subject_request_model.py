from pydantic import BaseModel
from enum import Enum
from uuid import uuid4
from datetime import datetime

class RequestType(str, Enum):
    AccessRequest = "Access Request"
    CorrectionRequest = "Correction Request"
    DeleteRequest = "Delete Request"
    OutputRequest = "Output Request"

class RequestStatus(str, Enum):
    Received = "Received"
    Completed = "Completed"
    Denied = "Denied"

class DataSubjectRequest(BaseModel):
    id: str
    subject: str
    controller: str
    request_type: RequestType
    status: RequestStatus
    timestamp: datetime
