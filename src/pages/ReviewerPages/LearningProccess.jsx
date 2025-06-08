import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCheckCircle, FaTimesCircle, FaClock, FaGraduationCap, FaIdCard, FaBirthdayCake, FaTimes } from "react-icons/fa";

const statusMap = {
    accepted: {
        text: "Đã phê duyệt",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        icon: <FaCheckCircle className="w-4 h-4 text-emerald-600" />,
    },
    rejected: {
        text: "Không phê duyệt",
        color: "bg-red-50 text-red-800 border-red-200",
        icon: <FaTimesCircle className="w-4 h-4 text-red-600" />,
    },
    waiting: {
        text: "Chờ xét duyệt",
        color: "bg-amber-50 text-amber-800 border-amber-200",
        icon: <FaClock className="w-4 h-4 text-amber-600" />,
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
    const [selectedImage, setSelectedImage] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchData();
    }, [userId, token]);

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
            toast.success("Hồ sơ quá trình học tập đã được phê duyệt thành công.");
            await fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Có lỗi xảy ra khi phê duyệt hồ sơ.");
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.warning("Vui lòng nhập lý do không phê duyệt.");
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
            toast.success("Hồ sơ đã được từ chối với lý do đã ghi nhận.");
            setShowRejectInput(false);
            setRejectionReason("");
            await fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Có lỗi xảy ra khi từ chối hồ sơ.");
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

    if (loading) return <p className="text-gray-500">Đang tải dữ liệu...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!learningData) return null;

    const statusInfo = getStatusInfo(learningData.status);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="flex flex-col md:flex-row h-full flex-1 p-4 gap-6">
                {/* Thông tin quá trình học bên trái */}
                <div className="w-full md:w-2/3 lg:w-1/2 flex-shrink-0 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FaGraduationCap className="w-5 h-5 text-blue-500" />
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
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-600">Mặt trước</div>
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
                                    <div className="text-sm font-medium text-gray-600">Mặt sau</div>
                                    {photoData?.backCCCD ? (
                                        <img 
                                            src={photoData.backCCCD} 
                                            alt="CCCD mặt sau" 
                                            className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setSelectedImage({ url: photoData.backCCCD, label: "CCCD mặt sau" })}
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
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 font-medium text-sm">Tình trạng:</span>
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
                                    {statusInfo.icon}
                                    <span>{statusInfo.text}</span>
                                </span>
                            </div>
                            {learningData.feedback && learningData.status === "rejected" && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <FaTimesCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold text-red-800 text-sm block">Lý do không phê duyệt:</span>
                                            <span className="text-red-700 text-sm">{learningData.feedback}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Hành động */}
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleAccept}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all"
                                >
                                    <FaCheckCircle className="w-4 h-4" />
                                    Phê duyệt
                                </button>
                                <button
                                    onClick={() => setShowRejectInput(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
                                >
                                    <FaTimesCircle className="w-4 h-4" />
                                    Từ chối
                                </button>
                            </div>
                        </div>

                        {/* Nhập lý do từ chối */}
                        {showRejectInput && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                                <label className="block font-semibold text-slate-800 text-sm">
                                    Lý do không phê duyệt <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-sm"
                                    rows={4}
                                    placeholder="Vui lòng mô tả chi tiết lý do không phê duyệt hồ sơ..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setShowRejectInput(false);
                                            setRejectionReason("");
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all text-sm font-medium"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all text-sm font-medium"
                                    >
                                        Xác nhận từ chối
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
