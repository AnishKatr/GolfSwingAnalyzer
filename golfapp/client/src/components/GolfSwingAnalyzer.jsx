"use client";

import { useState, useRef , useEffect } from "react";

console.log("SimpleGolfSwingAnalyzer.jsx");

export default function SimpleGolfSwingAnalyzer() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [messages, setMessages] = useState([]);

  const [inputValue, setInputValue] = useState("");
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

  function formatTimestamp(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }

      handleAnalyzeSwing(file);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAnalyzeSwing = async (file) => {
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.initial_message) {
        const assistantMessage = {
          role: "assistant",
          content: data.initial_message,
          timestamp: formatTimestamp(new Date()),
        };

        console.log("Received from backend:", assistantMessage);

        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to analyze swing.");
      }
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Sorry, I couldn't analyze your swing. Please try again.",
          timestamp: formatTimestamp(new Date()),
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendMessageToBackend = async (message, chatHistory) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, chatHistory }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
  
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error sending message:", error);
      return "Sorry, I couldn't process your request. Please try again.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
  
    // Add user message to the chat state
    const userMessage = {
      role: "user",
      content: inputValue,
      timestamp: formatTimestamp(new Date()),
    };
  
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, userMessage];
      return updatedMessages;
    });
  
    setInputValue("");
  
    try {
      // Send **current** chat history along with the new message
      const aiResponse = await sendMessageToBackend(inputValue, [...messages, userMessage]);
  
      // Add AI response to state correctly
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: aiResponse,
          timestamp: formatTimestamp(new Date()),
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" hidden />
      <button onClick={() => fileInputRef.current.click()}>Upload Video</button>

      <div>
        {messages.map((message, idx) => (
          <div key={idx}>
            <strong>{message.role}</strong>: {message.content}
          </div>
        ))}
      </div>

      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSendMessage}>Send</button>

      {isAnalyzing && <div>Analyzing... {analysisProgress}%</div>}
    </div>
  );
}