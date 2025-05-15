import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
    FaUserCheck,
    FaInfoCircle,
    FaGraduationCap,
    FaFileAlt,
    FaImage,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaIdCard,
    FaCalendarAlt,
    FaEnvelope,
    FaVenusMars,
    FaPhone,
    FaAddressCard,
} from "react-icons/fa";
import Header from "../../../components/Header";
import AdmissionInformation from "../../../components/Profile/AdmissionInformation";
import LearningProcess from "../../../components/Profile/LearningProcess";
import PhotoID from "../../../components/Profile/PhotoID";
import HighSchoolTranscript from "../../../components/Profile/HighSchoolTranscript";

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(null);
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adis/getBasicInfo/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(res.data.data); // hoặc setDetail(res.data.data) tùy theo backend bạn trả về
            } catch (err) {
                console.error("Lỗi khi lấy thông tin cơ bản người dùng:", err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchData();
    }, [userId, token]);

    const handleClick = (section) => {
        setActiveSection(section);
    };

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <div className="text-xl font-semibold text-blue-700">Đang tải dữ liệu...</div>
            </div>
        );

    if (!user)
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <FaExclamationTriangle className="text-5xl text-red-500 mb-4" />
                <div className="text-xl font-semibold text-red-600">Không tìm thấy người dùng.</div>
            </div>
        );

    const status = user?.status || "waiting";
    const feedbacks = user?.feedbackSummary;

    const getStatusIcon = () => {
        if (status === "accepted") return <FaCheckCircle className="text-4xl text-green-600 mb-4" />;
        if (status === "rejected") return <FaTimesCircle className="text-4xl text-red-600 mb-4" />;
        return null; // Bỏ FaSpinner cho trạng thái "waiting"
    };

    const getStatusColor = () => {
        if (status === "accepted") return "text-green-700";
        if (status === "rejected") return "text-red-600";
        return "text-yellow-600";
    };

    const getStatusText = () => {
        if (status === "accepted") return "Hồ sơ đã duyệt";
        if (status === "rejected") return "Hồ sơ bị từ chối";
        return "Hồ sơ đang chờ xử lý";
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="flex flex-1 pt-20 max-w-7xl mx-auto px-4">
                {/* Sidebar */}
                <aside className="w-1/4 bg-gradient-to-b from-blue-800 to-blue-900 text-white p-6 rounded-xl shadow-xl space-y-6 h-full">
                    <div className="text-center">
                        <img src="/path-to-hcmute-logo.png" alt="HCMUTE Logo" className="w-32 h-auto mx-auto mb-6" />
                        <h2 className="text-xl font-bold border-b border-blue-600 pb-2 mb-4">Quản lý hồ sơ</h2>
                    </div>
                    <nav>
                        <ul className="space-y-2">
                            <li
                                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-md transition-all duration-200 ${
                                    activeSection === null
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "hover:bg-blue-700 text-blue-100"
                                }`}
                                onClick={() => handleClick(null)}
                            >
                                <FaUserCheck className="text-lg" />
                                <span className="font-medium">Trạng thái hồ sơ</span>
                            </li>
                            <li
                                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-md transition-all duration-200 ${
                                    activeSection === "admissioninformation"
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "hover:bg-blue-700 text-blue-100"
                                }`}
                                onClick={() => handleClick("admissioninformation")}
                            >
                                <FaInfoCircle className="text-lg" />
                                <span className="font-medium">Thông tin xét tuyển</span>
                            </li>
                            <li
                                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-md transition-all duration-200 ${
                                    activeSection === "learningprocess"
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "hover:bg-blue-700 text-blue-100"
                                }`}
                                onClick={() => handleClick("learningprocess")}
                            >
                                <FaGraduationCap className="text-lg" />
                                <span className="font-medium">Quá trình học tập</span>
                            </li>
                            <li
                                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-md transition-all duration-200 ${
                                    activeSection === "highschooltranscript"
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "hover:bg-blue-700 text-blue-100"
                                }`}
                                onClick={() => handleClick("highschooltranscript")}
                            >
                                <FaFileAlt className="text-lg" />
                                <span className="font-medium">Học bạ THPT</span>
                            </li>
                            <li
                                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-md transition-all duration-200 ${
                                    activeSection === "photoid"
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "hover:bg-blue-700 text-blue-100"
                                }`}
                                onClick={() => handleClick("photoid")}
                            >
                                <FaImage className="text-lg" />
                                <span className="font-medium">Hồ sơ ảnh</span>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 p-6 ml-6 bg-white shadow-xl rounded-xl">
                    {activeSection === "admissioninformation" && <AdmissionInformation />}
                    {activeSection === "learningprocess" && <LearningProcess />}
                    {activeSection === "photoid" && <PhotoID />}
                    {activeSection === "highschooltranscript" && <HighSchoolTranscript />}
                    {!activeSection && (
                        <div className="space-y-8">
                            {/* Tiêu đề */}
                            <h2 className="text-3xl font-extrabold text-blue-700 uppercase tracking-wide border-l-8 border-blue-500 pl-4 bg-blue-50 py-2">
                                Trạng thái Hồ Sơ
                            </h2>

                            <div className="flex flex-col items-center max-w-md mx-auto">
                                {getStatusIcon()}
                                <p className={`text-xl font-semibold ${getStatusColor()}`}>{getStatusText()}</p>
                            </div>

                            {status === "rejected" && feedbacks.length > 0 && (
                                <div className="feedback-list mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-lg max-w-md mx-auto">
                                    <h3 className="text-lg font-semibold mb-2">
                                        <FaExclamationTriangle className="inline-block mr-2" />
                                        Lý do từ chối:
                                    </h3>
                                    <p className="mt-2 text-base whitespace-pre-line">
                                        {user?.feedbackSummary || "Chưa có lý do cụ thể."}
                                    </p>
                                </div>
                            )}

                            {/* Thông tin chi tiết */}
                            <div>
                                <h3 className="text-xl font-bold text-blue-700 mb-6 border-b border-gray-200 pb-2">
                                    Thông tin cá nhân
                                </h3>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Ảnh thẻ */}
                                    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm">
                                        <div className="mb-3 text-blue-700 font-semibold flex items-center">
                                            <FaIdCard className="mr-2" /> Ảnh thẻ
                                        </div>
                                        <img
                                            src={user?.pic || "https://via.placeholder.com/96x128"}
                                            alt="Profile"
                                            className="w-24 h-32 object-cover rounded-lg shadow-md border-2 border-gray-300"
                                        />
                                    </div>

                                    {/* Thông tin cá nhân */}
                                    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                                        <p className="flex items-center text-gray-800">
                                            <FaUserCheck className="text-blue-600 mr-3" />
                                            <span className="font-medium text-gray-600">Họ và tên:</span>
                                            <span className="ml-2">{user?.fullName || "Chưa cập nhật"}</span>
                                        </p>
                                        <p className="flex items-center text-gray-800">
                                            <FaCalendarAlt className="text-blue-600 mr-3" />
                                            <span className="font-medium text-gray-600">Ngày sinh:</span>
                                            <span className="ml-2">
                                                {user?.birthDate
                                                    ? dayjs(user.birthDate).format("DD/MM/YYYY")
                                                    : "Chưa cập nhật"}
                                            </span>
                                        </p>
                                        <p className="flex items-center text-gray-800">
                                            <FaEnvelope className="text-blue-600 mr-3" />
                                            <span className="font-medium text-gray-600">Email:</span>
                                            <span className="ml-2">{user?.email || "Chưa cập nhật"}</span>
                                        </p>
                                        <p className="flex items-center text-gray-800">
                                            <FaVenusMars className="text-blue-600 mr-3" />
                                            <span className="font-medium text-gray-600">Giới tính:</span>
                                            <span className="ml-2">{user?.gender || "Chưa cập nhật"}</span>
                                        </p>
                                        <p className="flex items-center text-gray-800">
                                            <FaPhone className="text-blue-600 mr-3" />
                                            <span className="font-medium text-gray-600">Số điện thoại:</span>
                                            <span className="ml-2">{user?.phoneNumber || "Chưa cập nhật"}</span>
                                        </p>
                                        <p className="flex items-center text-gray-800">
                                            <FaAddressCard className="text-blue-600 mr-3" />
                                            <span className="font-medium text-gray-600">CCCD:</span>
                                            <span className="ml-2">{user?.idNumber || "Chưa cập nhật"}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
