import React, { useEffect, useState } from "react";
import axios from "axios";

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
                //const token = localStorage.getItem("token");
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
            console.log(rejectionReason);
            return;
        }
        try {
            //const token = localStorage.getItem("token");
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
        return new Date(dateStr).toLocaleDateString("vi-VN");
    };

    if (loading) return <p className="text-gray-500">Đang tải thông tin...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!user) return null;

    return (
        <div className="text-gray-800 space-y-4">
            <div>
                <strong>Họ tên:</strong> {user.firstName} {user.lastName}
            </div>
            <div>
                <strong>Ngày sinh:</strong> {formatDate(user.birthDate)}
            </div>
            <div>
                <strong>Giới tính:</strong> {user.gender}
            </div>
            <div>
                <strong>Nơi sinh:</strong> {user.birthPlace}
            </div>
            <div>
                <strong>SĐT:</strong> {user.phone}
            </div>
            <div>
                <strong>Email:</strong> {user.email}
            </div>
            <div>
                <strong>Email phụ huynh:</strong> {user.parentEmail}
            </div>
            <div>
                <strong>Số CCCD:</strong> {user.idNumber}
            </div>
            <div>
                <strong>Ngày cấp:</strong> {formatDate(user.idIssueDate)}
            </div>
            <div>
                <strong>Nơi cấp:</strong> {user.idIssuePlace}
            </div>
            <div>
                <strong>Địa chỉ:</strong> {user.houseNumber} {user.streetName}, {user.commune}, {user.district},{" "}
                {user.province}
            </div>
            <div>
                <strong>Trạng thái:</strong>{" "}
                <span
                    className={`px-2 py-1 rounded-full text-sm ${
                        user.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : user.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                >
                    {user.status === "accepted"
                        ? "Đã chấp nhận"
                        : user.status === "rejected"
                        ? "Đã từ chối"
                        : "Đang chờ xét duyệt"}
                </span>
            </div>
            {user.feedback && (
                <div>
                    <strong>Phản hồi:</strong> {user.feedback}
                </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-4 mt-4">
                <button onClick={handleAccept} className="px-4 py-2 bg-green-600 text-white rounded-md">
                    Đồng ý
                </button>
                <button onClick={() => setShowRejectInput(true)} className="px-4 py-2 bg-red-600 text-white rounded-md">
                    Từ chối
                </button>
            </div>

            {/* Reject reason input */}
            {showRejectInput && (
                <div className="mt-4 space-y-2">
                    <textarea
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        placeholder="Nhập lý do từ chối..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <button onClick={handleReject} className="px-4 py-2 bg-gray-800 text-white rounded-md">
                        Gửi lý do
                    </button>
                </div>
            )}

            {/* Action status */}
            {actionStatus && <p className="mt-4 text-blue-600">{actionStatus}</p>}
        </div>
    );
};

export default Information;
