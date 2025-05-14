import { useState, useEffect } from "react";
import Header from "../../../components/Header";
import AdmissionInformation from "../../../components/Profile/AdmissionInformation";
import LearningProcess from "../../../components/Profile/LearningProcess";
import PhotoID from "../../../components/Profile/PhotoID";
import HighSchoolTranscript from "../../../components/Profile/HighSchoolTranscript";
import axios from "axios";
import dayjs from "dayjs";
import {
    FaUserCheck,
    FaInfoCircle,
    FaGraduationCap,
    FaFileAlt,
    FaImage,
} from "react-icons/fa";

const ProjfilePage = () => {
    const [activeSection, setActiveSection] = useState(null);
    const token = localStorage.getItem("token");
    const tokenUser = token ? JSON.parse(atob(token.split(".")[1])) : null;
    const [user, setUser] = useState({});
    const [account, setAccount] = useState({});
    const [status, setStatus] = useState("");
    const [feedbacks, setFeedbacks] = useState([]);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleClick = (section) => setActiveSection(section);

    useEffect(() => {
        if (!token || tokenUser?.role !== "user") {
            window.location.href = "/404";
        }

        const fetchData = async () => {
            try {
                const API_BASE = process.env.REACT_APP_API_BASE_URL;
                const userId = tokenUser?.userId;
                const email = tokenUser?.email;

                // Fetch all necessary data in parallel
                const [
                    userRes,
                    detailRes,
                    accountRes,
                    statusRes1,
                    statusRes2,
                    statusRes3,
                    statusRes4,
                ] = await Promise.all([
                    axios.get(`${API_BASE}/users/getUserByID/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_BASE}/adis/getAdi/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_BASE}/users/getAll`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_BASE}/adis/getStatus/${email}`),
                    axios.get(`${API_BASE}/learning/getStatus/${email}`),
                    axios.get(`${API_BASE}/transcripts/getStatus/${email}`),
                    axios.get(`${API_BASE}/photo/getStatus/${email}`),
                ]);

                // Set the user and detail information
                setUser(userRes.data.data);
                setDetail(detailRes.data);
                setAccount(accountRes.data.find((item) => item.email === email));

                // Combine status responses
                const statuses = [
                    statusRes1.data.data[0],
                    statusRes2.data.data[0],
                    statusRes3.data.data[0],
                    statusRes4.data.data[0],
                ];

                // Check if any status is rejected, if so set the rejection feedback
                const rejectedFeedbacks = statuses
                    .filter((status) => status.status === "rejected")
                    .map((status) => status.feedback);

                if (rejectedFeedbacks.length > 0) {
                    setStatus("rejected");
                    setFeedbacks(rejectedFeedbacks);
                    return;
                }

                // Check if any status is waiting
                if (statuses.some((status) => status.status === "waiting")) {
                    setStatus("waiting");
                    return;
                }

                // If no rejected or waiting, set as accepted
                setStatus("accepted");
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, tokenUser?.email]);

    if (loading) return <div className="text-center mt-24">Đang tải dữ liệu...</div>;
    if (!user) return <div className="text-center mt-25 text-red-500">Không tìm thấy người dùng.</div>;

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <div className="flex flex-1 pt-20">
                <aside className="w-1/4 bg-[#222d32] text-white p-6 rounded-xl shadow-xl space-y-6">
                    <div className="text-center">
                        <img
                            src="../../../../public/myUTE_Tuyensinh.png"
                            alt="Logo"
                            className="w-43 h-auto mx-auto mb-6"
                        />
                    </div>
                    <nav>
                        <ul className="space-y-4">
                            <li
                                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-md ${activeSection === null ? "bg-blue-700 text-white" : "hover:bg-blue-600"}`}
                                onClick={() => handleClick(null)}
                            >
                                <FaUserCheck className="text-lg" />
                                Trạng thái hồ sơ
                            </li>
                            <li
                                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-md ${activeSection === "admissioninformation" ? "bg-blue-700 text-white" : "hover:bg-blue-600"}`}
                                onClick={() => handleClick("admissioninformation")}
                            >
                                <FaInfoCircle className="text-lg" />
                                Thông tin xét tuyển
                            </li>
                            <li
                                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-md ${activeSection === "learningprocess" ? "bg-blue-700 text-white" : "hover:bg-blue-600"}`}
                                onClick={() => handleClick("learningprocess")}
                            >
                                <FaGraduationCap className="text-lg" />
                                Quá trình học tập
                            </li>
                            <li
                                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-md ${activeSection === "highschooltranscript" ? "bg-blue-700 text-white" : "hover:bg-blue-600"}`}
                                onClick={() => handleClick("highschooltranscript")}
                            >
                                <FaFileAlt className="text-lg" />
                                Học bạ THPT
                            </li>
                            <li
                                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-md ${activeSection === "photoid" ? "bg-blue-700 text-white" : "hover:bg-blue-600"}`}
                                onClick={() => handleClick("photoid")}
                            >
                                <FaImage className="text-lg" />
                                Hồ sơ ảnh
                            </li>
                        </ul>
                    </nav>
                </aside>

                <div className="flex-1 p-8 bg-gray-50 shadow-xl rounded-xl">
                    {activeSection === "admissioninformation" && <AdmissionInformation />}
                    {activeSection === "learningprocess" && <LearningProcess />}
                    {activeSection === "photoid" && <PhotoID />}
                    {activeSection === "highschooltranscript" && <HighSchoolTranscript />}
                    {!activeSection && (
                        <div className="text-center space-y-8 bg-gray-100 p-8 rounded-lg shadow-md">
                            <h2 className="text-4xl font-extrabold text-blue-600 uppercase tracking-wide">
                                Trạng thái Hồ Sơ
                            </h2>
                            <p className={`text-2xl font-semibold ${status === "accepted" ? "text-green-700" : status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                                {status === "accepted" ? "Hồ sơ đã duyệt" : status === "rejected" ? "Hồ sơ bị từ chối" : "Hồ sơ đang chờ xử lý"}
                            </p>

                            {status === "rejected" && feedbacks.length > 0 && (
                                <div className="feedback-list mt-4 bg-red-100 border border-red-300 rounded p-4">
                                    <h3 className="text-lg font-semibold text-red-700 mb-2">Lý do từ chối:</h3>
                                    <ul className="list-disc list-inside">
                                        {feedbacks.map((feedback, index) => (
                                            <li key={index} className="text-sm text-red-600">
                                                {feedback || "Không có thông tin chi tiết."}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="flex flex-col items-center">
                                    <strong className="text-lg mb-2 text-blue-800">Ảnh thẻ</strong>
                                    <img
                                        src={account?.pic || "https://via.placeholder.com/128x170"}
                                        alt="Profile"
                                        className="w-40 h-52 object-cover rounded-lg shadow-md border-2 border-gray-300"
                                    />
                                </div>

                                <div className="text-left space-y-4">
                                    <p><strong className="text-blue-800">Họ và tên:</strong> {account?.name || "Chưa cập nhật"}</p>
                                    <p><strong className="text-blue-800">Ngày sinh:</strong> {user?.birthDate ? dayjs(user.birthDate).format("DD/MM/YYYY") : "Chưa cập nhật"}</p>
                                    <p><strong className="text-blue-800">Email:</strong> {account?.email || "Chưa cập nhật"}</p>
                                </div>

                                <div className="text-left space-y-4">
                                    <p><strong className="text-blue-800">Giới tính:</strong> {detail?.gender || "Chưa cập nhật"}</p>
                                    <p><strong className="text-blue-800">Số điện thoại:</strong> {detail?.phone || "Chưa cập nhật"}</p>
                                    <p><strong className="text-blue-800">CCCD:</strong> {detail?.idNumber || "Chưa cập nhật"}</p>
                                    <p><strong className="text-blue-800">Ngày cấp CCCD:</strong> {detail?.idIssueDate ? dayjs(detail.idIssueDate).format("DD/MM/YYYY") : "Chưa cập nhật"}</p>
                                    <p><strong className="text-blue-800">Nơi cấp CCCD:</strong> {detail?.idIssuePlace || "Chưa cập nhật"}</p>
                                    <p><strong className="text-blue-800">Địa chỉ thường trú:</strong> {`${detail?.houseNumber || ""} ${detail?.streetName || ""}, ${detail?.commune || ""}, ${detail?.district || ""}, ${detail?.province || ""}`}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjfilePage;
