import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../../../components/Header";

const ForgotPasswordStep3 = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!email) {
            navigate("/forgot-password/step1");
        }
    }, [email, navigate]);

    const handleResetPassword = async () => {
        setError("");

        if (!password || !confirmPassword) {
            setError("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        if (password.length < 8) {
            setError("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/reset-password`, {
                email,
                newPassword: password,
            });

            if (response.status === 200) {
                toast.success("Đổi mật khẩu thành công!");
                navigate("/login");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Đổi mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">Đặt mật khẩu mới</h2>
                    <p className="text-gray-600 text-center mb-6">
                        Nhập mật khẩu mới cho tài khoản <br />
                        <span className="font-semibold">{email}</span>
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center border border-gray-300 p-3 rounded-lg focus-within:ring focus-within:border-blue-500">
                            <Lock className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mật khẩu mới"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full outline-none"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleResetPassword();
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="flex items-center border border-gray-300 p-3 rounded-lg focus-within:ring focus-within:border-blue-500">
                            <Lock className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Xác nhận mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full outline-none"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleResetPassword();
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
                        >
                            {loading ? "Đang xử lý..." : "Đặt mật khẩu mới"}
                        </button>

                        <div className="text-center">
                            <button
                                onClick={() => navigate("/login")}
                                className="text-blue-600 hover:underline text-sm"
                            >
                                Quay lại đăng nhập
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordStep3;
