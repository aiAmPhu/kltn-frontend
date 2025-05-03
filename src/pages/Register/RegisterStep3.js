import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import axios from "axios";

function RegisterStep3() {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || "";
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async () => {
        try {
            setError("");
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/add`, {
                email,
                name,
                password,
                role: "user",
            });
            if (res.status === 201) {
                alert("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
                navigate("/login"); // Hoặc navigate("/") tuỳ bạn
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Đăng ký thất bại. Vui lòng thử lại.");
                setError(err.response.data.message);
            }
        }
    };

    useEffect(() => {
        if (!email) {
            navigate("/register/step1"); // hoặc "/register/step1"
        }
    }, [email, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6">Đăng ký - Bước 2</h2>

                <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    className="w-full px-4 py-2 border rounded mb-4 bg-gray-100 cursor-not-allowed"
                    value={email}
                    disabled
                />

                <label className="block mb-2 text-sm font-medium text-gray-700">Tên</label>
                <input
                    type="text"
                    className="w-full px-4 py-2 border rounded mb-4"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên của bạn"
                />

                <label className="block mb-2 text-sm font-medium text-gray-700">Mật khẩu</label>
                <input
                    type="password"
                    className="w-full px-4 py-2 border rounded mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                />

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <button
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    onClick={handleRegister}
                >
                    Hoàn tất đăng ký
                </button>
            </div>
        </div>
    );
}

export default RegisterStep3;
