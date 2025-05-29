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
    FaUser,
    FaBook,
    FaClipboardList,
    FaIdBadge,
    FaHistory,
    FaChartLine,
    FaUniversity,
    FaSchool,
    FaAward,
    FaCertificate,
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
    const [idPhoto, setIdPhoto] = useState(null);
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, photoRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/adis/getBasicInfo/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/photo/getPhoto/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);
                setUser(userRes.data.data);
                if (photoRes.data.data) {
                    setIdPhoto(photoRes.data.data.personalPic);
                }
            } catch (err) {
                console.error("Lỗi khi lấy thông tin:", err);
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
        return null;
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

    const menuItems = [
        { id: null, icon: <FaUserCheck />, label: "Trạng thái hồ sơ" },
        { id: "admissioninformation", icon: <FaInfoCircle />, label: "Thông tin xét tuyển" },
        { id: "learningprocess", icon: <FaGraduationCap />, label: "Quá trình học tập" },
        { id: "highschooltranscript", icon: <FaFileAlt />, label: "Học bạ THPT" },
        { id: "photoid", icon: <FaImage />, label: "Hồ sơ ảnh" },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex flex-1 pt-20 max-w-7xl mx-auto px-4">
                {/* Sidebar */}
                <aside className="w-1/4 bg-white rounded-xl shadow-lg p-6 space-y-6">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <FaUser className="text-4xl text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Quản lý hồ sơ</h2>
                    </div>
                    <nav>
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li key={item.id || 'status'}>
                                    <button
                                        onClick={() => handleClick(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                            activeSection === item.id
                                        ? "bg-blue-600 text-white shadow-md"
                                                : "hover:bg-blue-50 text-gray-700"
                                }`}
                            >
                                        <span className="text-lg">{item.icon}</span>
                                        <span className="font-medium break-words whitespace-normal">{item.label}</span>
                                    </button>
                            </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 p-6 ml-6 bg-white shadow-lg rounded-xl">
                    {activeSection === "admissioninformation" && <AdmissionInformation />}
                    {activeSection === "learningprocess" && <LearningProcess />}
                    {activeSection === "photoid" && <PhotoID />}
                    {activeSection === "highschooltranscript" && <HighSchoolTranscript />}
                    {!activeSection && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-bold text-gray-800">
                                    <FaClipboardList className="inline-block mr-3 text-blue-600" />
                                Trạng thái Hồ Sơ
                            </h2>
                                <div className="flex items-center gap-2">
                                    <FaHistory className="text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                        Cập nhật lần cuối: {dayjs().format("DD/MM/YYYY HH:mm")}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                {getStatusIcon()}
                                <p className={`text-xl font-semibold ${getStatusColor()}`}>{getStatusText()}</p>
                            </div>

                            {status === "rejected" && feedbacks.length > 0 && (
                                <div className="feedback-list mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-sm max-w-md mx-auto">
                                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                                        <FaExclamationTriangle className="mr-2" />
                                        Lý do từ chối:
                                    </h3>
                                    <p className="mt-2 text-base whitespace-pre-line">
                                        {user?.feedbackSummary || "Chưa có lý do cụ thể."}
                                    </p>
                                </div>
                            )}

                            <div className="mt-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <FaIdBadge className="mr-3 text-blue-600" />
                                    Thông tin cá nhân
                                </h3>

                                <div className="grid grid-cols-[0.5fr_2fr] gap-8">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex flex-col items-center">
                                            {idPhoto ? (
                                                <div className="w-32 h-40 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                                                    <img 
                                                        src={idPhoto} 
                                                        alt="Ảnh thẻ" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-32 h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                                    <FaIdCard className="text-4xl text-gray-400" />
                                                </div>
                                            )}
                                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Ảnh thẻ</h4>
                                            <p className="text-sm text-gray-500">Kích thước: 3x4 cm</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FaUser className="text-blue-600" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Họ và tên</p>
                                                    <p className="font-medium break-words whitespace-normal">
                                                {user.fullName === "null null" ? "Chưa cập nhật" : user.fullName}
                                        </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FaCalendarAlt className="text-blue-600" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Ngày sinh</p>
                                                    <p className="font-medium break-words whitespace-normal">
                                                {user.birthDate === "null"
                                                    ? "Chưa cập nhật"
                                                    : dayjs(user.birthDate).isValid()
                                                    ? dayjs(user.birthDate).format("DD/MM/YYYY")
                                                    : "Chưa cập nhật"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FaEnvelope className="text-blue-600" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="font-medium break-words whitespace-normal">{user?.email || "Chưa cập nhật"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FaVenusMars className="text-blue-600" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Giới tính</p>
                                                    <p className="font-medium break-words whitespace-normal">{user?.gender || "Chưa cập nhật"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FaPhone className="text-blue-600" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Số điện thoại</p>
                                                    <p className="font-medium break-words whitespace-normal">{user?.phoneNumber || "Chưa cập nhật"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FaAddressCard className="text-blue-600" />
                                                <div>
                                                    <p className="text-sm text-gray-500">CCCD</p>
                                                    <p className="font-medium break-words whitespace-normal">{user?.idNumber || "Chưa cập nhật"}</p>
                                                </div>
                                            </div>
                                        </div>
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
