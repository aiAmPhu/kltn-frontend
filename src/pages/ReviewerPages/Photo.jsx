import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaClock, FaImages, FaTimes, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaSearchPlus } from "react-icons/fa";

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
        fetchData();
    }, [userId, token]);

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
            // Refresh data để cập nhật trạng thái và xóa feedback
            await fetchData();
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
            setShowRejectInput(false);
            setRejectionReason("");
            // Refresh data để cập nhật trạng thái và feedback mới
            await fetchData();
        } catch {
            setActionStatus("Lỗi khi từ chối.");
        }
    };

    const getAllImages = () => {
        if (!photoData) return [];
        return [
            { label: "Ảnh chân dung", url: photoData.personalPic },
            { label: "Giấy khai sinh", url: photoData.birthCertificate },
            { label: "Mặt trước CCCD", url: photoData.frontCCCD },
            { label: "Mặt sau CCCD", url: photoData.backCCCD },
            { label: "Ảnh học bạ lớp 10", url: photoData.grade10Pic },
            { label: "Ảnh học bạ lớp 11", url: photoData.grade11Pic },
            { label: "Ảnh học bạ lớp 12", url: photoData.grade12Pic },
        ].filter(img => img.url);
    };

    const renderImage = (label, url) => (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">{label}</h3>
            <div 
                className="relative cursor-pointer hover:opacity-90 transition-opacity group"
                onClick={() => setSelectedImage({ label, url, allImages: getAllImages(), currentIndex: getAllImages().findIndex(img => img.url === url) })}
            >
                <img 
                    src={url} 
                    alt={label} 
                    className="w-48 h-48 object-cover rounded-lg border border-gray-200" 
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <FaSearchPlus className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-2xl" />
                </div>
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
        const [currentIndex, setCurrentIndex] = useState(image?.currentIndex || 0);
        const [isZoomed, setIsZoomed] = useState(false);
        const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

        const allImages = image?.allImages || [];

        useEffect(() => {
            if (image?.currentIndex !== undefined) {
                setCurrentIndex(image.currentIndex);
            }
        }, [image]);

        useEffect(() => {
            const currentImage = allImages[currentIndex];
            if (currentImage?.label === "Ảnh chân dung") {
                setLoading(true);
                checkImageSize(currentImage.url).then(result => {
                    setImageSize(result);
                    setLoading(false);
                });
            } else {
                setImageSize(null);
                setLoading(false);
            }
        }, [currentIndex, allImages]);

        const nextImage = () => {
            setCurrentIndex((prev) => (prev + 1) % allImages.length);
            setIsZoomed(false);
        };

        const prevImage = () => {
            setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
            setIsZoomed(false);
        };

        const handleImageClick = (e) => {
            if (!isZoomed) {
                const rect = e.target.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomPosition({ x, y });
                setIsZoomed(true);
            } else {
                setIsZoomed(false);
            }
        };

        if (!image || allImages.length === 0) return null;
        
        const currentImage = allImages[currentIndex];
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
                {/* Header */}
                <div className="bg-white p-4 flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-semibold text-gray-800">{currentImage.label}</h3>
                        <span className="text-sm text-gray-500">
                            {currentIndex + 1} / {allImages.length}
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                    >
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex">
                    {/* Navigation Buttons */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
                            >
                                <FaChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
                            >
                                <FaChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Image Display */}
                    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
                        {currentImage.label === "Ảnh chân dung" ? (
                            <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-4xl">
                                <div className="relative w-full flex justify-center">
                                    <div 
                                        className={`relative bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer transition-all duration-300 ${
                                            isZoomed 
                                                ? 'w-[min(90vw,70vh*0.6875)] h-[min(90vw*1.4545,70vh)]' 
                                                : 'w-[min(70vw,50vh*0.6875)] h-[min(70vw*1.4545,50vh)]'
                                        }`}
                                        onClick={handleImageClick}
                                        style={{
                                            aspectRatio: '3/4.36',
                                            minWidth: isZoomed ? '360px' : '270px',
                                            maxWidth: isZoomed ? '500px' : '400px'
                                        }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
                                            <img 
                                                src={currentImage.url} 
                                                alt={currentImage.label} 
                                                className={`object-cover rounded-lg border border-gray-200 transition-all duration-300 ${
                                                    isZoomed ? 'scale-150' : 'scale-100'
                                                }`}
                                                style={{
                                                    width: '75%',
                                                    height: '75%',
                                                    transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'
                                                }}
                                            />
                                        </div>
                                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-blue-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded">
                                            3x4 cm
                                        </div>
                                        {!isZoomed && (
                                            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                <FaSearchPlus className="w-3 h-3" />
                                                <span className="hidden sm:inline">Click để zoom</span>
                                                <span className="sm:hidden">Zoom</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-white text-center px-4">
                                    <div className="text-sm sm:text-lg font-medium mb-2">Kích thước chuẩn: 3x4 cm (300x436 pixels)</div>
                                    {loading ? (
                                        <div className="text-gray-300 text-sm">Đang kiểm tra kích thước...</div>
                                    ) : imageSize && (
                                        <div className={`p-3 sm:p-4 rounded-lg ${imageSize.isCorrectRatio ? 'bg-green-900 bg-opacity-50' : 'bg-red-900 bg-opacity-50'} max-w-md mx-auto`}>
                                            <div className="flex items-center justify-center gap-2 sm:gap-3">
                                                {imageSize.isCorrectRatio ? (
                                                    <FaCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
                                                ) : (
                                                    <FaExclamationTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
                                                )}
                                                <div className="text-white text-left">
                                                    <div className="font-medium text-sm sm:text-lg">
                                                        {imageSize.isCorrectRatio ? 'Đúng tỷ lệ 3x4' : 'Không đúng tỷ lệ 3x4'}
                                                    </div>
                                                    <div className="text-gray-200 text-xs sm:text-sm">
                                                        <div>Kích thước: {imageSize.width}x{imageSize.height}px</div>
                                                        <div>Tỷ lệ: {(imageSize.ratio * 100).toFixed(1)}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div 
                                className="max-w-4xl max-h-full cursor-pointer relative"
                                onClick={handleImageClick}
                            >
                                <img 
                                    src={currentImage.url} 
                                    alt={currentImage.label} 
                                    className={`w-full h-auto max-h-[70vh] object-contain rounded-lg transition-all duration-300 ${
                                        isZoomed ? 'scale-150' : 'scale-100'
                                    }`}
                                    style={isZoomed ? {
                                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                                    } : {}}
                                />
                                {!isZoomed && (
                                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-sm px-3 py-2 rounded flex items-center gap-2">
                                        <FaSearchPlus className="w-4 h-4" />
                                        Click để zoom
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Thumbnail Gallery */}
                {allImages.length > 1 && (
                    <div className="bg-gray-900 p-4">
                        <div className="flex justify-center gap-2 overflow-x-auto">
                            {allImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        setIsZoomed(false);
                                    }}
                                    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                                        index === currentIndex 
                                            ? 'border-blue-400 shadow-lg' 
                                            : 'border-gray-600 hover:border-gray-400'
                                    }`}
                                >
                                    <img 
                                        src={img.url} 
                                        alt={img.label} 
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="text-center mt-2 text-gray-400 text-sm">
                            Nhấp vào thumbnail để chuyển đổi ảnh
                        </div>
                    </div>
                )}
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
                            {photoData.feedback && photoData.status === "rejected" && (
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
