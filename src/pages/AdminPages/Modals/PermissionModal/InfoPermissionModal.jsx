import React from "react";
import { FaTimes, FaUser, FaEnvelope, FaUserTag, FaUserShield } from "react-icons/fa";

const InfoPermissionModal = ({ user, onClose }) => {
    if (!user) return null;

    const getRoleDisplay = (role) => {
        switch (role) {
            case 'admin':
                return { text: 'Quản trị viên', class: 'bg-purple-100 text-purple-800' };
            case 'reviewer':
                return { text: 'Người duyệt hồ sơ', class: 'bg-blue-100 text-blue-800' };
            case 'user':
            default:
                return { text: 'Người dùng thường', class: 'bg-green-100 text-green-800' };
        }
    };

    const roleInfo = getRoleDisplay(user.role);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Chi tiết phân quyền</h2>
                <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-2">
                        <FaUser className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Tên:</span> 
                        <span>{user.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <FaEnvelope className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Email:</span> 
                        <span>{user.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <FaUserTag className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Vai trò:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleInfo.class}`}>
                            {roleInfo.text}
                        </span>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                            <FaUserShield className="text-blue-500" /> Quyền hạn:
                        </div>
                        <div className="text-sm text-gray-600">
                            {user.role === 'admin' && (
                                <p>• Quản lý toàn bộ hệ thống<br/>• Phân quyền cho người dùng<br/>• Duyệt tất cả hồ sơ</p>
                            )}
                            {user.role === 'reviewer' && (
                                <p>• Duyệt tất cả hồ sơ thí sinh<br/>• Xem thống kê hồ sơ<br/>• Xuất báo cáo</p>
                            )}
                            {user.role === 'user' && (
                                <p>• Xem thông tin cá nhân<br/>• Không có quyền duyệt hồ sơ</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="inline-flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                    >
                        <FaTimes /> Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoPermissionModal;