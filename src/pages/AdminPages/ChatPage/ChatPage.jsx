import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { FaPaperPlane, FaUser } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';

const ChatPage = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(process.env.REACT_APP_API_BASE_URL.replace('/api', ''), {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        // Load all messages
        fetchMessages();
        // Load users
        fetchUsers();

        // Socket event listeners
        socketRef.current.on('receive_message', handleNewMessage);
        socketRef.current.on('user_typing', handleUserTyping);

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/chat/admin/all-messages`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/getall`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            // Ensure we have valid user data
            const validUsers = (response.data.data || []).filter(user => 
                user && typeof user.userId === 'number' && user.name
            );
            
            console.log('Fetched users:', validUsers);
            setUsers(validUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to load users. Please refresh the page.');
        }
    };

    const handleNewMessage = (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
    };

    const handleUserTyping = ({ userId, isTyping }) => {
        setTypingUsers(prev => ({
            ...prev,
            [userId]: isTyping
        }));
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        
        // Validate input
        if (!newMessage.trim()) {
            console.error('Message content is empty');
            return;
        }
        
        if (!selectedUser || !selectedUser.userId) {
            console.error('No user selected or invalid user data:', selectedUser);
            return;
        }
        
        if (!user || !user.userId) {
            console.error('User not authenticated:', user);
            return;
        }

        try {
            const messageData = {
                roomId: `admin-${selectedUser.userId}`,
                content: newMessage,
                receiverId: parseInt(selectedUser.userId, 10)
            };

            console.log('Sending message:', messageData);

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/chat/send`, 
                messageData,
                {
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Message sent successfully:', response.data);

            // Add the message to the local state
            setMessages(prev => [...prev, response.data]);
            
            // Emit the message through socket
            socketRef.current.emit('send_message', messageData);
            
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            // Show error message to user
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to send message. Please try again.');
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
            {/* Users List */}
            <div className="w-1/4 bg-white border-r">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Users</h2>
                </div>
                <div className="overflow-y-auto h-[calc(100%-4rem)]">
                    {users.length === 0 ? (
                        <div className="p-4 text-gray-500">No users available</div>
                    ) : (
                        users.map(user => (
                            <div
                                key={user.userId}
                                onClick={() => {
                                    console.log('Selecting user:', user);
                                    setSelectedUser(user);
                                }}
                                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                                    selectedUser?.userId === user.userId ? 'bg-blue-50' : ''
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <FaUser className="text-gray-400" />
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        {typingUsers[user.userId] && (
                                            <p className="text-sm text-gray-500">typing...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-white">
                            <h2 className="text-xl font-semibold">{selectedUser.name}</h2>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages
                                .filter(msg => {
                                    const roomId = `admin-${selectedUser.userId}`;
                                    return msg.roomId === roomId || 
                                           (msg.senderId === parseInt(selectedUser.userId, 10) && 
                                            msg.receiverId === parseInt(user.userId, 10));
                                })
                                .map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${
                                            message.senderId === parseInt(user.userId, 10) ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${
                                                message.senderId === parseInt(user.userId, 10)
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
                                    onChange={(e) => setNewMessage(e.target.value)}
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
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a user to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage; 