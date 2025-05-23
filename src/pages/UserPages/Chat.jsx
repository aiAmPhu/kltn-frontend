import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Initialize socket connection
        socketRef.current = io(process.env.REACT_APP_API_BASE_URL.replace('/api', ''), {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        // Join room
        socketRef.current.emit('join_room', `admin-${user.userId}`);

        // Load chat history
        fetchChatHistory();

        // Socket event listeners
        socketRef.current.on('receive_message', handleNewMessage);
        socketRef.current.on('user_typing', handleUserTyping);

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user, navigate]);

    const fetchChatHistory = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/chat/history/admin-${user.userId}`,
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
        setMessages(prev => [...prev, message]);
        scrollToBottom();
    };

    const handleUserTyping = ({ userId, isTyping }) => {
        setIsTyping(isTyping);
    };

    const handleTyping = () => {
        if (!socketRef.current || !user) return;

        socketRef.current.emit('typing', {
            roomId: `admin-${user.userId}`,
            userId: user.userId,
            isTyping: true
        });

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current.emit('typing', {
                roomId: `admin-${user.userId}`,
                userId: user.userId,
                isTyping: false
            });
        }, 1000);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        try {
            // Get admin ID from environment variable or use a default admin ID
            const adminId = process.env.REACT_APP_ADMIN_ID || 1; // Default to 1 if not set

            const messageData = {
                roomId: `admin-${user.userId}`,
                content: newMessage,
                receiverId: parseInt(adminId, 10) // Ensure receiverId is a number
            };

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/chat/send`,
                messageData,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );

            // Add the sent message to the messages list
            setMessages(prev => [...prev, response.data]);
            
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

    if (!user) {
        return null;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-100">
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
                <h2 className="text-xl font-semibold">Chat with Admin</h2>
                {isTyping && (
                    <p className="text-sm text-gray-500">Admin is typing...</p>
                )}
                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
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
                            <p className="text-xs mt-1 opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t bg-white">
                <div className="flex space-x-2">
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
            </form>
        </div>
    );
};

export default Chat; 