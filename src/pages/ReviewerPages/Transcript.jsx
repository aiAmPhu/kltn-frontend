import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaClock, FaBook } from "react-icons/fa";

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

const Transcript = ({ userId }) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionStatus, setActionStatus] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchTranscript = async () => {
            try {
                const res = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/transcripts/getTranscriptByE/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!res) setError("Không tìm thấy học bạ.");
                else setData(res.data.data);
            } catch (err) {
                console.error(err);
                setError("Lỗi khi tải học bạ.");
            } finally {
                setLoading(false);
            }
        };
        fetchTranscript();
    }, [userId, token]);

    const handleAccept = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/transcripts/accept/${userId}`,
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
                `${process.env.REACT_APP_API_BASE_URL}/transcripts/reject/${userId}`,
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

    if (loading) return <p>Đang tải học bạ...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!data) return null;

    const groupedScores = {};
    for (let s of data.scores) {
        if (!groupedScores[s.year]) groupedScores[s.year] = [];
        groupedScores[s.year].push(s);
    }

    const statusInfo = getStatusInfo(data.status);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="flex flex-col md:flex-row h-full flex-1 p-4 gap-6">
                {/* Thông tin điểm số bên trái */}
                <div className="w-full md:w-2/3 lg:w-1/2 flex-shrink-0 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6 h-full">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                            <FaBook className="w-6 h-6 text-blue-500" />
                            Bảng điểm
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(groupedScores).map(([year, subjects]) => (
                                <div key={year} className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-2">{year}</h3>
                                    <ul className="space-y-2">
                                        {subjects.map((s, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                <span className="text-gray-700">
                                                    Môn {s.subject}: HK1 - {s.score1}, HK2 - {s.score2 ?? "Không xét"}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
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
                            {data.feedback && (
                                <div className="flex items-center">
                                    <span className="font-medium text-gray-700">Phản hồi:</span>
                                    <span className="ml-2 text-gray-600">{data.feedback}</span>
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

export default Transcript;
