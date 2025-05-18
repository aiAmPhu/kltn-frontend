import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaClock, FaGraduationCap, FaIdCard, FaBirthdayCake, FaTimes } from "react-icons/fa";

const statusMap = {
    accepted: {
        text: "Đã duyệt",
        color: "bg-green-50 text-green-700",
        icon: <FaCheckCircle className="w-4 h-4 text-green-500" />,
    },
    rejected: {
        text: "Từ chối",
        color: "bg-red-50 text-red-700",
        icon: <FaTimesCircle className="w-4 h-4 text-red-500" />,
    },
    waiting: {
        text: "Đang chờ",
        color: "bg-yellow-50 text-yellow-700",
        icon: <FaClock className="w-4 h-4 text-yellow-500" />,
    },
};

function getStatusInfo(status) {
    if (status === "accepted") return statusMap.accepted;
    if (status === "rejected") return statusMap.rejected;
    return statusMap.waiting;
}

const LearningProccess = ({ userId }) => {
    const [learningData, setLearningData] = useState(null);
    const [photoData, setPhotoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionStatus, setActionStatus] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [learningRes, photoRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/learning/getLPByE/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/photo/getPhoto/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);

                if (!learningRes) {
                    setError("Không tìm thấy dữ liệu quá trình học.");
                } else {
                    setLearningData(learningRes.data.data);
                    setPhotoData(photoRes.data.data);
                }
            } catch (err) {
                console.error(err);
                setError("Lỗi khi lấy dữ liệu.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, token]);

    const handleAccept = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/learning/accept/${userId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setActionStatus("Đã đồng ý.");
        } catch (err) {
            console.error(err);
            setActionStatus("Lỗi khi gửi yêu cầu đồng ý.");
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setActionStatus("Vui lòng nhập lý do từ chối.");
            return;
        }
        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/learning/reject/${userId}`,
                { feedback: rejectionReason },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setActionStatus("Đã từ chối.");
        } catch (err) {
            console.error(err);
            setActionStatus("Lỗi khi gửi yêu cầu từ chối.");
        }
    };

    const ImageModal = ({ image, onClose }) => {
        if (!image) return null;
        
        return (
            <div className="fixed inset-0 z-50 pointer-events-none">
                <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto" onClick={onClose}></div>
                <div className="absolute right-0 top-0 h-full w-[500px] bg-white transform transition-transform duration-300 ease-in-out pointer-events-auto">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                        <h3 className="text-xl font-semibold text-gray-800">{image.label}</h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4">
                        <img 
                            src={image.url} 
                            alt={image.label} 
                            className="w-full h-auto object-contain rounded-lg"
                        />
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!learningData) return null;

    const statusInfo = getStatusInfo(learningData.status);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="flex flex-col md:flex-row h-full flex-1 p-4 gap-6">
                {/* Thông tin quá trình học bên trái */}
                <div className="w-full md:w-2/3 lg:w-1/2 flex-shrink-0 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6 h-full">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                            <FaGraduationCap className="w-6 h-6 text-blue-500" />
                            Quá trình học tập
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-lg mb-2">Lớp 10</h3>
                                <p className="text-gray-700">
                                    {learningData.grade10_school}, {learningData.grade10_district}, {learningData.grade10_province}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-lg mb-2">Lớp 11</h3>
                                <p className="text-gray-700">
                                    {learningData.grade11_school}, {learningData.grade11_district}, {learningData.grade11_province}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-lg mb-2">Lớp 12</h3>
                                <p className="text-gray-700">
                                    {learningData.grade12_school}, {learningData.grade12_district}, {learningData.grade12_province}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-lg mb-2">Thông tin khác</h3>
                                <div className="space-y-2">
                                    <p className="text-gray-700">
                                        <span className="font-medium">Năm tốt nghiệp:</span> {learningData.graduationYear}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-medium">Đối tượng ưu tiên:</span> {learningData.priorityGroup}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-medium">Khu vực:</span> {learningData.region}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Khu vực trạng thái, phản hồi và hành động bên phải */}
                <div className="w-full md:w-1/3 lg:w-1/2 flex flex-col gap-4 md:sticky md:top-4 self-start" style={{zIndex: 10}}>
                    <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4 h-fit">
                        {/* Ảnh CCCD và giấy khai sinh */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                                <FaIdCard className="w-5 h-5 text-blue-500" />
                                <span>Ảnh CCCD và giấy khai sinh</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-600">CCCD mặt trước</div>
                                    {photoData?.frontCCCD ? (
                                        <img 
                                            src={photoData.frontCCCD} 
                                            alt="CCCD mặt trước" 
                                            className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setSelectedImage({ url: photoData.frontCCCD, label: "CCCD mặt trước" })}
                                        />
                                    ) : (
                                        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                            Chưa có ảnh
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-600">Giấy khai sinh</div>
                                    {photoData?.birthCertificate ? (
                                        <div className="relative w-full h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                                            <img 
                                                src={photoData.birthCertificate} 
                                                alt="Giấy khai sinh" 
                                                className="absolute inset-0 w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => setSelectedImage({ url: photoData.birthCertificate, label: "Giấy khai sinh" })}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                            Chưa có ảnh
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Trạng thái và phản hồi */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Trạng thái:</span>
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                                    {statusInfo.icon}
                                    <span>{statusInfo.text}</span>
                                </span>
                            </div>
                            {learningData.feedback && (
                                <div className="flex items-center">
                                    <span className="font-medium text-gray-700">Phản hồi:</span>
                                    <span className="ml-2 text-gray-600">{learningData.feedback}</span>
                                </div>
                            )}
                        </div>

                        {/* Hành động */}
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAccept}
                                    className="px-5 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors"
                                >
                                    Đồng ý
                                </button>
                                <button
                                    onClick={() => setShowRejectInput(true)}
                                    className="px-5 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Từ chối
                                </button>
                            </div>
                            {actionStatus && (
                                <p className="text-blue-600 font-medium">{actionStatus}</p>
                            )}
                        </div>

                        {/* Nhập lý do từ chối */}
                        {showRejectInput && (
                            <div className="bg-gray-50 rounded-md p-3 mt-2">
                                <label className="block font-medium text-gray-700 mb-1">Lý do từ chối:</label>
                                <textarea
                                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400"
                                    rows={3}
                                    placeholder="Nhập lý do từ chối..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        onClick={() => setShowRejectInput(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                                    >
                                        Gửi lý do
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <ImageModal 
                    image={selectedImage} 
                    onClose={() => setSelectedImage(null)} 
                />
            )}
        </div>
    );
};

export default LearningProccess;
