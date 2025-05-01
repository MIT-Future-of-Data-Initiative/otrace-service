from typing import Any, Literal
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

# Enum for different reasons for data use
class Basis_Type(str, Enum):
    consent = "consent"
    legal_obligation = "legal_obligation"
    vital_interests = "vital_interests"
    public_interest = "public_interest"
    legitimate_interest = "legitimate_interest"

class Basis(BaseModel):
    base_type: Basis_Type
    basis_object: Any

class DataSubject(BaseModel):
    name: str

class Operator(BaseModel):
    name: str

class Data(BaseModel):
    description: str

class Operation(BaseModel):
    operation_type: Literal["read", "write"]

class DataUse(BaseModel):
    id: str
    operator: Operator
    data: Data
    data_subject: DataSubject
    operation: Operation
    basis: Basis
    timestamp: datetime
