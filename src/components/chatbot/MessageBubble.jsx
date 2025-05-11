"use client"

import { useState } from "react"

export default function MessageBubble({ message }) {
  const isUser = message.sender === "user"
  const [imageError, setImageError] = useState(false)

  // Check if the message has an attachment and if it's an image
  const hasImageAttachment =
    message.attachmentUrl &&
    (message.attachmentUrl.endsWith(".jpg") ||
      message.attachmentUrl.endsWith(".jpeg") ||
      message.attachmentUrl.endsWith(".png") ||
      message.attachmentUrl.endsWith(".gif"))

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[75%] p-3 rounded-lg shadow-sm ${isUser ? "bg-blue-100" : "bg-white border border-gray-200"}`}
      >
        <div className="flex flex-col">
          <p className="text-xs text-gray-500 mb-1">{isUser ? "You" : "UTE Assistant"}</p>

          {/* Message content */}
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Image attachment */}
          {hasImageAttachment && !imageError && (
            <div className="mt-2 relative">
              <img
                src={message.attachmentUrl || "/placeholder.svg"}
                alt="Attachment"
                className="rounded-md max-w-full object-cover"
                onError={() => setImageError(true)}
                style={{ maxHeight: "200px" }}
              />
            </div>
          )}

          {/* Non-image attachment */}
          {message.attachmentUrl && !hasImageAttachment && (
            <div className="mt-2">
              <a
                href={message.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                Xem tệp đính kèm
              </a>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-400 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  )
}
