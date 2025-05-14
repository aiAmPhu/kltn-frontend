import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import rightImage from "../assets/rightImageForLogin.png";
import hcmuteLogo from "../assets/hcmuteLogo.png";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const Login = () => {
    const { setUser } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/jwt/login`, {
                email,
                password,
            });
            if (res.status === 200) {
                const { token } = res.data;
                localStorage.setItem("token", token);
                setUser(res.data.user);
                toast.success("Đăng nhập thành công!");
                if (res.data.user.role === "admin") {
                    navigate("/admin"); // Ví dụ chuyển đến trang admin
                } else if (res.data.user.role === "reviewer") {
                    navigate("/reviewer"); // Ví dụ chuyển đến trang người dùng
                } else {
                    navigate("/"); // Trang mặc định
                }
            } else {
                setError(res.data.message || "Đăng nhập thất bại.");
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 400 && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Đăng nhập thất bại. Vui lòng thử lại.");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-5xl bg-white shadow-lg flex rounded-lg overflow-hidden">
                {/* Left - Form */}
                <div className="w-full md:w-1/2 p-10">
                    <div className="mb-8 flex justify-center">
                        <img src={hcmuteLogo} alt="Logo" className="h-24" />
                    </div>
                    <h2 className="text-2xl font-bold mb-6 flex justify-center">Đăng nhập</h2>

                    <div className="space-y-4">
                        <div className="w-full flex items-center border border-gray-300 p-3 rounded-lg mb-4 focus-within:ring focus-within:border-blue-500 bg-white">
                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Tài khoản"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full outline-none"
                            />
                        </div>
                        <div className="w-full flex items-center border border-gray-300 p-3 rounded-lg focus-within:ring focus-within:border-blue-500 bg-white">
                            <Lock className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full outline-none"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <button
                            onClick={handleLogin}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                        >
                            Đăng nhập
                        </button>

                        <button
                            className="text-sm text-blue-600 hover:underline mt-2 text-left"
                            onClick={() => navigate("/forgot-password")}
                        >
                            Quên mật khẩu?
                        </button>
                    </div>
                </div>

                {/* Right - Image */}
                <div className="hidden md:block w-1/2">
                    <img src={rightImage} alt="Minh hoạ" className="w-full h-full object-cover" />
                </div>
            </div>
        </div>
    );
};

export default Login;
