import numpy as np

def extract_features(results):
    accuracies = []
    durations = []
    difficulties = []
    reaction_times = []
    max_sequence = 0
    scores = []

    for r in results:
        accuracies.append(r.get("accuracy", 0))
        durations.append(r.get("duration", 0))
        difficulties.append(r.get("difficultyLevel", 1))
        scores.append(r.get("score", 0))

        if r["type"] == "REACTION":
            reaction_times.extend(r["meta"].get("attempts", []))

        if r["type"] == "SEQUENCE":
            max_sequence = max(max_sequence, r["meta"].get("maxSequence", 0))

    features = {
        "avgAccuracy": np.mean(accuracies),
        "stdAccuracy": np.std(accuracies),
        "Avgscore": np.mean(scores),
        "AvgDuration": np.mean(durations),
        "std_duration": np.std(durations),
        "meanRt": np.mean(reaction_times) if reaction_times else 0,
        "stdRt": np.std(reaction_times) if reaction_times else 0,
        "AvgDifficulty": np.mean(difficulties),
        "MaxSequence": max_sequence
    }

    return np.array(list(features.values()), dtype=np.float32)
