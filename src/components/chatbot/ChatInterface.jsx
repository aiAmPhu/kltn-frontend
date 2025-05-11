"use client"

import { useState, useEffect, useRef } from "react"
import MessageBubble from "./MessageBubble"
import ChatInput from "./ChatInput"

export default function ChatInterface({ conversation, onMessageSent }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Fetch messages for the active conversation
  useEffect(() => {
    if (conversation) {
      fetchMessages()
    }
  }, [conversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chatbot/conversations/${conversation.conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setMessages(result.data || [])
      } else {
        console.error("Failed to fetch messages")
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (message, attachment = null) => {
    try {
      const token = localStorage.getItem("token")
      let url, formData, response

      if (attachment) {
        // Send with attachment
        url = `/api/chatbot/conversations/${conversation.conversationId}/messages/attachment`
        formData = new FormData()
        formData.append("message", message)
        formData.append("attachment", attachment)

        response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
      } else {
        // Send text only
        url = `/api/chatbot/conversations/${conversation.conversationId}/messages`
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        })
      }

      if (response.ok) {
        const result = await response.json()
        // Add new messages to the state
        setMessages([...messages, result.data.userMessage, result.data.botMessage])
        // Notify parent component
        if (onMessageSent) onMessageSent()
        return result
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="py-3 px-4 border-b border-gray-200 flex items-center bg-white">
        <div>
          <h2 className="text-lg font-semibold">{conversation?.title}</h2>
          <p className="text-sm text-gray-500">{new Date(conversation?.updatedAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-pulse text-gray-500">Loading messages...</div>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No messages yet. Start a conversation!</p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.messageId} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  )
}
