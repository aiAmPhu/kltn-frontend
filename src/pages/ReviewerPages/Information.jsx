import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaIdCard, FaBirthdayCake, FaTimes } from "react-icons/fa";

const FIELD_LABELS = [
    { key: "firstName", label: "Họ" },
    { key: "lastName", label: "Tên" },
    { key: "gender", label: "Giới tính" },
    { key: "birthDate", label: "Ngày sinh", isDate: true },
    { key: "birthPlace", label: "Nơi sinh" },
    { key: "phone", label: "SĐT" },
    { key: "email", label: "Email" },
    { key: "parentEmail", label: "Email phụ huynh" },
    { key: "idNumber", label: "Số CCCD" },
    { key: "idIssueDate", label: "Ngày cấp", isDate: true },
    { key: "idIssuePlace", label: "Nơi cấp" },
    { key: "houseNumber", label: "Số nhà" },
    { key: "streetName", label: "Tên đường" },
    { key: "commune", label: "Xã/Phường" },
    { key: "district", label: "Quận/Huyện" },
    { key: "province", label: "Tỉnh/Thành phố" },
];

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

const Information = ({ userId }) => {
    const [user, setUser] = useState(null);
    const [photoData, setPhotoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);

    const [selectedImage, setSelectedImage] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchData();
    }, [userId, token]);

    const fetchData = async () => {
        try {
            const [userRes, photoRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/adis/getAdi/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/photo/getPhoto/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);
            setUser(userRes.data);
            setPhotoData(photoRes.data.data);
        } catch (err) {
            console.error(err);
            setError("Không thể tải thông tin.");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/adis/accept/${userId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success("Hồ sơ thông tin đã được phê duyệt thành công.");
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
                `${process.env.REACT_APP_API_BASE_URL}/adis/reject/${userId}`,
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

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("vi-VN");
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

    if (loading) return <p className="text-gray-500">Đang tải thông tin...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!user) return null;

    // Chuẩn bị dữ liệu dạng bảng với gộp hàng
    const customRows = [
        {
            label: "Họ và Tên",
            value: `${user.firstName || '-'} ${user.lastName || '-'}`
        },
        {
            label: "Giới tính",
            value: user.gender || '-'
        },
        {
            label: "Ngày sinh", 
            value: user.birthDate ? formatDate(user.birthDate) : '-'
        },
        {
            label: "Nơi sinh",
            value: user.birthPlace || '-'
        },
        {
            label: "Số điện thoại",
            value: user.phone || '-'
        },
        {
            label: "Email",
            value: user.email || '-'
        },
        {
            label: "Email phụ huynh", 
            value: user.parentEmail || '-'
        },
        {
            label: "Số CCCD",
            value: user.idNumber || '-'
        },
        {
            label: "Ngày cấp CCCD",
            value: user.idIssueDate ? formatDate(user.idIssueDate) : '-'
        },
        {
            label: "Nơi cấp CCCD",
            value: user.idIssuePlace || '-',
            smallText: true
        },
        {
            label: "Số nhà",
            value: user.houseNumber || '-'
        },
        {
            label: "Tên đường",
            value: user.streetName || '-'
        },
        {
            label: "Xã/Phường",
            value: user.commune || '-'
        },
        {
            label: "Quận/Huyện",
            value: user.district || '-'
        },
        {
            label: "Tỉnh/Thành phố",
            value: user.province || '-'
        }
    ];

    const tableRows = customRows.map(({ label, value, smallText }, index) => (
        <tr key={index} className="">
            <td className="py-1 pr-3 font-medium text-gray-700 w-32">{label}</td>
            <td className={`py-1 text-gray-900 ${smallText ? 'text-xs' : ''}`}>{value}</td>
        </tr>
    ));

    // Địa chỉ gộp
    const address = [user.houseNumber, user.streetName, user.commune, user.district, user.province]
        .filter(Boolean)
        .join(", ");

    // Trạng thái
    const statusInfo = getStatusInfo(user.status);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="flex flex-col md:flex-row h-full flex-1 p-4 gap-6">
                {/* Thông tin cá nhân bên trái */}
                <div className="w-full md:w-2/3 lg:w-1/2 flex-shrink-0 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Thông tin cá nhân</h2>
                        <table className="w-full text-sm">
                            <tbody>
                                {tableRows}
                                <tr>
                                    <td className="py-1 pr-3 font-medium text-gray-700 w-32">Địa chỉ</td>
                                    <td className="py-1 text-gray-900">{address || <span className="text-gray-400 italic">-</span>}</td>
                                </tr>
                            </tbody>
                        </table>
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
                            {user.feedback && user.status === "rejected" && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <FaTimesCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold text-red-800 text-sm block">Lý do không phê duyệt:</span>
                                            <span className="text-red-700 text-sm">{user.feedback}</span>
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

export default Information;
