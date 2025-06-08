import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaGraduationCap, FaFileAlt, FaImages, FaSignOutAlt, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import axios from "axios";
import logo from "../../assets/logo_hcmute.png";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// Import các tab component
import Information from "./Information";
import LearningProccess from "./LearningProccess";
import Transcript from "./Transcript";
import Photo from "./Photo";

const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState("photo");
    const [userName, setUserName] = useState("");

    useDocumentTitle(userName ? `Chi tiết: ${userName}` : `Chi tiết User: ${id}`);

    const menuItems = [
        { path: "photo", label: "Ảnh cần thiết", icon: <FaImages className="text-lg" /> },
        { path: "info", label: "Thông tin", icon: <FaUser className="text-lg" /> },
        { path: "progress", label: "Quá trình học", icon: <FaGraduationCap className="text-lg" /> },
        { path: "transcript", label: "Học bạ", icon: <FaFileAlt className="text-lg" /> },
    ];

    // Fetch user name
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const token = localStorage.getItem("token");
                // Try to get all users and find the specific one
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/getForReviewer`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                const users = response.data?.data?.users || [];
                const user = users.find(u => u.userId.toString() === id.toString());
                
                if (user && user.name) {
                    setUserName(user.name);
                }
            } catch (error) {
                console.error("Error fetching user name:", error);
                // If API fails, just use the ID as fallback
                setUserName(`User ${id}`);
            }
        };

        if (id) {
            fetchUserName();
        }
    }, [id]);

    // Check screen size to determine mobile view
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768; // md breakpoint
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false); // Auto close sidebar on mobile
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    // Close sidebar when clicking on overlay (mobile only)
    const closeSidebar = () => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleNavigation = (path) => {
        setActiveTab(path);
        navigate(`/reviewer/user/${id}/${path}`);
        if (isMobile) setIsSidebarOpen(false); // Close sidebar after clicking on mobile
    };

    const isActivePath = (path) => {
        return location.pathname.includes(`/${path}`) || activeTab === path;
    };

    // Custom link class for active/inactive and compact/expanded
    const linkClass = (path) =>
        `group flex items-center w-full ${
            isSidebarOpen ? "space-x-3 px-3" : "justify-center px-0"
        } py-3 rounded-none transition-all duration-200 ${
            isActivePath(path) 
                ? "bg-blue-800 font-semibold shadow-lg border-l-4 border-white/30 bg-gradient-to-r from-blue-800 to-blue-700" 
                : "hover:bg-blue-700 hover:shadow-md"
        }`;

    return (
        <div className="flex h-screen relative">
            <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;  /* Internet Explorer 10+ */
                    scrollbar-width: none;  /* Firefox */
                }
                .scrollbar-hide::-webkit-scrollbar { 
                    display: none;  /* Safari and Chrome */
                }
            `}</style>
            
            {/* Mobile Overlay */}
            {isMobile && isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={`${
                    isMobile ? 'fixed' : 'relative'
                } ${
                    isSidebarOpen ? "w-64" : "w-16"
                } ${
                    isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'
                } ${
                    isMobile ? 'z-50 h-full' : ''
                } bg-[#00548f] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-blue-950 overflow-hidden`}
            >
                {/* Logo */}
                <div className="flex flex-col items-center py-4">
                    <img
                        src={logo}
                        alt="HCMUTE Logo"
                        className={`${isSidebarOpen ? "w-20" : "w-8"} mb-3 transition-all duration-300`}
                    />
                    {isSidebarOpen && <span className="text-xs font-bold tracking-wide">HCMUTE</span>}
                </div>

                {/* Menu items */}
                <nav className={`flex-1 ${isSidebarOpen ? "px-2" : "px-1"} space-y-1 overflow-y-auto scrollbar-hide`}>
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={linkClass(item.path)}
                        >
                            <span
                                className={`${
                                    isActivePath(item.path)
                                        ? "text-white"
                                        : "text-blue-100 group-hover:text-white"
                                }`}
                            >
                                {item.icon}
                            </span>
                            {isSidebarOpen && (
                                <span
                                    className={`truncate text-sm ${
                                        isActivePath(item.path) ? "font-semibold" : "font-normal"
                                    }`}
                                >
                                    {item.label}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col ${isMobile ? 'w-full' : ''}`}>
                {/* Topbar */}
                <div className="bg-[#00548f] text-white py-3 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSidebar}
                            className={`
                                flex items-center justify-center
                                w-9 h-9 rounded-full
                                bg-white/20 hover:bg-white/30
                                text-white transition
                                focus:outline-none
                                border border-white/30
                                shadow
                            `}
                            title={isSidebarOpen ? "Thu gọn menu" : "Mở rộng menu"}
                            style={{
                                backdropFilter: "blur(2px)",
                            }}
                        >
                            {isSidebarOpen ? (
                                <FaAngleDoubleLeft className="text-lg" />
                            ) : (
                                <FaAngleDoubleRight className="text-lg" />
                            )}
                        </button>
                        <span className="text-sm sm:text-base lg:text-lg font-semibold truncate">
                            <span className="hidden lg:inline">Chi tiết: </span>
                            <span className="text-blue-200">{userName || `User ${id}`}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => navigate("/reviewer")}
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white"
                        >
                            <FaAngleDoubleLeft className="text-lg" />
                            <span className="hidden sm:inline">Quay lại</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-white"
                            title="Đăng xuất"
                        >
                            <FaSignOutAlt className="text-xl" />
                            <span className="hidden sm:inline">Đăng xuất</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto bg-white rounded-xl shadow-sm">
                    {activeTab === "photo" && <Photo userId={id} />}
                    {activeTab === "info" && <Information userId={id} />}
                    {activeTab === "progress" && <LearningProccess userId={id} />}
                    {activeTab === "transcript" && <Transcript userId={id} />}
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;
