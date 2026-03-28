from pathlib import Path
import json
import numpy as np
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error
import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader

BASE = Path(__file__).resolve().parent
DATA_PATH = BASE / "data" / "processed" / "ppg_dalia_windows.npz"
MODEL_DIR = BASE / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
BATCH_SIZE = 64
EPOCHS = 20
LR = 1e-3
SEED = 42

torch.manual_seed(SEED)
np.random.seed(SEED)

class PPGDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.float32).unsqueeze(1)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

class HRNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv1d(4, 16, kernel_size=7, padding=3),
            nn.ReLU(),
            nn.BatchNorm1d(16),
            nn.MaxPool1d(2),

            nn.Conv1d(16, 32, kernel_size=5, padding=2),
            nn.ReLU(),
            nn.BatchNorm1d(32),
            nn.MaxPool1d(2),

            nn.Conv1d(32, 64, kernel_size=5, padding=2),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.AdaptiveAvgPool1d(1),
        )
        self.regressor = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
        )

    def forward(self, x):
        x = self.features(x)
        return self.regressor(x)

def main():
    data = np.load(DATA_PATH, allow_pickle=True)
    X = data["X"]            # [N,4,512]
    y = data["y"]            # [N]
    groups = data["groups"]  # [N]

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=SEED)
    train_idx, test_idx = next(splitter.split(X, y, groups))

    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    mean = X_train.mean(axis=(0, 2), keepdims=True)
    std = X_train.std(axis=(0, 2), keepdims=True) + 1e-6

    X_train = (X_train - mean) / std
    X_test = (X_test - mean) / std

    train_ds = PPGDataset(X_train, y_train)
    test_ds = PPGDataset(X_test, y_test)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=False)

    model = HRNet().to(DEVICE)
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)
    loss_fn = nn.L1Loss()

    best_mae = 1e9
    best_state = None

    for epoch in range(1, EPOCHS + 1):
        model.train()
        train_losses = []

        for xb, yb in train_loader:
            xb, yb = xb.to(DEVICE), yb.to(DEVICE)

            optimizer.zero_grad()
            pred = model(xb)
            loss = loss_fn(pred, yb)
            loss.backward()
            optimizer.step()

            train_losses.append(loss.item())

        model.eval()
        preds, trues = [], []
        with torch.no_grad():
            for xb, yb in test_loader:
                xb = xb.to(DEVICE)
                pred = model(xb).cpu().numpy().reshape(-1)
                preds.append(pred)
                trues.append(yb.numpy().reshape(-1))

        preds = np.concatenate(preds)
        trues = np.concatenate(trues)

        mae = mean_absolute_error(trues, preds)
        rmse = mean_squared_error(trues, preds, squared=False)

        print(f"Epoch {epoch:02d} | train_l1={np.mean(train_losses):.4f} | val_mae={mae:.4f} | val_rmse={rmse:.4f}")

        if mae < best_mae:
            best_mae = mae
            best_state = model.state_dict()

    model.load_state_dict(best_state)

    model_path = MODEL_DIR / "ppg_dalia_hr_cnn.pt"
    torch.save(model.state_dict(), model_path)

    meta = {
        "model_name": "ppg_dalia_hr_cnn",
        "input_channels": 4,
        "input_length": 512,
        "bvp_fs": 64,
        "acc_fs_resampled": 64,
        "window_sec": 8,
        "stride_sec": 2,
        "best_val_mae": float(best_mae),
        "mean": mean.squeeze().tolist(),
        "std": std.squeeze().tolist()
    }

    with open(MODEL_DIR / "ppg_dalia_hr_cnn_meta.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"[DONE] Modelo salvo em {model_path}")
    print(f"[DONE] Meta salva em {MODEL_DIR / 'ppg_dalia_hr_cnn_meta.json'}")

if __name__ == "__main__":
    main()
