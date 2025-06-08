import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaUserShield, FaUser, FaEnvelope, FaUserTag, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PermissionFormModal = ({ userId, userToEdit, setUsers, onClose, isEditing, reloadUsers }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [selectedRole, setSelectedRole] = useState("user");
    const [isLoading, setIsLoading] = useState(false);

    // Ensure we always have the correct userId (from userToEdit if not passed)
    const effectiveUserId = userId || userToEdit?._id || userToEdit?.userId;

    useEffect(() => {
        if (userToEdit) {
            setName(userToEdit.name || "");
            setEmail(userToEdit.email || "");
            setSelectedRole(userToEdit.role || "user");
        } else {
            setName("");
            setEmail("");
            setSelectedRole("user");
        }
    }, [userToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validate userId before making the request
        if (!effectiveUserId) {
            setError("Không xác định được người dùng để cập nhật phân quyền.");
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem("token");
        try {
            await axios.put(
                `${API_BASE_URL}/permissions/update/${effectiveUserId}`,
                { role: selectedRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Refresh user list
            if (typeof reloadUsers === "function") {
                await reloadUsers();
            } else {
                const response = await axios.get(`${API_BASE_URL}/users/getall`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data?.data || response.data || []);
            }
            
            toast.success("Cập nhật phân quyền thành công!");
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = (role) => {
        setSelectedRole(role);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-2">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-xl sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header - Fixed */}
                <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                            <FaUserShield className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Cập nhật phân quyền
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            Thông tin người dùng
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaUser className="inline-block w-4 h-4 mr-2 text-gray-500" />
                                    Tên người dùng
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    disabled
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaEnvelope className="inline-block w-4 h-4 mr-2 text-gray-500" />
                                    Email
                                </label>
                                <input
                                    type="text"
                                    value={email}
                                    disabled
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            <FaUserTag className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            Phân quyền
                        </h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Chọn vai trò <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="user"
                                        checked={selectedRole === "user"}
                                        onChange={() => handleRoleChange("user")}
                                        className="form-radio h-5 w-5 text-blue-600 mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">Người dùng thường</div>
                                        <div className="text-sm text-gray-500">
                                            Không có quyền duyệt hồ sơ, chỉ có thể xem thông tin cá nhân
                                        </div>
                                    </div>
                                </label>
                                
                                <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="reviewer"
                                        checked={selectedRole === "reviewer"}
                                        onChange={() => handleRoleChange("reviewer")}
                                        className="form-radio h-5 w-5 text-blue-600 mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">Người duyệt hồ sơ</div>
                                        <div className="text-sm text-gray-500">
                                            Có thể duyệt tất cả hồ sơ thí sinh, xem thống kê và xuất báo cáo
                                        </div>
                                    </div>
                                </label>

                                <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="admin"
                                        checked={selectedRole === "admin"}
                                        onChange={() => handleRoleChange("admin")}
                                        className="form-radio h-5 w-5 text-blue-600 mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">Quản trị viên</div>
                                        <div className="text-sm text-gray-500">
                                            Có thể quản lý toàn bộ hệ thống, phân quyền cho người dùng và duyệt tất cả hồ sơ
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons - Fixed */}
                    <div className="sticky bottom-0 bg-white z-10 flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="order-2 sm:order-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
                            title="Đóng modal và hủy thao tác"
                        >
                            <FaTimes className="w-4 h-4" /> 
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`order-1 sm:order-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl ${
                                isLoading ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                            title="Cập nhật phân quyền người dùng"
                        >
                            {isLoading ? (
                                <FaSpinner className="w-4 h-4 animate-spin" />
                            ) : (
                                <FaCheck className="w-4 h-4" />
                            )}
                            {isLoading ? "Đang cập nhật..." : "Cập nhật"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PermissionFormModal;
