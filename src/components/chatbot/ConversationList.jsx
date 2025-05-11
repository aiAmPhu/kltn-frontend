"use client"

import { useState } from "react"
import { PlusCircle, MessageSquare, Trash2 } from "lucide-react"

export default function ConversationList({
  conversations = [],
  activeConversation,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
}) {
  const [newMessageInput, setNewMessageInput] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (newMessageInput.trim()) {
      try {
        await onCreateConversation(newMessageInput.trim())
        setNewMessageInput("")
        setIsCreating(false)
      } catch (error) {
        console.error("Error creating conversation:", error)
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Trợ lý UTE</h1>
        <p className="text-sm text-gray-500">Chat với trợ lý về thông tin tuyển sinh</p>
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-b border-gray-200">
        {isCreating ? (
          <form onSubmit={handleCreateSubmit} className="space-y-2">
            <input
              value={newMessageInput}
              onChange={(e) => setNewMessageInput(e.target.value)}
              placeholder="Nhập tin nhắn đầu tiên..."
              className="w-full p-2 border border-gray-300 rounded-md"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={!newMessageInput.trim()}
                className="px-3 py-1 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
              >
                Bắt đầu
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1 border border-gray-300 rounded-md"
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Tạo trò chuyện mới
          </button>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Chưa có cuộc trò chuyện nào</div>
        ) : (
          <ul>
            {conversations.map((conversation) => (
              <li key={conversation.conversationId}>
                <div
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 ${
                    activeConversation && activeConversation.conversationId === conversation.conversationId
                      ? "bg-gray-100"
                      : ""
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <MessageSquare className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conversation.title}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conversation.conversationId)
                    }}
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
