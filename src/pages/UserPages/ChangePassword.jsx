import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import hcmuteLogo from "../../assets/hcmuteLogo.png";
import rightImage from "../../assets/chibi_hcmute.jpg";
import Header from "../../components/Header";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ChangePassword() {
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        
        if (form.newPassword !== form.confirmNewPassword) {
            setMessage("Mật khẩu mới và xác nhận không khớp.");
            return;
        }

        if (form.newPassword.length < 8) {
            setMessage("Mật khẩu mới phải có ít nhất 8 ký tự");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/users/changePassword/${userId}`,
                {
                    oldPassword: form.oldPassword,
                    newPassword: form.newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success(res.data.message || "Đổi mật khẩu thành công");
            localStorage.removeItem("token");
            navigate("/login");
        } catch (err) {
            console.error("Lỗi khi đổi mật khẩu:", err.response.data);
            setMessage(err.response?.data?.message || "Đổi mật khẩu thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-5xl bg-white shadow-lg flex rounded-lg overflow-hidden">
                    {/* Left - Form */}
                    <div className="w-full md:w-1/2 p-10">
                        <div className="mb-8 flex justify-center">
                            <img src={hcmuteLogo} alt="Logo" className="h-24" />
                        </div>
                        <h2 className="text-2xl font-bold mb-6 text-center">Đổi mật khẩu</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="mb-4">
                                <label className="block mb-1 text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                                <div className="relative">
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        name="oldPassword"
                                        value={form.oldPassword}
                                        onChange={handleChange}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 pr-10"
                                        required
                                    />
                                    <div
                                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                    >
                                        {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block mb-1 text-sm font-medium text-gray-700">Mật khẩu mới</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={form.newPassword}
                                        onChange={handleChange}
                                        placeholder="Nhập mật khẩu mới"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 pr-10"
                                        required
                                    />
                                    <div
                                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block mb-1 text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmNewPassword"
                                        value={form.confirmNewPassword}
                                        onChange={handleChange}
                                        placeholder="Xác nhận mật khẩu mới"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 pr-10"
                                        required
                                    />
                                    <div
                                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </div>
                                </div>
                            </div>

                            {message && <p className="text-sm text-red-600 mb-4">{message}</p>}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition"
                            >
                                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                            </button>
                        </form>
                    </div>

                    {/* Right - Image */}
                    <div className="hidden md:block w-1/2">
                        <img src={rightImage} alt="Minh hoạ" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChangePassword;
