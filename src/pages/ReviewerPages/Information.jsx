import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaClock, FaUser } from "react-icons/fa";

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
        text: "Đã duyệt",
        color: "bg-green-50 text-green-700",
        icon: (
            <FaCheckCircle className="w-4 h-4 text-green-500" />
        ),
    },
    rejected: {
        text: "Từ chối",
        color: "bg-red-50 text-red-700",
        icon: (
            <FaTimesCircle className="w-4 h-4 text-red-500" />
        ),
    },
    waiting: {
        text: "Đang chờ",
        color: "bg-yellow-50 text-yellow-700",
        icon: (
            <FaClock className="w-4 h-4 text-yellow-500" />
        ),
    },
};

function getStatusInfo(status) {
    if (status === "accepted") return statusMap.accepted;
    if (status === "rejected") return statusMap.rejected;
    return statusMap.waiting;
}

const Information = ({ userId }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [actionStatus, setActionStatus] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adis/getAdi/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(res.data);
            } catch (err) {
                console.error(err);
                setError("Người dùng chưa thiết lập thông tin.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [userId, token]);

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
            setActionStatus("Đã đồng ý.");
        } catch (err) {
            console.error(err);
            setActionStatus("Gặp lỗi khi gửi yêu cầu đồng ý.");
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setActionStatus("Vui lòng nhập lý do từ chối.");
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
            setActionStatus("Đã từ chối.");
        } catch (err) {
            console.error(err);
            setActionStatus("Gặp lỗi khi gửi yêu cầu từ chối.");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("vi-VN");
    };

    if (loading) return <p className="text-gray-500">Đang tải thông tin...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!user) return null;

    // Chuẩn bị dữ liệu dạng bảng
    const tableRows = FIELD_LABELS.map(({ key, label, isDate }) => {
        let value = user[key];
        if (isDate && value) value = formatDate(value);
        return (
            <tr key={key} className="">
                <td className="py-1 pr-3 font-medium text-gray-700 w-44">{label}</td>
                <td className="py-1 text-gray-900">{value || <span className="text-gray-400 italic">-</span>}</td>
            </tr>
        );
    });

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
                <div className="w-full md:w-2/3 lg:w-1/2 flex-shrink-0 overflow-y-auto" >
                    <div className="bg-white rounded-lg shadow-sm p-6 h-full">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                            <FaUser className="w-6 h-6 text-blue-500" />
                            Thông tin cá nhân
                        </h2>
                        <table className="w-full">
                            <tbody>
                                {tableRows}
                                <tr>
                                    <td className="py-1 pr-3 font-medium text-gray-700">Địa chỉ</td>
                                    <td className="py-1 text-gray-900">{address || <span className="text-gray-400 italic">-</span>}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Khu vực trạng thái, phản hồi và hành động bên phải */}
                <div className="w-full md:w-1/3 lg:w-1/2 flex flex-col gap-4 md:sticky md:top-4 self-start" style={{zIndex: 10}}>
                    <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4 h-fit">
                        {/* Trạng thái và phản hồi */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Trạng thái:</span>
                                <span
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}
                                >
                                    {statusInfo.icon}
                                    <span>{statusInfo.text}</span>
                                </span>
                            </div>
                            {user.feedback && (
                                <div className="flex items-center">
                                    <span className="font-medium text-gray-700">Phản hồi:</span>
                                    <span className="ml-2 text-gray-600">{user.feedback}</span>
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
        </div>
    );
};

export default Information;
