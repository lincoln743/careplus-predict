import json
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

ARTIFACTS_DIR = Path("artifacts")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


class CNNRegressor(nn.Module):
    def __init__(self, in_channels=4):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv1d(in_channels, 32, kernel_size=7, padding=3),
            nn.ReLU(),
            nn.BatchNorm1d(32),
            nn.MaxPool1d(2),

            nn.Conv1d(32, 64, kernel_size=5, padding=2),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.MaxPool1d(2),

            nn.Conv1d(64, 128, kernel_size=5, padding=2),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.AdaptiveAvgPool1d(1),
        )
        self.head = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 1),
        )

    def forward(self, x):
        x = x.transpose(1, 2)
        x = self.net(x)
        x = self.head(x)
        return x.squeeze(1)


class PredictRequest(BaseModel):
    window: list[list[float]] = Field(..., description="Janela 512x4: [BVP, ACC_X, ACC_Y, ACC_Z]")


def load_artifacts():
    meta = json.loads((ARTIFACTS_DIR / "meta.json").read_text())
    scaler = np.load(ARTIFACTS_DIR / "scaler.npz")
    mean = scaler["mean"].astype(np.float32)
    std = scaler["std"].astype(np.float32)

    model = CNNRegressor(in_channels=len(meta["features"]))
    model.load_state_dict(torch.load(ARTIFACTS_DIR / "model.pt", map_location=DEVICE))
    model.to(DEVICE)
    model.eval()

    return model, mean, std, meta


model, mean, std, meta = load_artifacts()
app = FastAPI(title="CarePlus Predict AI", version="1.0.0")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "device": DEVICE,
        "input_shape": meta["input_shape"],
        "features": meta["features"],
    }


@app.post("/predict")
def predict(req: PredictRequest):
    try:
        x = np.asarray(req.window, dtype=np.float32)
    except Exception:
        raise HTTPException(status_code=400, detail="window inválida")

    expected_t, expected_f = meta["input_shape"]

    if x.ndim != 2:
        raise HTTPException(status_code=400, detail="window deve ser matriz 2D")
    if x.shape[0] != expected_t or x.shape[1] != expected_f:
        raise HTTPException(
            status_code=400,
            detail=f"shape inválido: recebido {list(x.shape)}, esperado {[expected_t, expected_f]}"
        )
    if not np.isfinite(x).all():
        raise HTTPException(status_code=400, detail="window contém NaN/Inf")

    x = (x - mean) / std
    x = np.expand_dims(x, axis=0)

    with torch.no_grad():
        xt = torch.tensor(x, dtype=torch.float32, device=DEVICE)
        pred = model(xt).cpu().numpy()[0]

    return {"predicted_hr": float(pred)}
