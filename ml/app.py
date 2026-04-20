import os
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

class PredictRequest(BaseModel):
    prompt: str | None = None
    message: str | None = None
    input: str | None = None
    context: str | None = None

@app.get("/health")
def health():
    return {"ok": True, "service": "careplus-ml-openai"}

@app.post("/predict")
def predict(payload: PredictRequest):
    user_text = payload.prompt or payload.message or payload.input or ""
    context = payload.context or ""

    final_input = user_text
    if context:
        final_input = f"Contexto:\n{context}\n\nPergunta do usuário:\n{user_text}"

    response = client.responses.create(
        model="gpt-5",
        input=final_input
    )

    return {
        "ok": True,
        "reply": response.output_text
    }
