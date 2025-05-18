import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaClock, FaImages, FaTimes, FaExclamationTriangle } from "react-icons/fa";

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

const Photo = ({ userId }) => {
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
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/photo/getPhoto/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res) setError("Không tìm thấy ảnh.");
                else setPhotoData(res.data.data);
            } catch (err) {
                console.error(err);
                setError("Lỗi khi tải ảnh.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, token]);

    const handleAccept = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/photo/accept/${userId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setActionStatus("Đã đồng ý.");
        } catch {
            setActionStatus("Lỗi khi đồng ý.");
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setActionStatus("Vui lòng nhập lý do.");
            return;
        }
        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/photo/reject/${userId}`,
                {
                    feedback: rejectionReason,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setActionStatus("Đã từ chối.");
        } catch {
            setActionStatus("Lỗi khi từ chối.");
        }
    };

    const renderImage = (label, url) => (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">{label}</h3>
            <div 
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage({ label, url })}
            >
                <img 
                    src={url} 
                    alt={label} 
                    className="w-48 h-48 object-cover rounded-lg border border-gray-200" 
                />
            </div>
        </div>
    );

    const checkImageSize = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const ratio = img.width / img.height;
                const isCorrectRatio = Math.abs(ratio - (300/436)) < 0.05; // Cho phép sai số 5%
                resolve({
                    width: img.width,
                    height: img.height,
                    ratio,
                    isCorrectRatio
                });
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    };

    const ImageModal = ({ image, onClose }) => {
        const [imageSize, setImageSize] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            if (image?.label === "Ảnh chân dung") {
                setLoading(true);
                checkImageSize(image.url).then(result => {
                    setImageSize(result);
                    setLoading(false);
                });
            }
        }, [image]);

        if (!image) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">{image.label}</h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4">
                        {image.label === "Ảnh chân dung" ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-[300px] h-[436px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img 
                                            src={image.url} 
                                            alt={image.label} 
                                            className="w-[225px] h-[327px] object-cover rounded-lg border border-gray-200" 
                                        />
                                    </div>
                                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                        3x4 cm
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Kích thước chuẩn: 3x4 cm (300x436 pixels)
                                </div>
                                {loading ? (
                                    <div className="text-sm text-gray-500">Đang kiểm tra kích thước...</div>
                                ) : imageSize && (
                                    <div className={`p-3 rounded-lg ${imageSize.isCorrectRatio ? 'bg-green-50' : 'bg-red-50'} w-full`}>
                                        <div className="flex items-center gap-2">
                                            {imageSize.isCorrectRatio ? (
                                                <FaCheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <FaExclamationTriangle className="w-5 h-5 text-red-500" />
                                            )}
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {imageSize.isCorrectRatio ? 'Đúng tỷ lệ 3x4' : 'Không đúng tỷ lệ 3x4'}
                                                </div>
                                                <div className="text-gray-600">
                                                    Kích thước hiện tại: {imageSize.width}x{imageSize.height} pixels
                                                    <br />
                                                    Tỷ lệ: {(imageSize.ratio * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <img 
                                src={image.url} 
                                alt={image.label} 
                                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <p>Đang tải ảnh...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!photoData) return null;

    const statusInfo = getStatusInfo(photoData.status);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="flex flex-col md:flex-row h-full flex-1 p-4 gap-6">
                {/* Thông tin ảnh bên trái */}
                <div className="w-full md:w-2/3 lg:w-1/2 flex-shrink-0 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6 h-full">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                            <FaImages className="w-6 h-6 text-blue-500" />
                            Hồ sơ ảnh
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderImage("Ảnh chân dung", photoData.personalPic)}
                            {renderImage("Giấy khai sinh", photoData.birthCertificate)}
                            {renderImage("Mặt trước CCCD", photoData.frontCCCD)}
                            {renderImage("Mặt sau CCCD", photoData.backCCCD)}
                            {renderImage("Ảnh học bạ lớp 10", photoData.grade10Pic)}
                            {renderImage("Ảnh học bạ lớp 11", photoData.grade11Pic)}
                            {renderImage("Ảnh học bạ lớp 12", photoData.grade12Pic)}
                        </div>
                    </div>
                </div>

                {/* Khu vực trạng thái, phản hồi và hành động bên phải */}
                <div className="w-full md:w-1/3 lg:w-1/2 flex flex-col gap-4 md:sticky md:top-4 self-start" style={{zIndex: 10}}>
                    <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4 h-fit">
                        {/* Trạng thái và phản hồi */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Trạng thái:</span>
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                                    {statusInfo.icon}
                                    <span>{statusInfo.text}</span>
                                </span>
                            </div>
                            {photoData.feedback && (
                                <div className="flex items-center">
                                    <span className="font-medium text-gray-700">Phản hồi:</span>
                                    <span className="ml-2 text-gray-600">{photoData.feedback}</span>
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

            {/* Image Preview Modal */}
            {selectedImage && (
                <ImageModal 
                    image={selectedImage} 
                    onClose={() => setSelectedImage(null)} 
                />
            )}
        </div>
    );
};

export default Photo;
