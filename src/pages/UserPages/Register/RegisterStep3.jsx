import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import hcmuteLogo from "../../../assets/hcmuteLogo.png";
import rightImage from "../../../assets/chibi_hcmute.jpg";
import Header from "../../../components/Header";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function RegisterStep3() {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || "";
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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
                toast.success("Đăng ký tài khoản thành công!");
                setTimeout(() => {
                    navigate("/login");
                }, 500);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
        }
    };

    useEffect(() => {
        if (!email) {
            navigate("/register/step1");
        }
    }, [email, navigate]);

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
                        <h2 className="text-2xl font-bold mb-6 text-center">Hoàn tất đăng ký</h2>

                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Tên</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập tên của bạn"
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 pr-10"
                                />
                                <div
                                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                        </div>


                        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition"
                            onClick={handleRegister}
                        >
                            Hoàn tất đăng ký
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
}

export default RegisterStep3;
