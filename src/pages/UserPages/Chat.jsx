import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { FaPaperPlane, FaSmile } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import EmojiPicker from 'emoji-picker-react';

const Chat = ({ chatType, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const roomIdRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Initialize socket connection
        socketRef.current = io(process.env.REACT_APP_API_BASE_URL.replace('/api', ''), {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        // Join room
        roomIdRef.current = `${chatType}-${user.userId}`;
        socketRef.current.emit('join_room', roomIdRef.current);

        // Load chat history
        fetchChatHistory(roomIdRef.current);

        // Socket event listeners
        socketRef.current.on('receive_message', handleNewMessage);
        socketRef.current.on('user_typing', handleUserTyping);
        socketRef.current.on('message_status', handleMessageStatus);

        return () => {
            if (socketRef.current) {
                // Emit leave_room event before disconnecting
                socketRef.current.emit('leave_room', roomIdRef.current);
                socketRef.current.disconnect();
            }
        };
    }, [user, chatType]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchChatHistory = async (roomId) => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/chat/history/${roomId}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setMessages(response.data);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching chat history:', error);
            setError('Failed to load chat history');
        }
    };

    const handleNewMessage = (message) => {
        setMessages(prev => {
            // Check if message already exists
            const exists = prev.some(msg => msg.id === message.id);
            if (exists) return prev;
            return [...prev, message];
        });
        scrollToBottom();
    };

    const handleMessageStatus = ({ messageId, status }) => {
        setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, status } : msg
        ));
    };

    const handleUserTyping = ({ userId, isTyping }) => {
        setIsTyping(isTyping);
    };

    const handleTyping = () => {
        if (!socketRef.current || !user) return;

        const roomId = `${chatType}-${user.userId}`;
        socketRef.current.emit('typing', {
            roomId,
            isTyping: true
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current.emit('typing', {
                roomId,
                isTyping: false
            });
        }, 1000);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        try {
            const roomId = `${chatType}-${user.userId}`;
            const receiverId = chatType === 'admin' ? 
                (process.env.REACT_APP_ADMIN_ID || 1) : 
                (process.env.REACT_APP_REVIEWER_ID || 2);

            const messageData = {
                roomId,
                content: newMessage,
                receiverId: parseInt(receiverId, 10)
            };

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/chat/send`,
                messageData,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );

            // Add the sent message to the messages list
            setMessages(prev => {
                const exists = prev.some(msg => msg.id === response.data.id);
                if (exists) return prev;
                return [...prev, response.data];
            });
            
            // Emit the message through socket
            socketRef.current.emit('send_message', messageData);
            
            // Clear the input
            setNewMessage('');
            
            // Clear any existing error
            setError(null);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = error.response?.data?.message || 'Failed to send message';
            setError(errorMessage);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    if (!user) {
        return null;
    }

    return (
        <div className="flex flex-col h-full bg-gray-100">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={message.id || index}
                        className={`flex ${
                            message.senderId === user.userId
                                ? 'justify-end'
                                : 'justify-start'
                        }`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                                message.senderId === user.userId
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200'
                            }`}
                        >
                            <p>{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-xs opacity-70">
                                    {formatTimestamp(message.timestamp)}
                                </p>
                                {message.senderId === user.userId && (
                                    <span className="text-xs ml-2">
                                        {message.status === 'read' ? '✓✓' : 
                                         message.status === 'delivered' ? '✓✓' : '✓'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t bg-white">
                <div className="flex space-x-2">
                    <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <FaSmile />
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute bottom-20 left-4">
                            <EmojiPicker
                                onEmojiClick={(emojiObject) => {
                                    setNewMessage(prev => prev + emojiObject.emoji);
                                    setShowEmojiPicker(false);
                                }}
                            />
                        </div>
                    )}
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                    >
                        <FaPaperPlane />
                    </button>
                </div>
                {error && (
                    <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
                {isTyping && (
                    <p className="text-sm text-gray-500 mt-2">
                        {chatType === 'admin' ? 'Admin' : 'Reviewer'} is typing...
                    </p>
                )}
            </form>
        </div>
    );
};

export default Chat;