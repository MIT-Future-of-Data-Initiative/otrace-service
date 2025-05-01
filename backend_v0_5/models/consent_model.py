from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime
from enum import Enum

class ConsentState(str, Enum):
    offered = "offered"
    accepted = "accepted"
    denied = "denied"
    revoked = "revoked"

class User(BaseModel):
    name: str

class Operator(BaseModel):
    name: str

class Data(BaseModel):
    description: str

class Operation(BaseModel):
    operation_type: Literal["read", "write"]

class Consent(BaseModel):
    id: str
    operator: Operator
    user: User
    data: Data
    operations_permitted: List[Operation]
    expiry_timestamp: datetime
    state: ConsentState
