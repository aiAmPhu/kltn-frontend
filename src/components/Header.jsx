import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, HelpCircle, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    //useEffect xử lý token User
    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/jwt/verify`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.status === 200) {
                    setUser(res.data.user); // set user từ server trả về
                }
            } catch (err) {
                console.warn("Token không hợp lệ hoặc hết hạn", err);
                localStorage.removeItem("token");
                setUser(null);
            }
        };
        checkToken();
    }, []);

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
            localStorage.removeItem("token");
            setUser(null);
            toast.success("Đăng xuất thành công!");
            setTimeout(() => {
                navigate("/");
            }, 500);
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        }
    };

    const handleViewProfile = () => {
        navigate("/profile");
    };
    return (
        <header className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50">
            <div className="max-w-screen-xl mx-auto px-4 w-full">
                <div className="flex justify-between items-center">
                    {/* Logo and university name */}
                    <div className="flex items-center">
                        <img src="/hcmute-logo.png" alt="Logo" className="h-12 w-auto mr-2" />
                    </div>

                    {/* Navigation menu */}
                    <nav>
                        <ul className="flex">
                            <li>
                                <Link
                                    to="/"
                                    className="text-blue-700 px- py-4 block hover:text-blue-900 font-medium text-sm"
                                >
                                    TRANG CHỦ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/nganh-xet-tuyen"
                                    className="text-blue-700 px-3 py-4 block hover:text-blue-900 font-medium text-sm"
                                >
                                    NGÀNH XÉT TUYỂN
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dien-xet-tuyen"
                                    className="text-blue-700 px-3 py-4 block hover:text-blue-900 font-medium text-sm"
                                >
                                    DIỆN XÉT TUYỂN
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/khoi-xet-tuyen"
                                    className="text-blue-700 px-3 py-4 block hover:text-blue-900 font-medium text-sm"
                                >
                                    KHỐI XÉT TUYỂN
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dang-ky-xet-tuyen"
                                    className="text-blue-700 px-3 py-4 block hover:text-blue-900 font-medium text-sm"
                                >
                                    ĐĂNG KÝ XÉT TUYỂN
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/ket-qua-xet-tuyen"
                                    className="text-blue-700 px-3 py-4 block hover:text-blue-900 font-medium text-sm"
                                >
                                    KẾT QUẢ XÉT TUYỂN
                                </Link>
                            </li>
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
                                    className="border border-gray-300 rounded px-4 py-2 bg-white text-sm font-medium text-gray-700"
                                >
                                    👋 {user.name}
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
                        {/* <button
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
                        </button> */}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
