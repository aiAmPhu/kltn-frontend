import React, { useEffect, useState } from "react";
import axios from "axios";

const Photo = ({ userId }) => {
    const [photoData, setPhotoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionStatus, setActionStatus] = useState("");
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
                    reason: rejectionReason,
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

    if (loading) return <p>Đang tải ảnh...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!photoData) return null;

    const renderImage = (label, url) => (
        <div>
            <p className="font-semibold">{label}</p>
            <img src={url} alt={label} className="w-60 border mb-4 rounded" />
        </div>
    );

    return (
        <div className="text-gray-800 space-y-4">
            {renderImage("Ảnh chân dung", photoData.personalPic)}
            {renderImage("Mặt trước CCCD", photoData.frontCCCD)}
            {renderImage("Mặt sau CCCD", photoData.backCCCD)}
            {renderImage("Ảnh học bạ lớp 10", photoData.grade10Pic)}
            {renderImage("Ảnh học bạ lớp 11", photoData.grade11Pic)}
            {renderImage("Ảnh học bạ lớp 12", photoData.grade12Pic)}
            <div>
                <strong>Trạng thái:</strong> {photoData.status}
            </div>
            {photoData.feedback && (
                <div>
                    <strong>Phản hồi:</strong> {photoData.feedback}
                </div>
            )}

            <div className="flex space-x-4 mt-4">
                <button onClick={handleAccept} className="px-4 py-2 bg-green-600 text-white rounded-md">
                    Đồng ý
                </button>
                <button onClick={() => setShowRejectInput(true)} className="px-4 py-2 bg-red-600 text-white rounded-md">
                    Từ chối
                </button>
            </div>

            {showRejectInput && (
                <div className="mt-4 space-y-2">
                    <textarea
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        placeholder="Lý do từ chối..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <button onClick={handleReject} className="px-4 py-2 bg-gray-800 text-white rounded-md">
                        Gửi lý do
                    </button>
                </div>
            )}

            {actionStatus && <p className="mt-4 text-blue-600">{actionStatus}</p>}
        </div>
    );
};

export default Photo;
