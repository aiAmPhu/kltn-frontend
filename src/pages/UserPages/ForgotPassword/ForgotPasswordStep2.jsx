import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../../../components/Header";

const ForgotPasswordStep2 = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 phút
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password/step1");
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "Enter") {
            handleVerifyOtp();
        }
    };

    const handleVerifyOtp = async () => {
        setError("");
        const otpString = otp.join("");

        if (otpString.length !== 6) {
            setError("Vui lòng nhập đầy đủ 6 số OTP");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/verifyOTP`, {
                email,
                otp: otpString,
            });

            if (response.status === 200) {
                toast.success("Xác thực OTP thành công!");
                navigate("/forgot-password/step3", { state: { email, verifiedToken: response.data.token } });
            }
        } catch (err) {
            setError(err.response?.data?.message || "OTP không đúng hoặc đã hết hạn");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/send-otp-reset`, { email });
            toast.success("Đã gửi lại OTP!");
            setTimeLeft(300);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } catch (err) {
            toast.error("Gửi lại OTP thất bại");
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">Xác nhận OTP</h2>
                    <p className="text-gray-600 text-center mb-6">
                        Chúng tôi đã gửi mã OTP đến <br />
                        <span className="font-semibold">{email}</span>
                    </p>

                    <div className="space-y-6">
                        <div className="flex justify-center space-x-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring focus:border-blue-500"
                                />
                            ))}
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
                        >
                            {loading ? "Đang xác nhận..." : "Xác nhận OTP"}
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Thời gian còn lại: <span className="font-semibold">{formatTime(timeLeft)}</span>
                            </p>
                            {timeLeft === 0 ? (
                                <button
                                    onClick={handleResendOtp}
                                    className="text-blue-600 hover:underline text-sm mt-2"
                                >
                                    Gửi lại OTP
                                </button>
                            ) : (
                                <button
                                    onClick={handleResendOtp}
                                    className="text-blue-600 hover:underline text-sm mt-2"
                                >
                                    Gửi lại OTP
                                </button>
                            )}
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => navigate("/forgot-password/step1")}
                                className="text-gray-600 hover:underline text-sm"
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordStep2;
