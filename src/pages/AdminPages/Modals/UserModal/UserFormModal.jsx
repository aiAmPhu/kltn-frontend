import { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash, FaUpload, FaCheck, FaTimes, FaUserPlus, FaKey, FaEnvelope, FaUserTag, FaPaperPlane } from "react-icons/fa";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserFormModal = ({ userId, userToEdit, setUsers, onClose, isEditing }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("admin");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [pic, setPic] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);

    useEffect(() => {
        if (userToEdit) {
            setName(userToEdit.name);
            setEmail(userToEdit.email);
            setPassword("");
            setRole(userToEdit.role);
            setPic(userToEdit.pic || "");
        } else {
            setName("");
            setEmail("");
            setPassword("");
            setRole("admin");
            setPic("");
            setIsOtpSent(false);
        }
    }, [userToEdit]);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleSendOTP = async () => {
        try {
            await axios.post(`${API_BASE_URL}/users/sendOTP`, { email });
            setIsOtpSent(true);
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Gửi OTP thất bại");
        }
    };

    const handleVerifyOTP = async () => {
        try {
            await axios.post(`${API_BASE_URL}/users/verifyOTP`, { email, otp });
            setError("");
            return true;
        } catch (error) {
            setError(error.response?.data?.message || "Xác thực OTP thất bại");
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        if (!isEditing && !isOtpSent) {
            setError("Vui lòng gửi và xác thực OTP trước khi thêm người dùng");
            return;
        }

        if (!isEditing && isOtpSent) {
            const isOtpValid = await handleVerifyOTP();
            if (!isOtpValid) return;
        }

        const newUser = {
            name,
            email,
            role,
            pic: pic || "https://res.cloudinary.com/dlum0st9k/image/upload/v1731705123/pngwing.com_1_x0zbek.png",
        };

        if (password) {
            newUser.password = password;
        }

        try {
            if (isEditing && userId) {
                await axios.put(`${API_BASE_URL}/users/update/${userId}`, newUser, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(`${API_BASE_URL}/users/add`, newUser, {
                    headers: { Authorization: `Bearer ${token}` },
                });
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

    const handleUpload = async () => {
        if (!image) return;
        const formData = new FormData();
        formData.append("image", image);

        try {
            const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setPic(res.data.imageUrl);
        } catch (err) {
            setError("Tải ảnh thất bại");
        }
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
                    {isEditing ? "Cập nhật" : "Thêm"} người dùng
                </h2>

                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

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
                        {!isEditing && (
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                            >
                                <FaPaperPlane /> Gửi OTP
                            </button>
                        )}
                    </div>

                    {!isEditing && isOtpSent && (
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Nhập OTP"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    )}

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

                    <div className="flex items-center gap-4">
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
                    )}

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
