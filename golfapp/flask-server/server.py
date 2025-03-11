from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from groq import Groq
import cv2
import mediapipe as mp
import tempfile
import numpy as np

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
    
    hip_angles = []
    shoulder_tilts = []
    club_positions = []

    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break  # Stop when the video ends

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark

            # **Extract Key Landmarks**
            left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]
            left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST]
            right_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]

            # **Calculate Hip Rotation Angle**
            hip_rotation_angle = np.arctan2(
                right_hip.y - left_hip.y, right_hip.x - left_hip.x
            ) * (180.0 / np.pi)  # Convert from radians to degrees
            hip_angles.append(abs(hip_rotation_angle))

            # **Calculate Shoulder Tilt Angle**
            shoulder_tilt = np.arctan2(
                right_shoulder.y - left_shoulder.y, right_shoulder.x - left_shoulder.x
            ) * (180.0 / np.pi)
            shoulder_tilts.append(abs(shoulder_tilt))

            # **Determine Club Path**
            club_x_diff = right_wrist.x - left_wrist.x  # Difference in x-coordinates
            club_positions.append(club_x_diff)

        frame_count += 1

    cap.release()

    # **Average Metrics Over the Swing**
    avg_hip_rotation = np.mean(hip_angles) if hip_angles else 0
    avg_shoulder_tilt = np.mean(shoulder_tilts) if shoulder_tilts else 0
    avg_club_path = np.mean(club_positions) if club_positions else 0

    # **Interpret Club Path**
    if avg_club_path > 0.02:
        club_path_result = "Inside-to-outside (hook)"
    elif avg_club_path < -0.02:
        club_path_result = "Outside-to-inside (slice)"
    else:
        club_path_result = "Straight"

    return {
        "hip_rotation_angle": round(avg_hip_rotation, 2),
        "shoulder_tilt": round(avg_shoulder_tilt, 2),
        "club_path": club_path_result,
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