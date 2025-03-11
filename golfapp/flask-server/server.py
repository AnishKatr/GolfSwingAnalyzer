from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from groq import Groq
import cv2
import mediapipe as mp
import tempfile

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


@app.after_request
def add_csp_headers(response):
    response.headers['Content-Security-Policy'] = "script-src 'self' 'unsafe-eval';"
    return response

def analyze_swing(video_path):
    cap = cv2.VideoCapture(video_path)
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose()

    hip_rotation_angle = 45  # Placeholder
    shoulder_tilt = 12       # Placeholder
    club_path = "Out-to-in (causing a slice)"  # Placeholder

    # Video analysis logic would go here
    # Example: extract frames, analyze keypoints with mediapipe

    cap.release()

    return {
        "hip_rotation_angle": hip_rotation_angle,
        "shoulder_tilt": shoulder_tilt,
        "club_path": club_path,
    }

chat_history_store = []  # Store conversation in memory (temporary solution)

@app.route("/analyze", methods=["POST"])
def analyze():
    global chat_history_store

    if "video" not in request.files:
        return jsonify({"error": "No video file provided."}), 400

    video_file = request.files["video"]

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
        video_file.save(tmp_file.name)
        analysis = analyze_swing(tmp_file.name)

    prompt = (
        f"Golf swing analysis:\n"
        f"- Hip rotation angle: {analysis['hip_rotation_angle']}°\n"
        f"- Shoulder tilt: {analysis['shoulder_tilt']}°\n"
        f"- Club path: {analysis['club_path']}\n\n"
        "Based on these values, provide detailed feedback on how to improve the swing."
    )

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )

        feedback = chat_completion.choices[0].message.content

        # Generate initial message
        initial_message = {
            "role": "assistant",
            "content": (
                f"Hello! I'm your golf swing AI coach. Here's your personalized feedback:\n\n"
                f"Your current swing metrics:\n"
                f"- **Hip rotation angle:** {analysis['hip_rotation_angle']}°\n"
                f"- **Shoulder tilt:** {analysis['shoulder_tilt']}°\n"
                f"- **Club path:** {analysis['club_path']}\n\n"
                f"{feedback}"
            ),
        }

        # **Store this in chat history so it's always present**
        chat_history_store.append(initial_message)

        print("Backend stored initial message:", initial_message)

        return jsonify({"initial_message": initial_message["content"]})

    except Exception as e:
        print("Backend Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    global chat_history_store
    data = request.json
    user_message = data.get("message")
    chat_history = data.get("chatHistory", [])

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        # Append new messages to global chat history
        chat_history_store.extend(chat_history)
        chat_history_store.append({"role": "user", "content": user_message})

        print("Updated Chat history:", chat_history_store)

        chat_completion = client.chat.completions.create(
            messages=chat_history_store,
            model="llama-3.3-70b-versatile",
        )

        response_text = chat_completion.choices[0].message.content

        # Store assistant response as well
        chat_history_store.append({"role": "assistant", "content": response_text})

        return jsonify({"response": response_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
