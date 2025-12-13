# Polar ML Analysis Service

This machine learning service provides cognitive performance analysis using trained neural networks.

## Architecture

- **Stage 1 Model**: Predicts intermediate cognitive metrics (decision confidence, cognitive load, fatigue, behavior drift)
- **Stage 2 Model**: Predicts final cognitive scores (speed, memory, focus, flexibility, attention, drift)
- **Models**: Two-stage neural network trained on synthetic cognitive test data

## Setup

1. Activate virtual environment:
```bash
cd machine_learning
source .venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Train models (optional - pre-trained models included):
```bash
# Generate synthetic data
python scripts/generate_synthetic_data.py

# Train models using the notebook
jupyter notebook scripts/model.ipynb
# Or run all cells programmatically
```

## Running the Service

Start the Flask API server:
```bash
python app.py
```

The service will run on `http://127.0.0.1:5000`

## API Endpoints

### POST /analyze

Analyzes cognitive test results and returns ML-powered insights.

**Request Body:**
```json
{
  "results": [
    {
      "id": "test-123",
      "type": "REACTION",
      "timestamp": 1702468800000,
      "score": 350,
      "accuracy": 95,
      "duration": 30000,
      "difficultyLevel": 1,
      "meta": {
        "attempts": [320, 340, 360]
      }
    }
  ]
}
```

**Response:**
```json
{
  "decisionConfidence": 78.5,
  "cognitiveLoad": 45.2,
  "fatigueIndex": 22.1,
  "behaviorDrift": 12.3,
  "speed": 85.4,
  "memory": 72.8,
  "focus": 68.9,
  "flexibility": 75.5,
  "attention": 81.2,
  "drift": 15.7,
  "analysisTimestamp": 1702468800000
}
```

## Integration with Polar App

The ML service is integrated into the Polar app via:

1. **Frontend** (`frontend/src/services/apiService.ts`):
   - `mlApi.analyze()` calls the ML service
   - Automatically invoked during cognitive analysis

2. **AI Analysis** (`frontend/src/services/geminiService.ts`):
   - ML predictions enrich Gemini AI's analysis
   - Provides quantitative cognitive scores alongside qualitative insights

3. **Analytics Display** (`frontend/src/components/Analytics.tsx`):
   - Radar chart shows ML-derived cognitive profile
   - "ML Powered" badge indicates active ML predictions

## Feature Extraction

The service extracts 9 features from test results:
- `avgAccuracy`: Mean accuracy across tests
- `stdAccuracy`: Accuracy variability
- `Avgscore`: Mean test scores
- `AvgDuration`: Mean test duration
- `std_duration`: Duration variability
- `meanRt`: Mean reaction time
- `stdRt`: Reaction time variability
- `AvgDifficulty`: Average difficulty level
- `MaxSequence`: Maximum sequence achieved

## Models

- **Stage 1**: 9 → 128 → 64 → 32 → 4 (intermediates)
- **Stage 2**: 4 → 128 → 64 → 32 → 6 (finals)
- **Activation**: ReLU + Sigmoid output
- **Training**: MSE loss, Adam optimizer, early stopping

## Files

- `app.py`: Flask API server
- `model.py`: Model definitions and inference
- `feature_extractor.py`: Feature engineering
- `best_stage1.pth`, `best_stage2.pth`: Trained model weights
- `scaler_X.pkl`, `scaler_y1.pkl`, `scaler_y2.pkl`: Feature/target scalers

## Environment Variables

Configure ML API URL in frontend:
```bash
# frontend/.env
VITE_ML_API_URL=http://127.0.0.1:5000
```

## Troubleshooting

**Model loading errors**: If model architectures don't match checkpoints, the service will use fresh (untrained) weights with a warning.

**Scaler missing**: If scalers are unavailable, identity scaling is used (no normalization).

**Connection failures**: The frontend gracefully degrades to test-based metrics if ML service is unavailable.
