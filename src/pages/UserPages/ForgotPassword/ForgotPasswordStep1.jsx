import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import hcmuteLogo from "../../../assets/hcmuteLogo.png";
import rightImage from "../../../assets/chibi_hcmute.jpg";
import Header from "../../../components/Header";

const ForgotPasswordStep1 = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        setError("");
        if (!email) {
            setError("Vui lòng nhập email");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/send-otp-reset`, {
                email,
            });

            if (response.status === 200) {
                toast.success("Đã gửi OTP đến email của bạn!");
                navigate("/forgot-password/step2", { state: { email } });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Gửi OTP thất bại");
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
                        <h2 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu</h2>

                        <div className="space-y-4">
                            <div className="w-full flex items-center border border-gray-300 p-3 rounded-lg focus-within:ring focus-within:border-blue-500 bg-white">
                                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                <input
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full outline-none"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSendOtp();
                                    }}
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <button
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                            >
                                {loading ? "Đang gửi OTP..." : "Gửi OTP"}
                            </button>

                            <button
                                className="text-sm text-blue-600 hover:underline mt-2"
                                onClick={() => navigate("/login")}
                            >
                                Quay lại đăng nhập
                            </button>
                        </div>
                    </div>

                    {/* Right - Image */}
                    <div className="hidden md:block w-1/2">
                        <img src={rightImage} alt="Minh hoạ" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordStep1;
