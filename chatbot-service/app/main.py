from fastapi import FastAPI
from app.routes import chatbot_route

app = FastAPI()

app.include_router(chatbot_route.router, prefix="/chatbot")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Chatbot Service!"}