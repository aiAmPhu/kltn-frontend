import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaGraduationCap, FaFileAlt, FaImages, FaSignOutAlt, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import logo from "../../assets/logo_hcmute.png";

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
    const [activeTab, setActiveTab] = useState("info");

    const menuItems = [
        { path: "photo", label: "Ảnh cần thiết", icon: <FaImages className="text-lg" /> },
        { path: "info", label: "Thông tin", icon: <FaUser className="text-lg" /> },
        { path: "progress", label: "Quá trình học", icon: <FaGraduationCap className="text-lg" /> },
        { path: "transcript", label: "Học bạ", icon: <FaFileAlt className="text-lg" /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleNavigation = (path) => {
        setActiveTab(path);
        navigate(`/reviewer/user/${id}/${path}`);
    };

    const isActivePath = (path) => {
        return location.pathname.includes(`/${path}`);
    };

    // Hover tràn hết chiều rộng sidebar
    const linkClass = (path) =>
        `group flex items-center w-full ${
            isSidebarOpen ? "space-x-3 px-3" : "justify-center px-0"
        } py-2 rounded-lg transition-all duration-200 ${
            isActivePath(path)
                ? "bg-blue-800 font-semibold"
                : "hover:bg-blue-700 hover:text-white hover:scale-[1.03] hover:shadow-md"
        } focus:outline-none`;

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div
                className={`${
                    isSidebarOpen ? "w-64" : "w-16"
                } bg-[#00548f] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-blue-900/30`}
            >
                {/* Logo */}
                <div className="flex flex-col items-center py-4">
                    <img
                        src={logo}
                        alt="HCMUTE Logo"
                        className={`${
                            isSidebarOpen ? "w-20" : "w-8"
                        } mb-3 transition-all duration-300`}
                    />
                    {isSidebarOpen && (
                        <span className="text-xs font-bold tracking-wide">HCMUTE</span>
                    )}
                </div>

                {/* Menu items */}
                <nav className={`flex-1 ${isSidebarOpen ? "px-2" : "px-1"} space-y-1`}>
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={linkClass(item.path)}
                            tabIndex={0}
                            style={{
                                outline: "none",
                                cursor: "pointer",
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <span
                                className={`transition-colors duration-150 ${
                                    isActivePath(item.path)
                                        ? "text-white"
                                        : "text-blue-100 group-hover:text-white"
                                }`}
                            >
                                {item.icon}
                            </span>
                            {isSidebarOpen && (
                                <span
                                    className={`truncate text-sm transition-colors duration-150 ${
                                        isActivePath(item.path)
                                            ? "font-semibold"
                                            : "font-normal group-hover:text-white"
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
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <div className="bg-[#00548f] text-white py-3 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`
                                ml-3 flex items-center justify-center
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
                        <span className="text-lg font-semibold">
                            Chi tiết User: <span className="text-blue-200">{id}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/reviewer")}
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white"
                        >
                            <FaAngleDoubleLeft className="text-lg" />
                            <span>Quay lại</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-white"
                            title="Đăng xuất"
                        >
                            <FaSignOutAlt className="text-xl" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 overflow-y-auto bg-gray-100 h-full">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="overflow-y-auto max-h-[70vh]">
                            {activeTab === "info" && <Information userId={id} />}
                            {activeTab === "progress" && <LearningProccess userId={id} />}
                            {activeTab === "transcript" && <Transcript userId={id} />}
                            {activeTab === "photo" && <Photo userId={id} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;
