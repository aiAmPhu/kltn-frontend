import { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash, FaCheck, FaTimes, FaUserPlus } from "react-icons/fa";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserFormModal = ({ userId, userToEdit, setUsers, onClose, isEditing }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("admin");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (userToEdit) {
            setName(userToEdit.name);
            setEmail(userToEdit.email);
            setPassword("");
            setRole(userToEdit.role);
        } else {
            setName("");
            setEmail("");
            setPassword("");
            setRole("admin");
        }
    }, [userToEdit]);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const newUser = {
            name,
            email,
            role,
        };

        if (password) {
            newUser.password = password;
        }

        try {
            if (isEditing && userId) {
                await axios.put(`${API_BASE_URL}/users/update/${userId}`, newUser, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Cập nhật người dùng thành công!");
            } else {
                await axios.post(`${API_BASE_URL}/users/add`, newUser, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Thêm người dùng thành công!");
            }

            const response = await axios.get(`${API_BASE_URL}/users/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data.data);
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
                    {isEditing ? "Cập nhật" : "Thêm"} người dùng
                </h2>

                {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tên"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />

                    <div className="flex gap-2 items-center">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            disabled={isEditing}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                        />
                        {/* {!isEditing && (
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                            >
                                <FaPaperPlane /> Gửi OTP
                            </button>
                        )} */}
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mật khẩu"
                            required={!isEditing}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Vai trò</label>
                        <div className="relative">
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                onClick={toggleDropdown}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none pr-8"
                            >
                                <option value="admin">Admin</option>
                                <option value="reviewer">Reviewer</option>
                                <option value="user">User</option>
                            </select>
                            {isDropdownOpen ? (
                                <ChevronUpIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            )}
                        </div>
                    </div>

                    {/* <div className="flex items-center gap-4">
                        <input type="file" onChange={handleImageChange} accept="image/*" />
                        <button
                            type="button"
                            onClick={handleUpload}
                            className="bg-orange-400 text-white px-3 py-2 rounded hover:bg-orange-500 flex items-center gap-2"
                        >
                            <FaUpload /> Tải lên
                        </button>
                    </div>

                    {pic && (
                        <div className="text-center mt-4">
                            <img src={pic} className="rounded-lg mx-auto w-40 h-40 object-cover shadow" alt="Avatar preview" />
                        </div>
                    )} */}

                    <div className="flex justify-between mt-6">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                        >
                            {isEditing ? <FaCheck /> : <FaUserPlus />}
                            {isEditing ? "Cập nhật" : "Thêm"}
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

export default UserFormModal;
