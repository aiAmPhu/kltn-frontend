import { useState } from "react";
import { UserPlus, GraduationCap, Award, BookOpen, MessageCircle, ChevronDown, X } from "lucide-react";
import axios from "axios";
import Banner from "./Banner.jsx";
import Announcements from "./Announcements.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Chat from "../pages/UserPages/Chat.jsx";
import { toast } from "react-toastify";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useQuery } from "@tanstack/react-query";

function HomePage() {
    const [showChat, setShowChat] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    useDocumentTitle("Trang chủ");

    // Majors query
    const { data: majors = [], isLoading: isMajorsLoading, error: majorsError } = useQuery({
        queryKey: ['majors'],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            if (token) {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/wish/form-data`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                return response.data.data.majors;
            } else {
                const majorsRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adms/getAll`);
                return majorsRes.data;
            }
        },
        staleTime: 5 * 60 * 1000,
    });

    // Statistics query
    const { data: statistics = { majorsCount: majors.length, criteriaCount: 0, blocksCount: 0, loading: true }, isLoading: isStatsLoading, error: statsError } = useQuery({
        queryKey: ['homepage_statistics'],
        queryFn: async () => {
            const [criteriaRes, blocksRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/adcs/getall`),
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/adbs/getall`)
            ]);
            return {
                majorsCount: majors.length,
                criteriaCount: criteriaRes.data.length,
                blocksCount: blocksRes.data.length,
                loading: false
            };
        },
        staleTime: 5 * 60 * 1000,
        enabled: majors.length > 0,
    });

    const loading = isMajorsLoading || isStatsLoading;
    const error = majorsError || statsError;

    const handleChatClick = () => {
        if (!user) {
            toast.error("Vui lòng đăng nhập để sử dụng tính năng chat");
            return;
        }
        setShowChat(prev => !prev);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Banner />
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Statistics Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Số lượng ngành xét tuyển */}
                    <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200">
                        <div className="text-4xl font-bold text-purple-600 mb-2">
                            {statistics.loading ? (
                                <div className="animate-pulse bg-gray-200 h-12 w-16 mx-auto rounded"></div>
                            ) : (
                                statistics.majorsCount
                            )}
                        </div>
                        <div className="text-gray-600 font-medium">
                            Ngành xét tuyển
                        </div>
                    </div>
                    {/* Số lượng diện xét tuyển */}
                    <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200">
                        <div className="text-4xl font-bold text-indigo-600 mb-2">
                            {statistics.loading ? (
                                <div className="animate-pulse bg-gray-200 h-12 w-16 mx-auto rounded"></div>
                            ) : (
                                statistics.criteriaCount
                            )}
                        </div>
                        <div className="text-gray-600 font-medium">
                            Diện xét tuyển
                        </div>
                    </div>
                    {/* Số lượng khối xét tuyển */}
                    <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200">
                        <div className="text-4xl font-bold text-emerald-600 mb-2">
                            {statistics.loading ? (
                                <div className="animate-pulse bg-gray-200 h-12 w-16 mx-auto rounded"></div>
                            ) : (
                                statistics.blocksCount
                            )}
                        </div>
                        <div className="text-gray-600 font-medium">
                            Khối xét tuyển
                        </div>
                    </div>
                </div>
                {/* Announcements Section */}
                <Announcements />
                {/* Đại học chính quy */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6 shadow-md">
                    <div className="flex justify-center items-center mb-6">
                        <h2 className="text-2xl font-bold text-blue-800 flex items-center">
                            <GraduationCap className="w-8 h-8 mr-2 text-blue-700" />
                            ĐẠI HỌC CHÍNH QUY
                            <GraduationCap className="w-8 h-8 ml-2 text-blue-700" />
                        </h2>
                    </div>
                    {loading ? (
                        <div className="text-center p-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto mb-2"></div>
                            <p className="text-gray-600">Đang tải ngành học...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-4 rounded-lg text-red-600 mb-4">
                            <p>Lỗi: {error.message || error}</p>
                        </div>
                    ) : majors.length === 0 ? (
                        <p className="text-gray-600 mb-4 text-center">Không có ngành học nào.</p>
                    ) : (
                        <>
                            <div className="space-y-4 mb-4">
                                {majors.slice(0, 5).map((major, index) => (
                                    <div
                                        key={major.majorId}
                                        className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200"
                                    >
                                        <div className="flex items-center mb-2 md:mb-0">
                                            <Award className="w-5 h-5 mr-2 text-yellow-500" />
                                            <span className="text-blue-800 font-medium text-lg">{major.majorName}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => navigate('/wish', { state: { selectedMajor: major } })}
                                                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg flex items-center text-sm transition-all duration-200 hover:translate-y-px"
                                            >
                                                <UserPlus className="w-4 h-4 mr-1" />
                                                Đăng ký
                                            </button>
                                            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg flex items-center text-sm transition-all duration-200 hover:translate-y-px">
                                                <BookOpen className="w-4 h-4 mr-1" />
                                                Hướng dẫn
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {majors.length > 5 && (
                                <div className="text-center mt-6">
                                    <button
                                        onClick={() => navigate('/major')}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow hover:shadow-lg flex items-center text-base transition-all duration-200 hover:translate-y-px mx-auto"
                                    >
                                        <ChevronDown className="w-5 h-5 mr-2" />
                                        Xem thêm {majors.length - 5} ngành học
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {/* Floating Chat Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleChatClick}
                    className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 hover:scale-105 ${
                        showChat ? 'ring-2 ring-blue-300 ring-offset-2' : ''
                    }`}
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="hidden md:inline font-medium">Chat</span>
                </button>
            </div>
            {/* Chat Popup */}
            {showChat && (
                <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <MessageCircle className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">Chat</h2>
                        </div>
                        <button
                            onClick={() => setShowChat(false)}
                            className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-blue-600 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden bg-gray-50">
                        <Chat chatType="admin" onClose={() => setShowChat(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;
