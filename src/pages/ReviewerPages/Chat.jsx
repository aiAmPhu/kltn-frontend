import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { FaPaperPlane, FaUser } from 'react-icons/fa';

const Chat = () => {
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
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
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
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const messageData = {
                roomId: `reviewer-${selectedUser.id}`,
                content: newMessage,
                receiverId: selectedUser.id
            };

            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/chat/send`, messageData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            socketRef.current.emit('send_message', messageData);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
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
                    {users.map(user => (
                        <div
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`p-4 cursor-pointer hover:bg-gray-50 ${
                                selectedUser?.id === user.id ? 'bg-blue-50' : ''
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <FaUser className="text-gray-400" />
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    {typingUsers[user.id] && (
                                        <p className="text-sm text-gray-500">typing...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
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
                                .filter(msg => 
                                    msg.roomId === `reviewer-${selectedUser.id}` ||
                                    (msg.senderId === selectedUser.id && msg.receiverId === 'reviewer')
                                )
                                .map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${
                                            message.senderId === 'reviewer' ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${
                                                message.senderId === 'reviewer'
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

export default Chat; 