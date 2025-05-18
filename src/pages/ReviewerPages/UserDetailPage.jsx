import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaGraduationCap, FaFileAlt, FaImages, FaSignOutAlt, FaBars, FaArrowLeft } from "react-icons/fa";

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
        { path: "info", label: "Thông tin", icon: <FaUser /> },
        { path: "progress", label: "Quá trình học", icon: <FaGraduationCap /> },
        { path: "transcript", label: "Học bạ", icon: <FaFileAlt /> },
        { path: "photo", label: "Ảnh cần thiết", icon: <FaImages /> },
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 ease-in-out shadow-xl ${
                    isSidebarOpen ? "w-72" : "w-20"
                }`}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-10">
                        {isSidebarOpen && (
                            <h1 className="text-2xl font-bold tracking-tight">Reviewer Panel</h1>
                        )}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            <FaBars className="text-xl" />
                        </button>
                    </div>

                    <nav className="space-y-3">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 ${
                                    isActivePath(item.path)
                                        ? "bg-white text-blue-600 shadow-lg"
                                        : "hover:bg-blue-700"
                                }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {isSidebarOpen && (
                                    <span className="ml-4 font-medium">{item.label}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="absolute bottom-0 w-full p-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center p-4 rounded-xl hover:bg-blue-700 transition-colors duration-200"
                    >
                        <FaSignOutAlt className="text-xl" />
                        {isSidebarOpen && <span className="ml-4 font-medium">Đăng xuất</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div
                className={`transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? "ml-72" : "ml-20"
                }`}
            >
                {/* Topbar */}
                <div className="bg-white shadow-sm border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Chi tiết User: <span className="text-blue-600">{id}</span>
                                </h2>
                            </div>
                            <button
                                onClick={() => navigate("/reviewer")}
                                className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                                <FaArrowLeft className="mr-2" />
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="max-w-7xl mx-auto p-6">
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
