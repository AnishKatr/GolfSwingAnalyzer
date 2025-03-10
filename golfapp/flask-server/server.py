from flask import Flask

app=Flask(__name__)

@app.route("/test")
def test():
    return {"test": ["better", "than", "nothing"]}

if __name__ == "__main__":
    app.run(debug=True)


import os

from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Explain the importance of fast language models",
        }
    ],
    model="llama-3.3-70b-versatile",
)

print(chat_completion.choices[0].message.content)