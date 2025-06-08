import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaClock, FaImages, FaTimes, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaSearchPlus, FaFileImage, FaUser, FaIdCard } from "react-icons/fa";

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
            if (!res) setError("Không tìm thấy hồ sơ ảnh.");
            else setPhotoData(res.data.data);
        } catch (err) {
            console.error(err);
            setError("Lỗi khi tải hồ sơ ảnh.");
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
            setActionStatus("Hồ sơ ảnh đã được phê duyệt thành công.");
            await fetchData();
        } catch {
            setActionStatus("Có lỗi xảy ra khi phê duyệt hồ sơ.");
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setActionStatus("Vui lòng nhập lý do không phê duyệt.");
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
            setActionStatus("Hồ sơ đã được từ chối với lý do đã ghi nhận.");
            setShowRejectInput(false);
            setRejectionReason("");
            await fetchData();
        } catch {
            setActionStatus("Có lỗi xảy ra khi từ chối hồ sơ.");
        }
    };

    const getAllImages = () => {
        if (!photoData) return [];
        return [
            { label: "Ảnh chân dung", url: photoData.personalPic, icon: <FaUser className="w-4 h-4" /> },
            { label: "Giấy khai sinh", url: photoData.birthCertificate, icon: <FaFileImage className="w-4 h-4" /> },
            { label: "CCCD mặt trước", url: photoData.frontCCCD, icon: <FaIdCard className="w-4 h-4" /> },
            { label: "CCCD mặt sau", url: photoData.backCCCD, icon: <FaIdCard className="w-4 h-4" /> },
            { label: "Học bạ lớp 10", url: photoData.grade10Pic, icon: <FaFileImage className="w-4 h-4" /> },
            { label: "Học bạ lớp 11", url: photoData.grade11Pic, icon: <FaFileImage className="w-4 h-4" /> },
            { label: "Học bạ lớp 12", url: photoData.grade12Pic, icon: <FaFileImage className="w-4 h-4" /> },
        ].filter(img => img.url);
    };

    const renderImage = (label, url, icon) => (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="font-semibold text-gray-800 text-sm">{label}</h3>
                </div>
            </div>
            <div className="p-4">
                <div 
                    className="relative cursor-pointer group"
                    onClick={() => setSelectedImage({ label, url, allImages: getAllImages(), currentIndex: getAllImages().findIndex(img => img.url === url) })}
                >
                    <div className="w-full h-48 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <img 
                            src={url} 
                            alt={label} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="bg-white bg-opacity-90 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
                            <FaSearchPlus className="text-slate-600 text-sm" />
                            <span className="text-slate-700 text-sm font-medium">Xem chi tiết</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const checkImageSize = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const ratio = img.width / img.height;
                const isCorrectRatio = Math.abs(ratio - (300/436)) < 0.05;
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
            <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
                {/* Header */}
                <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-white">
                            {currentImage.icon && <span className="text-slate-300">{currentImage.icon}</span>}
                            <h3 className="text-lg font-semibold">{currentImage.label}</h3>
                        </div>
                        <span className="text-slate-300 text-sm bg-slate-700 px-3 py-1 rounded-full">
                            {currentIndex + 1} / {allImages.length}
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-300 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex relative">
                    {/* Navigation Buttons */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-slate-800 bg-opacity-80 text-white p-3 rounded-full hover:bg-opacity-100 transition-all z-10 border border-slate-600"
                            >
                                <FaChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-slate-800 bg-opacity-80 text-white p-3 rounded-full hover:bg-opacity-100 transition-all z-10 border border-slate-600"
                            >
                                <FaChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* Image Display */}
                    <div className="flex-1 flex items-center justify-center p-8 relative">
                        {currentImage.label === "Ảnh chân dung" ? (
                            <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
                                <div className="relative w-full flex justify-center">
                                    <div 
                                        className={`relative bg-slate-100 rounded-lg border-2 border-dashed border-slate-400 cursor-pointer transition-all duration-300 ${
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
                                                className={`object-cover rounded-lg border-2 border-slate-300 transition-all duration-300 ${
                                                    isZoomed ? 'scale-150' : 'scale-100'
                                                }`}
                                                style={{
                                                    width: '75%',
                                                    height: '75%',
                                                    transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'
                                                }}
                                            />
                                        </div>
                                        <div className="absolute top-3 left-3 bg-slate-800 text-white text-sm px-3 py-1 rounded-md font-medium">
                                            Kích thước chuẩn: 3×4 cm
                                        </div>
                                        {!isZoomed && (
                                            <div className="absolute bottom-3 right-3 bg-slate-800 bg-opacity-90 text-white text-sm px-3 py-2 rounded-md flex items-center gap-2">
                                                <FaSearchPlus className="w-3 h-3" />
                                                <span>Nhấp để phóng to</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-white text-center px-4">
                                    <div className="text-lg font-medium mb-3 text-slate-200">Tiêu chuẩn ảnh: 3×4 cm (300×436 pixels)</div>
                                    {loading ? (
                                        <div className="text-slate-400 text-sm">Đang kiểm tra thông số kỹ thuật...</div>
                                    ) : imageSize && (
                                        <div className={`p-4 rounded-lg border-2 ${imageSize.isCorrectRatio ? 'bg-emerald-900 bg-opacity-50 border-emerald-500' : 'bg-red-900 bg-opacity-50 border-red-500'} max-w-md mx-auto`}>
                                            <div className="flex items-center justify-center gap-3">
                                                {imageSize.isCorrectRatio ? (
                                                    <FaCheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                                                ) : (
                                                    <FaExclamationTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                                                )}
                                                <div className="text-white text-left">
                                                    <div className="font-semibold text-lg">
                                                        {imageSize.isCorrectRatio ? 'Đạt tiêu chuẩn tỷ lệ 3×4' : 'Không đạt tiêu chuẩn tỷ lệ 3×4'}
                                                    </div>
                                                    <div className="text-gray-200 text-sm mt-1">
                                                        <div>Kích thước hiện tại: {imageSize.width}×{imageSize.height}px</div>
                                                        <div>Tỷ lệ hiện tại: {(imageSize.ratio * 100).toFixed(1)}%</div>
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
                                    className={`w-full h-auto max-h-[70vh] object-contain rounded-lg border-2 border-slate-300 transition-all duration-300 ${
                                        isZoomed ? 'scale-150' : 'scale-100'
                                    }`}
                                    style={isZoomed ? {
                                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                                    } : {}}
                                />
                                {!isZoomed && (
                                    <div className="absolute bottom-4 right-4 bg-slate-800 bg-opacity-90 text-white text-sm px-3 py-2 rounded-md flex items-center gap-2">
                                        <FaSearchPlus className="w-4 h-4" />
                                        Nhấp để phóng to
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Thumbnail Gallery */}
                {allImages.length > 1 && (
                    <div className="bg-slate-800 border-t border-slate-700 p-4">
                        <div className="flex justify-center gap-3 overflow-x-auto">
                            {allImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        setIsZoomed(false);
                                    }}
                                    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                                        index === currentIndex 
                                            ? 'border-slate-300 shadow-lg ring-2 ring-slate-400' 
                                            : 'border-slate-600 hover:border-slate-400'
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
                        <div className="text-center mt-3 text-slate-400 text-sm">
                            Nhấp vào ảnh nhỏ để chuyển đổi tài liệu
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-600 text-lg">Đang tải hồ sơ ảnh...</div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
                <div className="flex items-center gap-2 text-red-800">
                    <FaExclamationTriangle className="w-5 h-5" />
                    <span className="font-semibold">{error}</span>
                </div>
            </div>
        );
    }
    
    if (!photoData) return null;

    const statusInfo = getStatusInfo(photoData.status);

    return (
        <div className="bg-slate-50">
            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Document Images Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="border-b border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                                    <FaFileImage className="w-5 h-5 text-slate-600" />
                                    Tài liệu hồ sơ
                                </h2>
                                <p className="text-slate-600 text-sm mt-1">Các tài liệu cần thiết cho hồ sơ đăng ký</p>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {photoData.personalPic && renderImage("Ảnh chân dung", photoData.personalPic, <FaUser className="w-4 h-4" />)}
                                    {photoData.birthCertificate && renderImage("Giấy khai sinh", photoData.birthCertificate, <FaFileImage className="w-4 h-4" />)}
                                    {photoData.frontCCCD && renderImage("CCCD mặt trước", photoData.frontCCCD, <FaIdCard className="w-4 h-4" />)}
                                    {photoData.backCCCD && renderImage("CCCD mặt sau", photoData.backCCCD, <FaIdCard className="w-4 h-4" />)}
                                    {photoData.grade10Pic && renderImage("Học bạ lớp 10", photoData.grade10Pic, <FaFileImage className="w-4 h-4" />)}
                                    {photoData.grade11Pic && renderImage("Học bạ lớp 11", photoData.grade11Pic, <FaFileImage className="w-4 h-4" />)}
                                    {photoData.grade12Pic && renderImage("Học bạ lớp 12", photoData.grade12Pic, <FaFileImage className="w-4 h-4" />)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status and Actions Section */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-6">
                            {/* Status Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="border-b border-gray-200 p-4">
                                    <h3 className="text-lg font-semibold text-slate-800">Trạng thái hồ sơ</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 font-medium text-sm">Tình trạng:</span>
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                <span>{statusInfo.text}</span>
                                            </span>
                                        </div>
                                        
                                        {photoData.feedback && photoData.status === "rejected" && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <div className="flex items-start gap-2">
                                                    <FaExclamationTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <span className="font-semibold text-red-800 text-sm block">Lý do không phê duyệt:</span>
                                                        <span className="text-red-700 text-sm">{photoData.feedback}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="border-b border-gray-200 p-4">
                                    <h3 className="text-lg font-semibold text-slate-800">Thao tác xét duyệt</h3>
                                </div>
                                <div className="p-4 space-y-4">
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
                                    
                                    {actionStatus && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-blue-800 font-medium text-sm">{actionStatus}</p>
                                        </div>
                                    )}

                                    {/* Reject Input */}
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
