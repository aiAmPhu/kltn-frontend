"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, HelpCircle, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
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
                </div>
            </div>
        </header>
    );
}

export default Header;
