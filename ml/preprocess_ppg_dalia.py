import warnings
# removed
warnings.filterwarnings("ignore")

import pickle
from pathlib import Path
import numpy as np

DATA_ROOT = Path("data/raw/PPG_FieldStudy")
OUT_DIR = Path("data/processed")
OUT_DIR.mkdir(parents=True, exist_ok=True)

BVP_FS = 64
ACC_FS = 32
HR_FS = 1

WINDOW_SECONDS = 8
STRIDE_SECONDS = 2


def log(msg):
    print(msg, flush=True)


def safe_load_pkl(path: Path):
    with open(path, "rb") as f:
        return pickle.load(f, encoding="latin1")


def safe_get(d, *keys):
    cur = d
    for k in keys:
        if not isinstance(cur, dict) or k not in cur:
            return None
        cur = cur[k]
    return cur


def upsample_repeat(arr, factor):
    if factor == 1:
        return arr
    return np.repeat(arr, factor, axis=0)


def subject_pkls(root: Path):
    files = []
    for p in root.rglob("*.pkl"):
        if p.parent.name.startswith("S") and p.stem == p.parent.name:
            files.append(p)
    return sorted(files)


def load_subject(pkl_path: Path):
    data = safe_load_pkl(pkl_path)

    if not isinstance(data, dict):
        raise ValueError(f"{pkl_path}: raiz do pkl não é dict")

    if pkl_path.name == "S1.pkl":
        log(f"[INFO] S1: chaves topo = {list(data.keys())}")

    signal = safe_get(data, "signal")
    if signal is None:
        raise ValueError(f"{pkl_path}: chave 'signal' ausente")

    wrist = safe_get(data, "signal", "wrist")
    if wrist is None:
        raise ValueError(f"{pkl_path}: chave 'signal/wrist' ausente")

    bvp = safe_get(data, "signal", "wrist", "BVP")
    acc = safe_get(data, "signal", "wrist", "ACC")
    hr  = safe_get(data, "label")

    if bvp is None:
        raise ValueError(f"{pkl_path}: BVP ausente em signal/wrist/BVP")
    if acc is None:
        raise ValueError(f"{pkl_path}: ACC ausente em signal/wrist/ACC")
    if hr is None:
        raise ValueError(f"{pkl_path}: HR ausente em label")

    bvp = np.asarray(bvp, dtype=np.float32)
    acc = np.asarray(acc, dtype=np.float32)
    hr  = np.asarray(hr, dtype=np.float32)

    if bvp.ndim == 1:
        bvp = bvp[:, None]
    elif bvp.ndim == 2 and bvp.shape[1] != 1 and bvp.shape[0] == 1:
        bvp = bvp.T

    if acc.ndim != 2:
        raise ValueError(f"{pkl_path}: ACC ndim inesperado = {acc.ndim}")

    if acc.shape[1] != 3 and acc.shape[0] == 3:
        acc = acc.T

    hr = hr.reshape(-1)

    return {
        "subject": pkl_path.stem,
        "bvp": bvp,
        "acc": acc,
        "hr": hr,
    }


def align_streams(bvp, acc, hr):
    acc_up = upsample_repeat(acc, BVP_FS // ACC_FS)
    hr_up = upsample_repeat(hr[:, None], BVP_FS // HR_FS).reshape(-1)

    n = min(len(bvp), len(acc_up), len(hr_up))
    if n <= 0:
        return None, None

    bvp = bvp[:n]
    acc_up = acc_up[:n]
    hr_up = hr_up[:n]

    X = np.concatenate([bvp, acc_up], axis=1).astype(np.float32)
    y = hr_up.astype(np.float32)

    return X, y


def make_windows(X, y):
    win = WINDOW_SECONDS * BVP_FS
    stride = STRIDE_SECONDS * BVP_FS

    Xw, yw = [], []

    if len(X) < win:
        return np.empty((0, win, X.shape[1]), dtype=np.float32), np.empty((0,), dtype=np.float32)

    for start in range(0, len(X) - win + 1, stride):
        end = start + win
        x = X[start:end]
        target = float(np.mean(y[start:end]))

        if not np.isfinite(x).all():
            continue
        if not np.isfinite(target):
            continue

        Xw.append(x)
        yw.append(target)

    if not Xw:
        return np.empty((0, win, X.shape[1]), dtype=np.float32), np.empty((0,), dtype=np.float32)

    return np.stack(Xw).astype(np.float32), np.asarray(yw, dtype=np.float32)


def process_subject(pkl_path: Path):
    try:
        item = load_subject(pkl_path)
        X, y = align_streams(item["bvp"], item["acc"], item["hr"])

        if X is None or y is None:
            log(f"[WARN] {pkl_path.stem}: alinhamento falhou")
            return None, None, None

        Xw, yw = make_windows(X, y)
        groups = np.array([pkl_path.stem] * len(yw))

        log(
            f"[OK] {pkl_path.stem}: "
            f"BVP={item['bvp'].shape} ACC={item['acc'].shape} HR={item['hr'].shape} "
            f"-> X={Xw.shape} y={yw.shape}"
        )

        return Xw, yw, groups

    except Exception as e:
        log(f"[ERROR] {pkl_path.stem}: {e}")
        return None, None, None


def main():
    files = subject_pkls(DATA_ROOT)

    if not files:
        raise SystemExit(f"[ERROR] nenhum .pkl encontrado em {DATA_ROOT}")

    log(f"[INFO] sujeitos encontrados: {len(files)}")

    X_all, y_all, g_all = [], [], []

    for pkl_path in files:
        Xs, ys, gs = process_subject(pkl_path)
        if Xs is None or len(Xs) == 0:
            log(f"[WARN] Pulando {pkl_path.stem}: sem janelas válidas")
            continue
        X_all.append(Xs)
        y_all.append(ys)
        g_all.append(gs)

    if not X_all:
        raise SystemExit("[ERROR] nenhuma janela válida foi gerada")

    X = np.concatenate(X_all, axis=0)
    y = np.concatenate(y_all, axis=0)
    groups = np.concatenate(g_all, axis=0)

    np.save(OUT_DIR / "X.npy", X)
    np.save(OUT_DIR / "y.npy", y)
    np.save(OUT_DIR / "groups.npy", groups)

    log("")
    log(f"[DONE] X salvo em {OUT_DIR / 'X.npy'}")
    log(f"[DONE] y salvo em {OUT_DIR / 'y.npy'}")
    log(f"[DONE] groups salvo em {OUT_DIR / 'groups.npy'}")
    log(f"[SHAPE] X={X.shape} y={y.shape} groups={groups.shape}")


if __name__ == "__main__":
    main()
