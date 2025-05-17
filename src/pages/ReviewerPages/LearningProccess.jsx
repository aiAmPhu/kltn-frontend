import React, { useEffect, useState } from "react";
import axios from "axios";

const LearningProccess = ({ userId }) => {
    const [learningData, setLearningData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionStatus, setActionStatus] = useState("");
    const token = localStorage.getItem("token");
    useEffect(() => {
        const fetchLearningData = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/learning/getLPByE/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // const matched = res.data.data.find((item) => item.userId === Number(userId));
                if (!res) {
                    setError("Không tìm thấy dữ liệu quá trình học.");
                } else {
                    setLearningData(res.data.data);
                }
            } catch (err) {
                console.error(err);
                setError("Lỗi khi lấy dữ liệu quá trình học.");
            } finally {
                setLoading(false);
            }
        };
        fetchLearningData();
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

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!learningData) return null;

    return (
        <div className="text-gray-800 space-y-4">
            <div>
                <strong>Lớp 10:</strong> {learningData.grade10_school}, {learningData.grade10_district},{" "}
                {learningData.grade10_province}
            </div>
            <div>
                <strong>Lớp 11:</strong> {learningData.grade11_school}, {learningData.grade11_district},{" "}
                {learningData.grade11_province}
            </div>
            <div>
                <strong>Lớp 12:</strong> {learningData.grade12_school}, {learningData.grade12_district},{" "}
                {learningData.grade12_province}
            </div>
            <div>
                <strong>Năm tốt nghiệp:</strong> {learningData.graduationYear}
            </div>
            <div>
                <strong>Đối tượng ưu tiên:</strong> {learningData.priorityGroup}
            </div>
            <div>
                <strong>Khu vực:</strong> {learningData.region}
            </div>
            <div>
                <strong>Trạng thái:</strong> {learningData.status}
            </div>
            {learningData.feedback && (
                <div>
                    <strong>Phản hồi:</strong> {learningData.feedback}
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

            {/* Reject input */}
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

            {/* Status */}
            {actionStatus && <p className="mt-4 text-blue-600">{actionStatus}</p>}
        </div>
    );
};

export default LearningProccess;
