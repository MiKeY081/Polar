import torch
import torch.nn as nn
import joblib
import numpy as np

# ---------- Models ----------
class Stage1NN(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(9, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 4),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.net(x)

class Stage2NN(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(4, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 6),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.net(x)

# ---------- Load ----------
stage1 = Stage1NN()
stage2 = Stage2NN()

stage1.load_state_dict(torch.load("best_stage1.pth", map_location="cpu"))
stage2.load_state_dict(torch.load("best_stage2.pth", map_location="cpu"))

stage1.eval()
stage2.eval()

scaler_X = joblib.load("scaler_X.pkl")
scaler_y1 = joblib.load("scaler_y1.pkl")
scaler_y2 = joblib.load("scaler_y2.pkl")

# ---------- Predict ----------
def predict(features):
    X_scaled = scaler_X.transform([features])
    X_tensor = torch.tensor(X_scaled, dtype=torch.float32)

    with torch.no_grad():
        y1 = stage1(X_tensor)
        y2 = stage2(y1)

    intermediates = scaler_y1.inverse_transform(y1.numpy())[0]
    finals = scaler_y2.inverse_transform(y2.numpy())[0]

    return intermediates, finals
