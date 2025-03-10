"use client"

import { useState, useRef } from "react"

export default function SimpleGolfSwingAnalyzer() {
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your golf swing AI coach. Upload a video of your swing, and I'll analyze it to provide personalized feedback.",
      timestamp: formatTimestamp(new Date()),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)

  function formatTimestamp(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoUrl(url)

      // Reset video player
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
        setIsPlaying(false)
      }
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      if (!isPlaying) {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleAnalyzeSwing = () => {
    if (!videoFile) return

    setIsAnalyzing(true)

    // Simulate analysis progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setAnalysisProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setIsAnalyzing(false)

        // Add analysis results to chat
        const newMessages = [
          ...messages,
          {
            role: "assistant",
            content: generateSwingAnalysis(),
            timestamp: formatTimestamp(new Date()),
          },
        ]
        setMessages(newMessages)
      }
    }, 200)
  }

  const generateSwingAnalysis = () => {
    // This would be replaced with actual analysis from the backend
    const issues = [
      "Your grip appears to be too tight, which is restricting your wrist hinge.",
      "Your weight shift is primarily lateral rather than rotational.",
      "Your backswing is slightly over-rotated, causing you to come over the top on the downswing.",
    ]

    const tips = [
      "Try holding the club with less pressure - aim for a 5-6 out of 10 on grip pressure.",
      "Focus on turning your hips and shoulders rather than sliding them.",
      "Work on stopping your backswing at the point where your left shoulder is under your chin.",
    ]

    return `
      I've analyzed your swing and noticed a few areas for improvement:
      
      Key observations:
      • ${issues[0]}
      • ${issues[1]}
      • ${issues[2]}
      
      Recommendations:
      1. ${tips[0]}
      2. ${tips[1]}
      3. ${tips[2]}
      
      Would you like me to elaborate on any of these points or suggest specific drills to help?
    `
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const newMessages = [
      ...messages,
      {
        role: "user",
        content: inputValue,
        timestamp: formatTimestamp(new Date()),
      },
    ]
    setMessages(newMessages)
    setInputValue("")

    // Simulate AI response after a short delay
    setTimeout(() => {
      const userQuestion = inputValue.toLowerCase()
      let response = ""

      if (userQuestion.includes("grip")) {
        response =
          "To improve your grip, try the following drill: Hold the club with your trail hand only, making sure your palm faces the target. Take some practice swings focusing on the feeling of the clubface staying square through impact. This will help you develop a lighter, more effective grip."
      } else if (userQuestion.includes("weight") || userQuestion.includes("shift")) {
        response =
          "For better weight transfer, practice the 'step-through' drill: Set up normally, then on the downswing, allow your back foot to step toward the target as you swing through. This exaggerates the proper weight shift and helps you feel the correct movement pattern."
      } else if (userQuestion.includes("backswing") || userQuestion.includes("over the top")) {
        response =
          "To fix your over-rotation, try the 'half-swing' drill: Make swings where your backswing stops when the club is parallel to the ground. Focus on quality of contact rather than distance. Gradually increase the length of your backswing while maintaining control."
      } else {
        response =
          "Great question! To work on that aspect of your swing, I'd recommend focusing on the fundamentals first. Start with small, controlled swings emphasizing proper posture and rotation. Would you like me to suggest a specific drill for this?"
      }

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: response,
          timestamp: formatTimestamp(new Date()),
        },
      ])
    }, 1500)
  }

  return (
    <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        {/* Video Upload and Preview Section */}
        <div className="card" style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "16px", borderBottom: "1px solid #eee" }}>
            <h3 style={{ fontSize: "1.5rem", margin: "0 0 8px 0", display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "8px", color: "#16a34a" }}>⛳</span>
              Golf Swing Analyzer
            </h3>
            <p style={{ margin: "0", color: "#666", fontSize: "0.875rem" }}>
              Upload a video of your golf swing for AI analysis
            </p>
          </div>
          <div className="card-content" style={{ padding: "16px" }}>
            {!videoUrl ? (
              <div
                style={{
                  height: "300px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                  padding: "24px",
                  cursor: "pointer",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ fontSize: "48px", color: "#999", marginBottom: "16px" }}>🎥</div>
                <p style={{ marginBottom: "8px", fontSize: "0.875rem", color: "#666" }}>
                  <span style={{ fontWeight: "600" }}>Click to upload</span> or drag and drop
                </p>
                <p style={{ fontSize: "0.75rem", color: "#666" }}>MP4, MOV, or WebM (Max 100MB)</p>
                <button
                  style={{
                    marginTop: "16px",
                    padding: "8px 16px",
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  <span style={{ marginRight: "8px" }}>📤</span>
                  Select Video
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="video/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ borderRadius: "8px", backgroundColor: "black", overflow: "hidden" }}>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    style={{ maxHeight: "300px", margin: "0 auto", display: "block", borderRadius: "8px" }}
                    onEnded={() => setIsPlaying(false)}
                    controls={false}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      style={{
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        cursor: "pointer",
                      }}
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? "⏸️" : "▶️"}
                    </button>
                    <button
                      style={{
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        cursor: "pointer",
                      }}
                      onClick={handleRestart}
                    >
                      🔄
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setVideoFile(null)
                        setVideoUrl(null)
                      }}
                    >
                      Change Video
                    </button>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#16a34a",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isAnalyzing ? "not-allowed" : "pointer",
                        opacity: isAnalyzing ? 0.7 : 1,
                      }}
                      onClick={handleAnalyzeSwing}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze Swing"}
                    </button>
                  </div>
                </div>
                {isAnalyzing && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                      <span>Analyzing swing...</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <div style={{ height: "8px", backgroundColor: "#eee", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${analysisProgress}%`,
                          backgroundColor: "#16a34a",
                          transition: "width 0.2s",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Interface Section */}
        <div className="card" style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "16px", borderBottom: "1px solid #eee" }}>
            <h3 style={{ fontSize: "1.5rem", margin: "0 0 8px 0", display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "8px", color: "#16a34a" }}>🤖</span>
              Golf Coach AI
            </h3>
            <p style={{ margin: "0", color: "#666", fontSize: "0.875rem" }}>
              Get personalized feedback and tips to improve your swing
            </p>
          </div>
          <div className="card-content" style={{ padding: "16px" }}>
            <div
              className="messages"
              style={{
                height: "350px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                paddingRight: "16px",
              }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "16px",
                      borderRadius: "8px",
                      backgroundColor: message.role === "user" ? "#16a34a" : "#f1f5f9",
                      color: message.role === "user" ? "white" : "black",
                      display: "flex",
                      gap: "12px",
                    }}
                  >
                    {message.role === "assistant" && (
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: "#e6f4ea",
                          color: "#16a34a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        ⛳
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {message.content}
                      </div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{message.timestamp}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer" style={{ padding: "16px", borderTop: "1px solid #eee" }}>
            <div style={{ display: "flex", width: "100%", alignItems: "center", gap: "8px" }}>
              <input
                type="text"
                placeholder="Ask about your swing or for specific tips..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage()
                  }
                }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                📤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

