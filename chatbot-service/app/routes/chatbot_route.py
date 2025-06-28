from fastapi import APIRouter

router = APIRouter()

@router.get("/chat")
def chat():
    return {"message": "This is an endpoint"}