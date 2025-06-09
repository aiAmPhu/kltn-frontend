import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { User, HelpCircle, UserPlus, Bell } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext.js";
import axios from "axios";
import hcmuteLogo from "../assets/logo_hcmute.png"
import io from "socket.io-client";

function Header() {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const socketRef = useRef(null);

    // Socket.IO connection
    useEffect(() => {
        if (user) {
            const token = localStorage.getItem("token");
            // Remove /api from the base URL for Socket.IO connection
            const socketUrl = process.env.REACT_APP_API_BASE_URL.replace('/api', '');
            socketRef.current = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'],
                path: '/socket.io/',
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            socketRef.current.on("connect", () => {
                // Remove console.log
            });

            socketRef.current.on("connect_error", (error) => {
                // Remove console.error
                setTimeout(() => {
                    if (socketRef.current) {
                        socketRef.current.connect();
                    }
                }, 5000);
            });

            socketRef.current.on("notification", (notification) => {
                if (!notification || !notification.id) {
                    return;
                }
                setNotifications(prev => {
                    const exists = prev.some(n => n.id === notification.id);
                    if (exists) return prev;
                    return [notification, ...prev];
                });
                setUnreadCount(prev => prev + 1);
                if (notification.message && !notification.read) {
                    toast.info(notification.message, {
                        toastId: notification.id,
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            });

            // Fetch existing notifications
            const fetchNotifications = async () => {
                try {
                    const response = await axios.get(
                        `${process.env.REACT_APP_API_BASE_URL}/notifications/user/${user.userId}`,
                        {
                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                        }
                    );
                    
                    if (!Array.isArray(response.data)) {
                        return;
                    }

                    const sortedNotifications = response.data
                        .filter(current => current && current.id)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    setNotifications(sortedNotifications);
                    setUnreadCount(sortedNotifications.filter(n => !n.read).length);
                } catch (error) {
                    toast.error("Không thể tải thông báo. Vui lòng thử lại sau.");
                }
            };
            fetchNotifications();

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [user]);

    //useEffect xử lý dropdownBox User
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle click outside for notifications
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSignUpClick = () => {
        navigate("/register/step1"); // hoặc "/login" nếu bạn muốn chuyển đến trang đăng nhập
    };

    const handleSignInClick = () => {
        navigate("/login"); // hoặc "/login" nếu bạn muốn chuyển đến trang đăng nhập
    };

    const handleChangePassword = () => {
        navigate("/changePassword"); // hoặc "/login" nếu bạn muốn chuyển đến trang đăng nhập
        setIsDropdownOpen(false);
    };
    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/jwt/logout`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            // Remove console.error
        } finally {
            logout();
            toast.success("Đăng xuất thành công!");
            navigate("/");
        }
    };

    const handleViewProfile = () => {
        setIsDropdownOpen(false);
        navigate("/profile", { replace: true });
    };

    // Mark notifications as read
    const markAsRead = async (notificationId) => {
        if (!notificationId) {
            return;
        }

        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/notifications/${notificationId}/read`,
                {},
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error("Không thể đánh dấu thông báo đã đọc. Vui lòng thử lại sau.");
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        if (!user || unreadCount === 0) {
            return;
        }

        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/notifications/user/${user.userId}/read-all`,
                {},
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            
            // Update all notifications to read status
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
            setUnreadCount(0);
            toast.success("Đã đánh dấu tất cả thông báo đã đọc!");
        } catch (error) {
            toast.error("Không thể đánh dấu tất cả thông báo. Vui lòng thử lại sau.");
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification || !notification.id) return;

        // Mark as read first
        markAsRead(notification.id);

        // Navigate to profile page
        navigate('/profile');
        setIsNotificationOpen(false);
    };

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50 py-2">
            <div className="max-w-screen-xl mx-auto px-4 w-full">
                <div className="flex justify-between items-center">
                    {/* Logo and university name */}
                    <div className="flex items-center">
                        <Link to="/">
                            <img src="/hcmute-logo.png" alt="Logo" className="h-12 w-auto mr-2 cursor-pointer hover:opacity-80 transition-opacity" />
                        </Link>
                    </div>

                    {/* Navigation menu */}
                    <nav>
                        <ul className="flex">
                            {[
                                { id: 'home', to: "/", label: "TRANG CHỦ" },
                                { id: 'major', to: "/major", label: "NGÀNH XÉT TUYỂN" },
                                { id: 'criteria', to: "/criteria", label: "DIỆN XÉT TUYỂN" },
                                { id: 'block', to: "/block", label: "KHỐI XÉT TUYỂN" },
                                { id: 'wish', to: "/wish", label: "ĐĂNG KÝ XÉT TUYỂN" },
                                { id: 'result', to: "/result", label: "KẾT QUẢ XÉT TUYỂN" },
                            ].map(({ id, to, label }) => {
                                const isActive = location.pathname === to;
                                return (
                                    <li key={id}>
                                        <Link
                                            to={to}
                                            className={`px-3 py-4 block font-medium text-sm hover:text-blue-900 ${
                                                isActive ? "text-red-600" : "text-blue-700"
                                            }`}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Action buttons */}
                    <div className="flex space-x-2">
                        <button className="bg-red-500 text-white px-4 py-3 rounded text-xs flex items-center h-10">
                            <HelpCircle className="w-4 h-4 mr-1" />
                            Hướng dẫn
                        </button>
                        {user && (
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setIsNotificationOpen(prev => !prev)}
                                    className="relative border border-gray-300 rounded px-4 py-3 bg-white text-sm font-medium text-gray-700 flex items-center justify-center gap-2 h-10"
                                >
                                    <Bell className="w-4 h-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {isNotificationOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                                        {!notifications || notifications.length === 0 ? (
                                            <div key="no-notifications" className="p-4 text-center text-gray-500">
                                                Không có thông báo mới
                                            </div>
                                        ) : (
                                            <>
                                                                                                 <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                                                     <span className="text-sm font-medium text-gray-700">
                                                         Thông báo
                                                     </span>
                                                     {unreadCount > 0 && (
                                                         <button
                                                             onClick={markAllAsRead}
                                                             className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                                         >
                                                             Đánh dấu tất cả đã đọc
                                                         </button>
                                                     )}
                                                 </div>
                                                {notifications.map((notification) => {
                                                    if (!notification || !notification.id) {
                                                        console.error("Invalid notification in list:", notification);
                                                        return null;
                                                    }
                                                    return (
                                                        <div
                                                            key={notification.id}
                                                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                                                !notification.read ? "bg-blue-50" : ""
                                                            }`}
                                                            onClick={() => handleNotificationClick(notification)}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {notification.title || 'Thông báo mới'}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {notification.message || 'Nội dung thông báo'}
                                                                    </p>
                                                                    {notification.createdAt && (
                                                                        <p className="text-xs text-gray-400 mt-1">
                                                                            {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {!notification.read && (
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }).filter(Boolean)}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                                    className="border border-gray-300 rounded px-4 py-3 bg-white text-sm font-medium text-gray-700 flex items-center justify-center gap-2 h-10"
                                >
                                    <img src={hcmuteLogo} alt="Logo" className="w-4 h-4 rounded-full" />
                                    {user.name}
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                                        <button
                                            key="profile"
                                            onClick={handleViewProfile}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Hồ sơ của tôi
                                        </button>
                                        <button
                                            key="change-password"
                                            onClick={handleChangePassword}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Đổi mật khẩu
                                        </button>
                                        <button
                                            key="logout"
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    key="signup"
                                    className="bg-blue-600 text-white px-4 py-3 rounded text-xs flex items-center h-10"
                                    onClick={handleSignUpClick}
                                >
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Đăng ký
                                </button>
                                <button
                                    key="signin"
                                    className="bg-gray-100 text-gray-800 px-4 py-3 rounded text-xs flex items-center h-10"
                                    onClick={handleSignInClick}
                                >
                                    <User className="w-4 h-4 mr-1" />
                                    Đăng nhập
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
