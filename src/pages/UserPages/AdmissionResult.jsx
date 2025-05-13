import React, { useEffect, useState } from "react";
import axios from "axios";

const AdmissionResult = () => {
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;

    useEffect(() => {
        const fetchWishes = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/wish/getAll/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setWishes(res.data.wishes || []);
            } catch (err) {
                console.error("Lỗi khi tải kết quả tuyển sinh:", err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchWishes();
    }, [userId]);

    if (loading) return <div>Đang tải kết quả...</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 mt-12">
            <h1 className="text-2xl font-bold text-blue-700 mb-6">Kết quả tuyển sinh</h1>

            {wishes.length === 0 ? (
                <p>Không có dữ liệu nguyện vọng.</p>
            ) : (
                <table className="w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-2 border">#</th>
                            <th className="p-2 border">Ngành</th>
                            <th className="p-2 border">Diện</th>
                            <th className="p-2 border">Khối</th>
                            <th className="p-2 border">Điểm</th>
                            <th className="p-2 border">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wishes.map((wish, index) => (
                            <tr key={wish.wishId}>
                                <td className="p-2 border">{wish.priority}</td>
                                <td className="p-2 border">{wish.majorId}</td>
                                <td className="p-2 border">{wish.criteriaId}</td>
                                <td className="p-2 border">{wish.admissionBlockId}</td>
                                <td className="p-2 border">{wish.scores}</td>
                                <td
                                    className={`p-2 border font-semibold ${
                                        wish.status === "accepted"
                                            ? "text-green-600"
                                            : wish.status === "waiting"
                                            ? "text-slate-400"
                                            : "text-red-600"
                                    }`}
                                >
                                    {wish.status === "accepted" ? "Đậu" : wish.status === "waiting" ? "Chờ xét" : "Rớt"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdmissionResult;
