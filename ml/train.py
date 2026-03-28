import json
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

DATA_DIR = Path("data/processed")
ARTIFACTS_DIR = Path("artifacts")
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

BATCH_SIZE = 128
EPOCHS = 20
LR = 1e-3
PATIENCE = 5
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

TEST_SUBJECTS = {"S14", "S15"}
VAL_SUBJECTS = {"S12", "S13"}


def log(msg):
    print(msg, flush=True)


class HeartRateDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.float32)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


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
        # entrada: (B, T, F) -> (B, F, T)
        x = x.transpose(1, 2)
        x = self.net(x)
        x = self.head(x)
        return x.squeeze(1)


def load_data():
    X = np.load(DATA_DIR / "X.npy")
    y = np.load(DATA_DIR / "y.npy")
    g = np.load(DATA_DIR / "groups.npy", allow_pickle=True)
    return X, y, g


def split_by_subject(X, y, g):
    g = np.asarray(g).astype(str)

    test_mask = np.isin(g, list(TEST_SUBJECTS))
    val_mask = np.isin(g, list(VAL_SUBJECTS))
    train_mask = ~(test_mask | val_mask)

    X_train, y_train = X[train_mask], y[train_mask]
    X_val, y_val = X[val_mask], y[val_mask]
    X_test, y_test = X[test_mask], y[test_mask]

    g_train, g_val, g_test = g[train_mask], g[val_mask], g[test_mask]

    return (X_train, y_train, g_train), (X_val, y_val, g_val), (X_test, y_test, g_test)


def fit_scaler(X_train):
    # X: (N, T, F)
    mean = X_train.reshape(-1, X_train.shape[-1]).mean(axis=0)
    std = X_train.reshape(-1, X_train.shape[-1]).std(axis=0)
    std = np.where(std < 1e-6, 1.0, std)
    return mean.astype(np.float32), std.astype(np.float32)


def apply_scaler(X, mean, std):
    return ((X - mean) / std).astype(np.float32)


def mae(pred, target):
    return float(np.mean(np.abs(pred - target)))


def rmse(pred, target):
    return float(np.sqrt(np.mean((pred - target) ** 2)))


def run_epoch(model, loader, criterion, optimizer=None):
    training = optimizer is not None
    model.train(training)

    losses = []
    preds_all = []
    targets_all = []

    for xb, yb in loader:
        xb = xb.to(DEVICE)
        yb = yb.to(DEVICE)

        if training:
            optimizer.zero_grad()

        pred = model(xb)
        loss = criterion(pred, yb)

        if training:
            loss.backward()
            optimizer.step()

        losses.append(loss.item())
        preds_all.append(pred.detach().cpu().numpy())
        targets_all.append(yb.detach().cpu().numpy())

    preds_all = np.concatenate(preds_all)
    targets_all = np.concatenate(targets_all)

    return {
        "loss": float(np.mean(losses)),
        "mae": mae(preds_all, targets_all),
        "rmse": rmse(preds_all, targets_all),
    }


def main():
    torch.manual_seed(42)
    np.random.seed(42)

    X, y, g = load_data()
    log(f"[INFO] X={X.shape} y={y.shape} groups={g.shape}")

    (X_train, y_train, g_train), (X_val, y_val, g_val), (X_test, y_test, g_test) = split_by_subject(X, y, g)

    log(f"[INFO] train={X_train.shape} val={X_val.shape} test={X_test.shape}")
    log(f"[INFO] train subjects={sorted(set(g_train.tolist()))}")
    log(f"[INFO] val subjects={sorted(set(g_val.tolist()))}")
    log(f"[INFO] test subjects={sorted(set(g_test.tolist()))}")

    mean, std = fit_scaler(X_train)

    X_train = apply_scaler(X_train, mean, std)
    X_val = apply_scaler(X_val, mean, std)
    X_test = apply_scaler(X_test, mean, std)

    np.savez(ARTIFACTS_DIR / "scaler.npz", mean=mean, std=std)

    train_ds = HeartRateDataset(X_train, y_train)
    val_ds = HeartRateDataset(X_val, y_val)
    test_ds = HeartRateDataset(X_test, y_test)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    model = CNNRegressor(in_channels=X.shape[-1]).to(DEVICE)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)

    best_val = float("inf")
    best_epoch = -1
    patience_count = 0

    for epoch in range(1, EPOCHS + 1):
        train_metrics = run_epoch(model, train_loader, criterion, optimizer)
        val_metrics = run_epoch(model, val_loader, criterion, optimizer=None)

        log(
            f"[EPOCH {epoch:02d}] "
            f"train_loss={train_metrics['loss']:.4f} train_mae={train_metrics['mae']:.4f} "
            f"val_loss={val_metrics['loss']:.4f} val_mae={val_metrics['mae']:.4f} val_rmse={val_metrics['rmse']:.4f}"
        )

        if val_metrics["mae"] < best_val:
            best_val = val_metrics["mae"]
            best_epoch = epoch
            patience_count = 0
            torch.save(model.state_dict(), ARTIFACTS_DIR / "model.pt")
        else:
            patience_count += 1
            if patience_count >= PATIENCE:
                log(f"[EARLY STOP] sem melhora por {PATIENCE} épocas")
                break

    log(f"[INFO] melhor época = {best_epoch} | melhor val_mae = {best_val:.4f}")

    model.load_state_dict(torch.load(ARTIFACTS_DIR / "model.pt", map_location=DEVICE))
    test_metrics = run_epoch(model, test_loader, criterion, optimizer=None)

    log(
        f"[TEST] loss={test_metrics['loss']:.4f} "
        f"mae={test_metrics['mae']:.4f} rmse={test_metrics['rmse']:.4f}"
    )

    meta = {
        "input_shape": [int(X.shape[1]), int(X.shape[2])],
        "features": ["BVP", "ACC_X", "ACC_Y", "ACC_Z"],
        "window_seconds": 8,
        "stride_seconds": 2,
        "sampling_rate_hz": 64,
        "train_subjects": sorted(set(g_train.tolist())),
        "val_subjects": sorted(set(g_val.tolist())),
        "test_subjects": sorted(set(g_test.tolist())),
        "device": DEVICE,
        "best_val_mae": float(best_val),
        "test_metrics": test_metrics,
    }

    with open(ARTIFACTS_DIR / "meta.json", "w") as f:
        json.dump(meta, f, indent=2)

    log(f"[DONE] artefatos salvos em {ARTIFACTS_DIR.resolve()}")


if __name__ == "__main__":
    main()
