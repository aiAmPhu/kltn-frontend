import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const RegisterStep2 = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [errorColor, setErrorColor] = useState("");
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [loadingResend, setLoadingResend] = useState(false);

    const handleVerify = async () => {
        setError("");
        setErrorColor("");
        setLoadingVerify(true);
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/verifyOTP`, {
                email,
                otp,
            });
            if (res.status === 200) {
                navigate("/register/step3", { state: { email } });
            } else {
                setError(res.data.message || "OTP không hợp lệ!");
                setErrorColor("red");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Xác thực thất bại!");
        }
        setLoadingVerify(false);
    };

    const handleResendOTP = async () => {
        setError("");
        setErrorColor("");
        setLoadingResend(true);
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/sendOTP`, {
                email,
            });
            if (res.status === 200) {
                setError("Đã gửi lại OTP.");
                setErrorColor("green");
            }
        } catch (err) {
            console.error(err);
            setError("Gửi lại OTP thất bại.");
            setErrorColor("red");
        }
        setLoadingResend(false);
    };

    useEffect(() => {
        if (!email) {
            navigate("/register/step1"); // hoặc "/register/step1"
        }
    }, [email, navigate]);

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Xác thực OTP</h2>
            <p className="mb-2 text-sm text-gray-500">
                OTP đã gửi đến email: <b>{email}</b>
            </p>

            <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã OTP"
                className="w-full p-2 border rounded mb-4"
            />

            {error && (
                <p className={`text-sm mb-3 ${errorColor === "green" ? "text-green-600" : "text-red-600"}`}>{error}</p>
            )}

            <div className="flex space-x-4">
                <button
                    onClick={handleVerify}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    disabled={loadingVerify}
                >
                    {loadingVerify ? "Đang xác thực..." : "Xác thực"}
                </button>

                <button
                    onClick={handleResendOTP}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    disabled={loadingResend}
                >
                    {loadingResend ? "Đang gửi lại..." : "Gửi lại OTP"}
                </button>
            </div>
        </div>
    );
};

export default RegisterStep2;
