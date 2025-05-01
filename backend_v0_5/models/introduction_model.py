from pydantic import BaseModel

class Introduction(BaseModel):
    _id: str
    consumer: str  # The consumer (party making the introduction)
    operator: str  # The operator (party that will use the serive)
    service: str  # The service facilitating the tracing of data
