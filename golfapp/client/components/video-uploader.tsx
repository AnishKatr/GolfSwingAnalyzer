"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoUploaderProps {
  onUpload: (file: File) => void
}

export default function VideoUploader({ onUpload }: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("video/")) {
        onUpload(file)
      } else {
        alert("Please upload a video file")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center ${
        isDragging ? "border-green-500 bg-green-50" : "border-gray-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />

      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Upload className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold">Upload your golf swing video</h3>
        <p className="text-sm text-gray-500 mb-4">Drag and drop your video here, or click to browse</p>
        <Button onClick={handleButtonClick} className="bg-green-600 hover:bg-green-700">
          Select Video
        </Button>
        <p className="text-xs text-gray-400 mt-2">Supported formats: MP4, MOV, AVI (max 100MB)</p>
      </div>
    </div>
  )
}

