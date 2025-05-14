import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import Header from "../../components/Header";

function Profile() {
    const [user, setUser] = useState(null);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, detailRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/getUserByID/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/adis/getAdi/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                setUser(userRes.data.data);
                setDetail(detailRes.data);
            } catch (err) {
                console.error("Lỗi khi lấy thông tin người dùng:", err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchData();
    }, [userId]);

    if (loading) return <div className="text-center mt-24">Đang tải dữ liệu...</div>;
    if (!user) return <div className="text-center mt-25 text-red-500">Không tìm thấy người dùng.</div>;

    return (
        <div>
            <Header /> 
            <div className="max-w-3xl mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
                <div className="flex items-center space-x-4 mb-6">
                    <img
                        src={user.pic}
                        alt="avatar"
                        className="w-20 h-20 rounded-full object-cover border border-gray-300"
                    />
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-sm text-gray-600">Mã hồ sơ: {user.userId}</p>
                        <p className="text-sm text-blue-600 capitalize">Vai trò: {user.role}</p>
                        <p className="text-sm text-gray-700">Email: {user.email}</p>
                    </div>
                </div>

                {detail && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><strong>Họ tên:</strong> {detail.lastName} {detail.firstName}</div>
                        <div><strong>Giới tính:</strong> {detail.gender}</div>
                        <div><strong>Ngày sinh:</strong> {dayjs(detail.birthDate).format("DD/MM/YYYY")}</div>
                        <div><strong>Nơi sinh:</strong> {detail.birthPlace}</div>
                        <div><strong>Số điện thoại:</strong> {detail.phone}</div>
                        <div><strong>Email cá nhân:</strong> {detail.email}</div>
                        <div><strong>Email phụ huynh:</strong> {detail.parentEmail}</div>
                        <div><strong>Số CCCD:</strong> {detail.idNumber}</div>
                        <div><strong>Ngày cấp CCCD:</strong> {dayjs(detail.idIssueDate).format("DD/MM/YYYY")}</div>
                        <div><strong>Nơi cấp CCCD:</strong> {detail.idIssuePlace}</div>
                        <div><strong>Địa chỉ thường trú:</strong> {`${detail.houseNumber} ${detail.streetName}, ${detail.commune}, ${detail.district}, ${detail.province}`}</div>
                        <div><strong>Trạng thái hồ sơ:</strong> {detail.status === "waiting" ? "Đang chờ duyệt" : detail.status}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
