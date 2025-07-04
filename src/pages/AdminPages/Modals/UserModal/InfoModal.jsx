import React from "react";
import { FaTimes, FaUser, FaEnvelope, FaUserTag, FaInfoCircle, FaClipboardList } from "react-icons/fa";

const InfoModal = ({ user, onClose }) => {
    if (!user) return null;

    const getRoleDisplay = (role) => {
        switch (role?.toLowerCase()) {
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-2">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-xl sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header - Fixed */}
                <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                            <FaInfoCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Chi tiết người dùng
                        </h2>
                    </div>
                </div>

                <div className="my-6"></div>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            <FaClipboardList className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            Thông tin cơ bản
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FaUser className="text-blue-600 text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">Tên người dùng</p>
                                        <p className="text-lg font-bold text-gray-900">
                        {user.name}
                    </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FaEnvelope className="text-green-600 text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                                        <p className="text-lg font-bold text-gray-900 break-words">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <FaUserTag className="text-orange-600 text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">Vai trò</p>
                                        <span className={`px-2 py-1 rounded-full text-sm font-semibold ${roleInfo.class}`}>
                                            {roleInfo.text}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            Thông tin bổ sung
                        </h3>
                        
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-2">Thông tin tài khoản</h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>ID người dùng:</span>
                                            <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                                                {user.userId || 'N/A'}
                        </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Trạng thái:</span>
                                            <span className="text-green-600 font-medium">Hoạt động</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-800 mb-2">Quyền hạn</h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        {user.role === 'admin' && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    <span>Quản lý toàn bộ hệ thống</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    <span>Phân quyền người dùng</span>
                                                </div>
                                            </div>
                                        )}
                                        {user.role === 'reviewer' && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span>Duyệt hồ sơ thí sinh</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span>Xem thống kê</span>
                                                </div>
                                            </div>
                                        )}
                                        {user.role === 'user' && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span>Xem thông tin cá nhân</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Fixed */}
                <div className="sticky bottom-0 bg-white z-10 flex justify-end pt-6 border-t border-gray-200 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
                        title="Đóng chi tiết người dùng"
                    >
                        <FaTimes className="w-4 h-4" /> 
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
