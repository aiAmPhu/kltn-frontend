// src/pages/AdminPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const AdminPage = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8 mt-20">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">👑 Trang Quản Trị Admin</h1>

                <nav className="mb-6">
                    <ul className="space-y-3">
                        <li>
                            <Link
                                to="/admin/users"
                                className="block px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition"
                            >
                                👥 Quản lý người dùng
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/admin/reports"
                                className="block px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition"
                            >
                                📄 Báo cáo hệ thống
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/admin/settings"
                                className="block px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition"
                            >
                                ⚙️ Cài đặt hệ thống
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Tổng quan</h2>
                    <p className="text-gray-600">
                        Chào mừng bạn đến với trang admin. Hãy chọn một mục ở menu để bắt đầu.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
