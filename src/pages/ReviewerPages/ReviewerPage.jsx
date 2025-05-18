// src/pages/ReviewerPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter } from "react-icons/fa";

const ReviewerPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/getAll`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(res.data.data || []);
                setFilteredUsers(res.data.data || []);
            } catch (err) {
                setError("Lỗi khi tải danh sách người dùng 😓");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token]);

    useEffect(() => {
        let result = users;
        
        // Apply search filter
        if (searchTerm) {
            result = result.filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.userId.toString().includes(searchTerm)
            );
        }

        // Apply status filter
        if (filterStatus !== "all") {
            result = result.filter(user => user.status === filterStatus);
        }

        setFilteredUsers(result);
    }, [searchTerm, filterStatus, users]);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">📝 Reviewer Dashboard</h1>
                
                {/* Search and Filter Section */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Đang chờ</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
                        </select>
                    </div>
                </div>

                {loading && <p className="text-gray-500">Đang tải dữ liệu...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">📋 Danh sách người dùng</h2>
                        <div className="grid gap-4">
                            {filteredUsers.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Không tìm thấy kết quả phù hợp</p>
                            ) : (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.userId}
                                        onClick={() => {
                                            navigate(`/reviewer/user/${user.userId}`);
                                        }}
                                        className="cursor-pointer flex items-center justify-between bg-gray-50 p-4 rounded-xl border hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-700 font-medium">🆔 {user.userId}</span>
                                            <span className="text-gray-900">{user.name}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                            user.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            user.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {user.status === 'approved' ? 'Đã duyệt' :
                                             user.status === 'rejected' ? 'Từ chối' :
                                             'Đang chờ'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewerPage;
