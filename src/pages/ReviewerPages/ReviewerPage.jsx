// src/pages/ReviewerPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ReviewerPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/getAll`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(res.data.data || []);
            } catch (err) {
                setError("Lỗi khi tải danh sách người dùng 😓");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">📝 Reviewer Dashboard</h1>
                {loading && <p className="text-gray-500">Đang tải dữ liệu...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">📋 Danh sách người dùng</h2>
                        <div className="grid gap-4">
                            {users.map((user) => (
                                <div
                                    key={user.userId}
                                    onClick={() => {
                                        navigate(`/reviewer/user/${user.userId}`);
                                    }}
                                    className="cursor-pointer flex items-center justify-between bg-gray-50 p-4 rounded-xl border"
                                >
                                    <span className="text-gray-700 font-medium">🆔 {user.userId}</span>
                                    <span className="text-gray-900">{user.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewerPage;
