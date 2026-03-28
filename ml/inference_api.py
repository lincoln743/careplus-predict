from fastapi import FastAPI
import random

app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True, "model": "mock-v1"}

@app.post("/predict")
def predict(data: dict):
    try:
        # MOCK seguro (não quebra o app)
        risk_score = round(random.uniform(0.2, 0.9), 2)

        if risk_score < 0.4:
            level = "baixo"
        elif risk_score < 0.7:
            level = "medio"
        else:
            level = "alto"

        return {
            "ok": True,
            "risk_score": risk_score,
            "risk_level": level,
            "model_version": "mock-v1",
            "explanations": ["modelo em fase inicial"]
        }
    except Exception as e:
        return {
            "ok": False,
            "risk_score": 0,
            "risk_level": "indisponivel",
            "model_version": "error",
            "explanations": [],
            "error": str(e)
        }
