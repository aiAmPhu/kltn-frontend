import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { FaPaperPlane, FaUser, FaSearch, FaEllipsisH, FaTrash, FaSmile } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import EmojiPicker from 'emoji-picker-react';

const ChatPage = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [onlineUsers, setOnlineUsers] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMessageOptions, setShowMessageOptions] = useState(null);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        socketRef.current = io(process.env.REACT_APP_API_BASE_URL.replace('/api', ''), {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        fetchMessages();
        fetchUsers();

        socketRef.current.on('receive_message', handleNewMessage);
        socketRef.current.on('user_typing', handleUserTyping);
        socketRef.current.on('user_status_change', handleUserStatusChange);
        socketRef.current.on('message_status', handleMessageStatus);
        socketRef.current.on('message_reaction', handleMessageReaction);
        socketRef.current.on('message_deleted', handleMessageDeleted);

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const handleUserStatusChange = ({ userId, status }) => {
        setOnlineUsers(prev => ({
            ...prev,
            [userId]: status === 'online'
        }));
    };

    const handleMessageStatus = ({ messageId, status }) => {
        setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, status } : msg
        ));
    };

    const handleMessageReaction = ({ messageId, reaction, userId }) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const reactions = { ...msg.reactions, [userId]: reaction };
                return { ...msg, reactions };
            }
            return msg;
        }));
    };

    const handleMessageDeleted = ({ messageId }) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    };

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
            
            const validUsers = (response.data.data || []).filter(user => 
                user && typeof user.userId === 'number' && user.name
            );
            
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
        
        if (!newMessage.trim() || !selectedUser || !selectedUser.userId || !user || !user.userId) {
            return;
        }

        try {
            const messageData = {
                roomId: `admin-${selectedUser.userId}`,
                content: newMessage,
                receiverId: parseInt(selectedUser.userId, 10)
            };

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

            setMessages(prev => [...prev, response.data]);
            socketRef.current.emit('send_message', messageData);
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const handleSearch = async (query) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/chat/search?query=${query}`,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }
                );
                setMessages(response.data);
            } catch (error) {
                console.error('Error searching messages:', error);
            }
        }, 300);
    };

    const addReaction = async (messageId, reaction) => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/chat/reaction`,
                { messageId, reaction },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            socketRef.current.emit('add_reaction', {
                messageId,
                reaction,
                roomId: `admin-${selectedUser.userId}`
            });
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    const deleteMessage = async (messageId) => {
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/chat/${messageId}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            socketRef.current.emit('delete_message', {
                messageId,
                roomId: `admin-${selectedUser.userId}`
            });
            setShowMessageOptions(null);
        } catch (error) {
            console.error('Error deleting message:', error);
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

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
            {/* Users List */}
            <div className="w-1/4 bg-white border-r">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold mb-4">Users</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FaSearch className="absolute right-3 top-3 text-gray-400" />
                    </div>
                </div>
                <div className="overflow-y-auto h-[calc(100%-8rem)]">
                    {users
                        .filter(user => 
                            user.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(user => (
                            <div
                                key={user.userId}
                                onClick={() => setSelectedUser(user)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                                    selectedUser?.userId === user.userId ? 'bg-blue-50' : ''
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <FaUser className="text-gray-400" />
                                        {onlineUsers[user.userId] && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        {typingUsers[user.userId] && (
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
                        <div className="p-4 border-b bg-white flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <FaUser className="text-gray-400" />
                                    {onlineUsers[selectedUser.userId] && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{selectedUser.name}</h2>
                                    <p className="text-sm text-gray-500">
                                        {onlineUsers[selectedUser.userId] ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
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
                                        <div className="relative group">
                                            <div
                                                className={`max-w-[70%] rounded-lg p-3 ${
                                                    message.senderId === parseInt(user.userId, 10)
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-200'
                                                }`}
                                            >
                                                <p>{message.content}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-xs opacity-70">
                                                        {formatTimestamp(message.timestamp)}
                                                    </p>
                                                    {message.senderId === parseInt(user.userId, 10) && (
                                                        <span className="text-xs ml-2">
                                                            {message.status === 'read' ? '✓✓' : 
                                                             message.status === 'delivered' ? '✓✓' : '✓'}
                                                        </span>
                                                    )}
                                                </div>
                                                {message.reactions && Object.keys(message.reactions).length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {Object.entries(message.reactions).map(([userId, reaction]) => (
                                                            <span key={userId} className="text-sm">
                                                                {reaction}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
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