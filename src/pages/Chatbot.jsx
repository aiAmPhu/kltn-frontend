"use client"

import { useState, useEffect } from "react"
import ChatInterface from "../components/chatbot/ChatInterface"
import ConversationList from "../components/chatbot/ConversationList"
import { Menu } from "lucide-react"

// Custom hook for mobile detection
function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile)

    // Cleanup event listener
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return isMobile
}

export default function Chatbot() {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMobile()

  // Automatically close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  // Fetch user conversations on component mount
  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/chatbot/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setConversations(result.data || [])

        // Set active conversation to the first one if not set
        if (result.data.length > 0 && !activeConversation) {
          setActiveConversation(result.data[0])
        }
      } else {
        console.error("Failed to fetch conversations")
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  const handleCreateConversation = async (initialMessage) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/chatbot/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: initialMessage }),
      })

      if (response.ok) {
        const result = await response.json()
        setActiveConversation(result.data.conversation)
        // Refresh the conversation list
        fetchConversations()
        // On mobile, close the sidebar after creating a new conversation
        if (isMobile) {
          setSidebarOpen(false)
        }
        return result.data
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation)
    // On mobile, close the sidebar after selecting a conversation
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleDeleteConversation = async (conversationId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/chatbot/conversations/${conversationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove from state
        setConversations(conversations.filter((c) => c.conversationId !== conversationId))

        // If active conversation was deleted, set active to null or first in list
        if (activeConversation && activeConversation.conversationId === conversationId) {
          const remainingConversations = conversations.filter((c) => c.conversationId !== conversationId)
          setActiveConversation(remainingConversations.length > 0 ? remainingConversations[0] : null)
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <div className="fixed left-4 top-4 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white p-2 rounded-md shadow border border-gray-200"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:relative z-20 w-64 md:w-80 h-full bg-white border-r border-gray-200 shadow-md transition-transform duration-200 ease-in-out`}
      >
        <ConversationList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={handleCreateConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeConversation ? (
          <ChatInterface conversation={activeConversation} onMessageSent={fetchConversations} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Chào mừng đến với trợ lý UTE</h2>
              <p className="text-gray-500 mb-6">
                Bắt đầu một cuộc trò chuyện mới hoặc chọn một cuộc trò chuyện từ menu.
              </p>
              <button
                onClick={() => handleCreateConversation("Xin chào")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Bắt đầu trò chuyện
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
