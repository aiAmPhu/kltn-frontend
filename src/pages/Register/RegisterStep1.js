import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RegisterStep1() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const handleSendOtp = async () => {
        setLoading(true);
        try {
            setError(""); // Reset error message
            // Gọi API gửi OTP
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/sendOTP`, {
                email,
            });

            if (res.status === 200) {
                navigate("/register/step2", { state: { email } });
            } else {
                setError(res.data.message || "Có lỗi xảy ra.");
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message); // Hiển thị lỗi trả về từ BE
            } else {
                setError("Không thể gửi OTP. Vui lòng thử lại.");
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6">Nhập Email đăng ký</h2>
                <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    className="w-full px-4 py-2 border rounded mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                />
                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                <button
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    onClick={handleSendOtp}
                    disabled={loading}
                >
                    {loading ? "Đang gửi OTP ..." : "Gửi OTP"}
                </button>
            </div>
        </div>
    );
}

export default RegisterStep1;
