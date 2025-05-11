"use client"

import { useState, useRef } from "react"
import { Paperclip, Send } from "lucide-react"

export default function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState("")
  const [attachment, setAttachment] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!message.trim() && !attachment) return

    setIsSubmitting(true)

    try {
      await onSendMessage(message, attachment)
      setMessage("")
      setAttachment(null)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    // Send message on Enter without Shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeAttachment = () => {
    setAttachment(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="border-t border-gray-200 p-3 bg-white">
      {/* File attachment preview */}
      {attachment && (
        <div className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
          <span className="text-sm truncate">{attachment.name}</span>
          <button className="text-sm text-gray-600 hover:text-gray-900" onClick={removeAttachment}>
            Bỏ
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf"
        />

        {/* Attachment button */}
        <button
          type="button"
          onClick={triggerFileInput}
          className="p-2 border border-gray-300 rounded-md flex-shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Message input */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="flex-1 p-2 border border-gray-300 rounded-md min-h-[40px] max-h-[200px] resize-none"
          rows={1}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={isSubmitting || (!message.trim() && !attachment)}
          className="p-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300 flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
}
