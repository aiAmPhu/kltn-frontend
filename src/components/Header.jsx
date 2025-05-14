import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { User, HelpCircle, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext.js";
import axios from "axios";
import hcmuteLogo from "../assets/logo_hcmute.png"

function Header() {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    //const [user, setUser] = useState(null);

    //useEffect xử lý token User
    // useEffect(() => {
    //     const checkToken = async () => {
    //         const token = localStorage.getItem("token");
    //         if (!token) return;
    //         try {
    //             const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/jwt/verify`, {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             });
    //             if (res.status === 200) {
    //                 setUser(res.data.user); // set user từ server trả về
    //             }
    //         } catch (err) {
    //             console.warn("Token không hợp lệ hoặc hết hạn", err);
    //             localStorage.removeItem("token");
    //             setUser(null);
    //         }
    //     };
    //     checkToken();
    // }, []);

    //useEffect xử lý dropdownBox User
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSignUpClick = () => {
        navigate("/register/step1"); // hoặc "/login" nếu bạn muốn chuyển đến trang đăng nhập
    };

    const handleSignInClick = () => {
        navigate("/login"); // hoặc "/login" nếu bạn muốn chuyển đến trang đăng nhập
    };

    const handleChangePassword = () => {
        navigate("/changePassword"); // hoặc "/login" nếu bạn muốn chuyển đến trang đăng nhập
        setIsDropdownOpen(false);
    };
    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/jwt/logout`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        } finally {
            logout(); // 🔥 gọi logout từ context để clear user + token
            toast.success("Đăng xuất thành công!");
            navigate("/");
        }
    };

    const handleViewProfile = () => {
        navigate("/profile");
        setIsDropdownOpen(false);
    };
    return (
        <header className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50 py-2">
            <div className="max-w-screen-xl mx-auto px-4 w-full">
                <div className="flex justify-between items-center">
                    {/* Logo and university name */}
                    <div className="flex items-center">
                        <img src="/hcmute-logo.png" alt="Logo" className="h-12 w-auto mr-2" />
                    </div>

                    {/* Navigation menu */}
                    <nav>
                        <ul className="flex">
                            {[
                                { to: "/", label: "TRANG CHỦ" },
                                { to: "/major", label: "NGÀNH XÉT TUYỂN" },
                                { to: "/criteria", label: "DIỆN XÉT TUYỂN" },
                                { to: "/block", label: "KHỐI XÉT TUYỂN" },
                                { to: "/wish", label: "ĐĂNG KÝ XÉT TUYỂN" },
                                { to: "/result", label: "KẾT QUẢ XÉT TUYỂN" },
                            ].map(({ to, label }) => {
                                const isActive = location.pathname === to;
                                return (
                                    <li key={to}>
                                        <Link
                                            to={to}
                                            className={`px-3 py-4 block font-medium text-sm hover:text-blue-900 ${
                                                isActive ? "text-red-600" : "text-blue-700"
                                            }`}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Action buttons */}
                    <div className="flex space-x-2">
                        <button className="bg-red-500 text-white px-4 py-3 rounded text-xs flex items-center">
                            <HelpCircle className="w-4 h-4 mr-1" />
                            Hướng dẫn
                        </button>
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                                    className="border border-gray-300 rounded px-4 py-3 bg-white text-sm font-medium text-gray-700 flex items-center justify-center gap-2 w-full"
                                >
                                    <img src={hcmuteLogo} alt="Logo" className="w-4 h-4 rounded-full" />
                                    {user.name}
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                                        <button
                                            onClick={handleViewProfile}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Hồ sơ của tôi
                                        </button>
                                        <button
                                            onClick={handleChangePassword}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Đổi mật khẩu
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    className="bg-blue-600 text-white px-4 py-3 rounded text-xs flex items-center"
                                    onClick={handleSignUpClick}
                                >
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Đăng ký
                                </button>
                                <button
                                    className="bg-gray-100 text-gray-800 px-4 py-3 rounded text-xs flex items-center"
                                    onClick={handleSignInClick}
                                >
                                    <User className="w-4 h-4 mr-1" />
                                    Đăng nhập
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
