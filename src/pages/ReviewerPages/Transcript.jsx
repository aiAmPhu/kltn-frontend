import React, { useEffect, useState } from "react";
import axios from "axios";

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
            const token = localStorage.getItem("token");
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
            const token = localStorage.getItem("token");
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

    return (
        <div className="text-gray-800">
            {Object.entries(groupedScores).map(([year, subjects]) => (
                <div key={year} className="mb-4">
                    <h3 className="font-bold">{year}</h3>
                    <ul className="list-disc list-inside">
                        {subjects.map((s, idx) => (
                            <li key={idx}>
                                Môn {s.subject}: HK1 - {s.score1}, HK2 - {s.score2 ?? "Không xét"}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            <div>
                <strong>Trạng thái:</strong> {data.status}
            </div>
            {data.feedback && (
                <div>
                    <strong>Phản hồi:</strong> {data.feedback}
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

export default Transcript;
