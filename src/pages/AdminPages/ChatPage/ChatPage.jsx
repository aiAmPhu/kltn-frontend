import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
    FaPaperPlane,
    FaUser,
    FaSearch,
    FaEllipsisH,
    FaTrash,
    FaSmile,
    FaCheck,
    FaCheckDouble,
    FaPhone,
    FaVideo,
    FaInfoCircle,
} from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import EmojiPicker from "emoji-picker-react";
import { toast } from "react-toastify";

const ChatPage = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [onlineUsers, setOnlineUsers] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMessageOptions, setShowMessageOptions] = useState(null);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [activeUsers, setActiveUsers] = useState(new Set());
    const [userLastMessageTime, setUserLastMessageTime] = useState({});
    const [messageStatuses, setMessageStatuses] = useState({});

    useEffect(() => {
        socketRef.current = io(process.env.REACT_APP_API_BASE_URL.replace("/api", ""), {
            auth: {
                token: localStorage.getItem("token"),
            },
        });

        fetchMessages();
        fetchUsers();

        socketRef.current.on("receive_message", handleNewMessage);
        socketRef.current.on("user_typing", handleUserTyping);
        socketRef.current.on("user_status_change", handleUserStatusChange);
        socketRef.current.on("message_status", handleMessageStatus);
        socketRef.current.on("message_reaction", handleMessageReaction);
        socketRef.current.on("message_deleted", handleMessageDeleted);
        socketRef.current.on("new_message_notification", handleNewMessageNotification);

        socketRef.current.emit("join_room", `admin_${user.userId}`);

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages();
        }
    }, [selectedUser]);

    useEffect(() => {
        if (selectedUser && socketRef.current) {
            const roomId = `admin-${selectedUser.userId}`;
            socketRef.current.emit("join_room", roomId);
        }
    }, [selectedUser]);

    const handleUserStatusChange = ({ userId, status }) => {
        setOnlineUsers((prev) => ({
            ...prev,
            [String(userId)]: status === "online",
        }));
    };

    const handleMessageStatus = ({ messageId, status, userId }) => {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg)));

        setMessageStatuses((prev) => ({
            ...prev,
            [userId]: status,
        }));

        if (status === "read") {
            setUnreadCounts((prev) => ({
                ...prev,
                [userId]: 0,
            }));
        }
    };

    const handleMessageReaction = ({ messageId, reaction, userId }) => {
        setMessages((prev) =>
            prev.map((msg) => {
                if (msg.id === messageId) {
                    const reactions = { ...msg.reactions, [userId]: reaction };
                    return { ...msg, reactions };
                }
                return msg;
            })
        );
    };

    const handleMessageDeleted = ({ messageId }) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    };

    const handleNewMessageNotification = ({ roomId, senderId, unreadCount, content }) => {
        setUnreadCounts((prev) => ({
            ...prev,
            [senderId]: unreadCount,
        }));
        setUserLastMessageTime((prev) => ({
            ...prev,
            [senderId]: new Date().getTime(),
        }));
        setMessageStatuses((prev) => ({
            ...prev,
            [senderId]: "sent",
        }));

        if (selectedUser && senderId === parseInt(selectedUser.userId, 10)) {
            socketRef.current.emit("mark_as_read", {
                roomId: `admin-${selectedUser.userId}`,
                messageId: null,
            });
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/chat/admin/all-messages`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setMessages(response.data);

            const lastMessageTimes = {};
            const statuses = {};
            response.data.forEach((message) => {
                const time = new Date(message.timestamp).getTime();
                if (!lastMessageTimes[message.senderId] || time > lastMessageTimes[message.senderId]) {
                    lastMessageTimes[message.senderId] = time;
                    statuses[message.senderId] = message.status;
                }
            });
            setUserLastMessageTime(lastMessageTimes);
            setMessageStatuses(statuses);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/getall`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            const validUsers = (response.data.data || []).filter(
                (user) => user && typeof user.userId === "number" && user.name
            );

            setUsers(validUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users. Please refresh the page.");
        }
    };

    const handleNewMessage = (message) => {
        setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === message.id);
            if (exists) return prev;
            return [...prev, message];
        });

        setUserLastMessageTime((prev) => ({
            ...prev,
            [message.senderId]: new Date(message.timestamp).getTime(),
        }));

        // Only update unread count for received messages
        if (message.senderId !== parseInt(user.userId, 10)) {
            setUnreadCounts((prev) => ({
                ...prev,
                [message.senderId]: (prev[message.senderId] || 0) + 1,
            }));
        }

        setMessageStatuses((prev) => ({
            ...prev,
            [message.senderId]: "sent",
        }));

        if (selectedUser && message.senderId === parseInt(selectedUser.userId, 10)) {
            socketRef.current.emit("mark_as_read", {
                roomId: `admin-${selectedUser.userId}`,
                messageId: message.id,
            });
        }

        scrollToBottom();
    };

    const handleUserTyping = ({ userId, isTyping }) => {
        setTypingUsers((prev) => ({
            ...prev,
            [userId]: isTyping,
        }));
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedUser || !selectedUser.userId || !user || !user.userId) {
            return;
        }

        try {
            const messageData = {
                roomId: `admin-${selectedUser.userId}`,
                content: newMessage,
                receiverId: parseInt(selectedUser.userId, 10),
            };

            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/chat/send`, messageData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            socketRef.current.emit("send_message", messageData);
            setNewMessage("");
            scrollToBottom();
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        }
    };

    const handleSearch = async (query) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/chat/search?query=${query}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setMessages(response.data);
            } catch (error) {
                console.error("Error searching messages:", error);
            }
        }, 300);
    };

    const addReaction = async (messageId, reaction) => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/chat/reaction`,
                { messageId, reaction },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            socketRef.current.emit("add_reaction", {
                messageId,
                reaction,
                roomId: `admin-${selectedUser.userId}`,
            });
        } catch (error) {
            console.error("Error adding reaction:", error);
        }
    };

    const deleteMessage = async (messageId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/chat/${messageId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            socketRef.current.emit("delete_message", {
                messageId,
                roomId: `admin-${selectedUser.userId}`,
            });
            setShowMessageOptions(null);
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today at ${date.toLocaleTimeString()}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday at ${date.toLocaleTimeString()}`;
        } else {
            return date.toLocaleString();
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedUser]);

    const sortedUsers = [...users].sort((a, b) => {
        const timeA = userLastMessageTime[a.userId] || 0;
        const timeB = userLastMessageTime[b.userId] || 0;
        return timeB - timeA;
    });

    const getMessageStatusIcon = (status) => {
        switch (status) {
            case "read":
                return <FaCheckDouble className="text-blue-500" />;
            case "delivered":
                return <FaCheckDouble className="text-gray-400" />;
            case "sent":
                return <FaCheck className="text-gray-400" />;
            default:
                return null;
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        // Reset unread count for selected user
        setUnreadCounts((prev) => ({
            ...prev,
            [user.userId]: 0,
        }));
        // Mark messages as read
        socketRef.current.emit("mark_as_read", {
            roomId: `admin-${user.userId}`,
            messageId: null,
        });
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-white">
            {/* Users List - Left Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
                        <div className="flex space-x-2">
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <FaVideo className="text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <FaPhone className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Messenger"
                            className="w-full p-2 pl-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto">
                    {sortedUsers
                        .filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((user) => (
                            <div
                                key={user.userId}
                                onClick={() => handleUserSelect(user)}
                                className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                                    selectedUser?.userId === user.userId ? "bg-gray-100" : ""
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <FaUser className="text-gray-400 text-xl" />
                                        </div>
                                        {onlineUsers[user.userId] && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                                            {userLastMessageTime[user.userId] && (
                                                <span className="text-xs text-gray-500">
                                                    {new Date(userLastMessageTime[user.userId]).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-1">
                                                {typingUsers[user.userId] ? (
                                                    <p className="text-sm text-blue-500">typing...</p>
                                                ) : (
                                                    messageStatuses[user.userId] && (
                                                        <div className="flex items-center space-x-1">
                                                            {getMessageStatusIcon(messageStatuses[user.userId])}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                            {unreadCounts[user.userId] > 0 && (
                                                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                                                    {unreadCounts[user.userId]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <FaUser className="text-gray-400" />
                                    </div>
                                    {onlineUsers[selectedUser.userId] && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">{selectedUser.name}</h2>
                                    <p className="text-sm text-gray-500">
                                        {onlineUsers[selectedUser.userId] ? "Active now" : "Offline"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button className="p-2 hover:bg-gray-100 rounded-full">
                                    <FaPhone className="text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full">
                                    <FaVideo className="text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full">
                                    <FaInfoCircle className="text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages
                                .filter((msg) => {
                                    const roomId = `admin-${selectedUser.userId}`;
                                    return (
                                        msg.roomId === roomId ||
                                        (msg.senderId === parseInt(selectedUser.userId, 10) &&
                                            msg.receiverId === parseInt(user.userId, 10)) ||
                                        (msg.senderId === parseInt(user.userId, 10) &&
                                            msg.receiverId === parseInt(selectedUser.userId, 10))
                                    );
                                })
                                .map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex w-full ${
                                            message.senderId === parseInt(user.userId, 10)
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        <div className="relative group" style={{ maxWidth: "70%" }}>
                                            <div
                                                className={`rounded-2xl p-3 ${
                                                    message.senderId === parseInt(user.userId, 10)
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-white shadow-sm"
                                                }`}
                                            >
                                                <div style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                                                    {message.content}
                                                </div>
                                                <div className="flex items-center justify-end mt-1">
                                                    <p
                                                        className={`text-xs ${
                                                            message.senderId === parseInt(user.userId, 10)
                                                                ? "text-blue-100"
                                                                : "text-gray-500"
                                                        }`}
                                                    >
                                                        {formatTimestamp(message.timestamp)}
                                                    </p>
                                                    {message.senderId === parseInt(user.userId, 10) && (
                                                        <span className="text-xs ml-2">
                                                            {message.status === "read"
                                                                ? "✓✓"
                                                                : message.status === "delivered"
                                                                ? "✓✓"
                                                                : "✓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {message.senderId === parseInt(user.userId, 10) && (
                                                <button
                                                    className="absolute top-0 right-0 -mr-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => setShowMessageOptions(message.id)}
                                                >
                                                    <FaEllipsisH className="text-gray-400" />
                                                </button>
                                            )}
                                            {showMessageOptions === message.id && (
                                                <div className="absolute top-0 right-0 -mr-32 bg-white shadow-lg rounded-lg p-2 z-10">
                                                    <button
                                                        className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded"
                                                        onClick={() => deleteMessage(message.id)}
                                                    >
                                                        <FaTrash className="text-red-500" />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                >
                                    <FaSmile className="text-xl" />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-20 left-4">
                                        <EmojiPicker
                                            onEmojiClick={(emojiObject) => {
                                                setNewMessage((prev) => prev + emojiObject.emoji);
                                                setShowEmojiPicker(false);
                                            }}
                                        />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Aa"
                                    className="flex-1 p-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button type="submit" className="p-2 text-blue-500 hover:bg-gray-100 rounded-full">
                                    <FaPaperPlane className="text-xl" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Select a user to start a conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
