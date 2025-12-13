from flask import Flask, request, jsonify
from flask_cors import CORS
from feature_extractor import extract_features
from model import predict
import time

app = Flask(__name__)
CORS(app)  # allow frontend calls

@app.route("/", methods=["GET"])
def index():
    return "Cognitive Analysis Service is running."

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    if "results" not in data:
        return jsonify({"error": "Missing results"}), 400

    features = extract_features(data["results"])
    intermediates, finals = predict(features)

    response = {
        "decisionConfidence": float(intermediates[0]),
        "cognitiveLoad": float(intermediates[1]),
        "fatigueIndex": float(intermediates[2]),
        "behaviorDrift": float(intermediates[3]),

        "speed": float(finals[0]),
        "memory": float(finals[1]),
        "focus": float(finals[2]),
        "flexibility": float(finals[3]),
        "attention": float(finals[4]),
        "drift": float(finals[5]),

        "analysisTimestamp": int(time.time() * 1000)
    }

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
