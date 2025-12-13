from flask import Flask, request, jsonify
from flask_cors import CORS
from feature_extractor import extract_features
from model import predict
import time

app = Flask(__name__)
CORS(app)  # allow frontend calls

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    if "results" not in data:
        return jsonify({"error": "Missing results"}), 400

    features = extract_features(data["results"])
    intermediates, finals = predict(features)

    response = {
        "decisionConfidence": intermediates[0],
        "cognitiveLoad": intermediates[1],
        "fatigueIndex": intermediates[2],
        "behaviorDrift": intermediates[3],

        "speed": finals[0],
        "memory": finals[1],
        "focus": finals[2],
        "flexibility": finals[3],
        "attention": finals[4],
        "drift": finals[5],

        "analysisTimestamp": int(time.time() * 1000)
    }

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
