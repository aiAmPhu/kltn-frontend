import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaUserShield } from "react-icons/fa";
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
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Đã xảy ra lỗi, vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = (role) => {
        setSelectedRole(role);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
                    <FaUserShield className="inline mr-2 text-blue-500" />
                    Cập nhật phân quyền
                </h2>
                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={name}
                            disabled
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                            placeholder="Tên"
                        />
                        <input
                            type="text"
                            value={email}
                            disabled
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                            placeholder="Email"
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-3 font-medium text-gray-700">
                            Chọn vai trò:
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="role"
                                    value="user"
                                    checked={selectedRole === "user"}
                                    onChange={() => handleRoleChange("user")}
                                    className="form-radio h-5 w-5 text-blue-600 mr-3"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Người dùng thường</div>
                                    <div className="text-sm text-gray-500">Không có quyền duyệt hồ sơ</div>
                                </div>
                            </label>
                            
                            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="role"
                                    value="reviewer"
                                    checked={selectedRole === "reviewer"}
                                    onChange={() => handleRoleChange("reviewer")}
                                    className="form-radio h-5 w-5 text-blue-600 mr-3"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Người duyệt hồ sơ</div>
                                    <div className="text-sm text-gray-500">Có thể duyệt tất cả hồ sơ thí sinh</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2 ${
                                isLoading ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                        >
                            <FaCheck />
                            {isLoading ? "Đang lưu..." : "Cập nhật"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
                        >
                            <FaTimes /> Đóng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PermissionFormModal;
