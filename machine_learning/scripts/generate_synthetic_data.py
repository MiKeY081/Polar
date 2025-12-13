import numpy as np
import pandas as pd
import random

def generate_player_trials(player_id, n_trials=500, drift=False):
    """
    Generate synthetic gameplay data for a single player.
    Drift=True means player is impaired (slower, more errors).
    """

    data = []

    # Base reaction parameters
    base_rt = 300 if not drift else 420          # slower if drifting
    rt_noise = 60 if not drift else 110          # inconsistent if drifting

    # Error probabilities
    error_rate = 0.08 if not drift else 0.22     # more errors when drifting
    fp_rate = 0.03 if not drift else 0.12        # false positives
    fn_rate = 0.05 if not drift else 0.18        # misses

    fatigue_growth = (0.2 if drift else 0.08)    # increases reaction-time over trials

    show_time = 0

    for trial in range(n_trials):
        show_time += random.uniform(1, 3)

        # Reaction time increases over time (fatigue)
        fatigue_penalty = fatigue_growth * trial
        reaction_time = np.random.normal(base_rt + fatigue_penalty, rt_noise)

        # Binary: is this a matching stimulus?
        is_match = random.choice([0, 1])

        # Player response
        clicked = random.choice([0, 1]) if random.random() < error_rate else is_match

        # correctness logic
        correct = 1 if clicked == is_match else 0

        # false positive / negative
        FP = 1 if clicked == 1 and is_match == 0 else 0
        FN = 1 if clicked == 0 and is_match == 1 else 0

        # Add to dataset
        data.append({
            "player_id": player_id,
            "trial": trial + 1,
            "reaction_time": max(100, reaction_time),
            "is_match": is_match,
            "clicked": clicked,
            "correct": correct,
            "FP": FP,
            "FN": FN,
            "fatigue_level": fatigue_penalty,
            "drift_label": 1 if drift else 0
        })

    return data


def generate_full_dataset(n_players=20):
    all_data = []

    for pid in range(n_players):
        # 50% players are normal, 50% are drifted
        drift = True if pid % 2 == 0 else False
        all_data += generate_player_trials(pid, drift=drift)

    return pd.DataFrame(all_data)


# Generate + Save dataset
df = generate_full_dataset()
df.to_csv("synthetic_cognitive_dataset.csv", index=False)

print("Dataset generated with shape:", df.shape)
df.head()
