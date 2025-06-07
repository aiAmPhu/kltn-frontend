import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import hcmuteLogo from "../../../assets/hcmuteLogo.png";
import rightImage from "../../../assets/chibi_hcmute.jpg";
import Header from "../../../components/Header";
import { FaEnvelope, FaPaperPlane, FaCheckCircle, FaArrowLeft } from "react-icons/fa";

const ForgotPasswordStep2 = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [errorColor, setErrorColor] = useState("");
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [loadingResend, setLoadingResend] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password/step1");
        }
    }, [email, navigate]);

    const handleVerifyOtp = async () => {
        setError("");
        setErrorColor("");

        if (otp.length !== 6) {
            setError("Vui lòng nhập đầy đủ 6 số OTP");
            setErrorColor("red");
            return;
        }
        setLoadingVerify(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/verifyOTP`, {
                email,
                otp,
            });

            if (response.status === 200) {
                toast.success("Xác thực OTP thành công!");
                navigate("/forgot-password/step3", { state: { email, verifiedToken: response.data.token } });
            }
        } catch (err) {
            setError(err.response?.data?.message || "OTP không đúng hoặc đã hết hạn");
            setErrorColor("red");
        } finally {
            setLoadingVerify(false);
        }
    };

    const handleResendOtp = async () => {
        setError("");
        setErrorColor("");
        setLoadingResend(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/send-otp-reset`, { email });
            if (response.status === 200) {
                setError("Đã gửi lại OTP.");
                setErrorColor("green");
                setOtp("");
            }
        } catch (err) {
            setError("Gửi lại OTP thất bại.");
            setErrorColor("red");
        } finally {
            setLoadingResend(false);
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
                        <h2 className="text-2xl font-bold mb-4 text-center">Xác thực OTP</h2>
                        <p className="mb-6 text-center text-sm text-gray-600">
                            Mã OTP đã gửi đến: <span className="font-medium text-blue-600">{email}</span>
                        </p>

                        {/* OTP input with icon */}
                        <div className="relative mb-4">
                            <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setOtp(value);
                                    }
                                }}
                                placeholder="Nhập mã OTP"
                                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500 bg-white"
                            />
                        </div>

                        {/* Error or status message */}
                        {error && (
                            <p className={`text-sm mb-4 ${errorColor === "green" ? "text-green-600" : "text-red-600"}`}>
                                {error}
                            </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex space-x-4">
                            <button
                                onClick={handleResendOtp}
                                disabled={loadingResend}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                <FaPaperPlane />
                                {loadingResend ? "Đang gửi lại..." : "Gửi lại OTP"}
                            </button>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={loadingVerify}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                <FaCheckCircle />
                                {loadingVerify ? "Đang xác thực..." : "Xác thực"}
                            </button>
                        </div>

                        {/* Back button */}
                        <button
                            className="text-sm text-blue-600 hover:underline mt-4 flex items-center gap-1"
                            onClick={() => navigate("/forgot-password/step1")}
                        >
                            <FaArrowLeft />
                            Quay lại nhập email
                        </button>
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

export default ForgotPasswordStep2;
