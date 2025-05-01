from uuid import uuid4
from fastapi import APIRouter, HTTPException
from models.introduction_model import Introduction
from firebase import db

router = APIRouter(prefix="/introduction", tags=["Introduction"])

@router.post("/introduce/")
def introduce(intro: Introduction):
    intro_id = str(uuid4())
    intro._id = intro_id
    db.collection("introductions").document(intro_id).set(intro.model_dump())

    return {
        "message": f"{intro.operator} has been introduced to {intro.service} to track data for {intro.consumer}",
        "introduction": intro
    }

@router.get("/introduced")
def introduced(consumer: str, operator: str):
    """
    Checks if an operator is connected to any service on behalf of a consumer.
    """
    query = db.collection("introductions").where("consumer", "==", consumer).where("operator", "==", operator)
    results = query.stream()

    # Check if any introduction matches the consumer and operator
    for intro in results:
        intro_data = intro.to_dict()
        return {"service": intro_data["service"]}

    raise HTTPException(status_code=404, detail="No introduction found")
