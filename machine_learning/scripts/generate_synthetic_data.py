import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# Set seed for reproducibility
np.random.seed(42)
torch.manual_seed(42)

# Number of samples
N = 10000

# Generate synthetic inputs (9 features)
avgAccuracy = np.random.uniform(0.5, 1.0, N)  # High accuracy common
stdAccuracy = np.random.uniform(0.05, 0.3, N)  # Low variance better
Avgscore = np.random.uniform(50, 100, N)  # Scores 50-100
AvgDuration = np.random.uniform(10, 60, N)  # Seconds
std_duration = np.random.uniform(2, 20, N)  # Seconds variance
meanRt = np.random.uniform(0.5, 2.0, N)  # Reaction time seconds
stdRt = np.random.uniform(0.1, 0.5, N)  # RT variance
AvgDifficulty = np.random.uniform(1, 10, N)  # Difficulty level
MaxSequence = np.random.uniform(5, 20, N)  # Max sequence length

# Stack inputs into X (N x 9)
X = np.column_stack([avgAccuracy, stdAccuracy, Avgscore, AvgDuration, std_duration, 
                     meanRt, stdRt, AvgDifficulty, MaxSequence])

# Normalize X to [0,1] for better training
scaler_X = MinMaxScaler()
X_norm = scaler_X.fit_transform(X)

# Compute intermediates (4 targets) with formulas + noise
noise = np.random.normal(0, 0.05, (N, 4))
decision_confidence = 0.7 * avgAccuracy - 0.3 * stdAccuracy
cognitive_load = 0.3 * (AvgDuration / 60) + 0.3 * (meanRt / 2) + 0.4 * (AvgDifficulty / 10)
fatigue_index = 0.4 * (1 - avgAccuracy) + 0.3 * (std_duration / 20) + 0.3 * (stdRt / 0.5)
behavior_drift = 0.5 * stdAccuracy + 0.5 * stdRt

y1 = np.column_stack([decision_confidence, cognitive_load, fatigue_index, behavior_drift])
y1 = np.clip(y1 + noise, 0, 1)  # Clamp to [0,1]


# Compute finals (6 targets) from intermediates + noise
noise2 = np.random.normal(0, 0.05, (N, 6))
speed = 0.5 * (1 - cognitive_load) + 0.5 * (1 - fatigue_index)
memory = 0.6 * decision_confidence + 0.4 * (1 - behavior_drift) + 0.1 * (MaxSequence / 20)  # Slight input bleed for realism
focus = 0.5 * decision_confidence + 0.5 * (1 - behavior_drift)
flexibility = 0.7 * (1 - cognitive_load) + 0.3 * decision_confidence
attention = 0.4 * (1 - fatigue_index) + 0.3 * focus + 0.3 * (1 - behavior_drift)
drift = behavior_drift  # Direct mapping with noise

y2 = np.column_stack([speed, memory, focus, flexibility, attention, drift])
y2 = np.clip(y2 + noise2, 0, 1)

# Save to DataFrame for inspection (optional)
df = pd.DataFrame(X, columns=['avgAccuracy', 'stdAccuracy', 'Avgscore', 'AvgDuration', 'std_duration', 
                              'meanRt', 'stdRt', 'AvgDifficulty', 'MaxSequence'])
df[['decision_confidence', 'cognitive_load', 'fatigue_index', 'behavior_drift']] = y1
df[['speed', 'memory', 'focus', 'flexibility', 'attention', 'drift']] = y2
df.to_csv('synthetic_data.csv', index=False) 