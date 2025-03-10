"use client"

import { useState } from "react"
import { Upload, MessageSquare, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VideoUploader from "@/components/video-uploader"
import ChatInterface from "@/components/chat-interface"

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload")
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleVideoUpload = async (file: File) => {
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    setActiveTab("preview")
  }

  const analyzeVideo = async () => {
    if (!videoUrl) return

    setIsAnalyzing(true)

    try {
      // Create form data to send the video file
      const formData = new FormData()
      const videoBlob = await fetch(videoUrl).then((r) => r.blob())
      formData.append("video", videoBlob, "swing.mp4")

      // Send to Flask backend
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to analyze video")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      setActiveTab("chat")
    } catch (error) {
      console.error("Error analyzing video:", error)
      setAnalysis("Sorry, we encountered an error analyzing your swing. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-gradient-to-b from-green-50 to-white">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-green-800">Golf Swing Analyzer</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden md:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!videoUrl} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span className="hidden md:inline">Preview</span>
            </TabsTrigger>
            <TabsTrigger value="chat" disabled={!analysis} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Chat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Swing</CardTitle>
                <CardDescription>Upload a video of your golf swing for AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <VideoUploader onUpload={handleVideoUpload} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Preview Your Swing</CardTitle>
                <CardDescription>Review your video before analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {videoUrl && (
                  <div className="aspect-video bg-black rounded-md overflow-hidden">
                    <video src={videoUrl} controls className="w-full h-full object-contain" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={analyzeVideo} disabled={isAnalyzing} className="bg-green-600 hover:bg-green-700">
                  {isAnalyzing ? "Analyzing..." : "Analyze Swing"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Swing Analysis</CardTitle>
                <CardDescription>Chat with our AI coach about your swing</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden">
                <ChatInterface initialAnalysis={analysis} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

