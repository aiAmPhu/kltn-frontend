import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    return (
        <header className="bg-blue-600 text-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold">ĐH Tuyển Sinh</div>
                <nav>
                    <ul className="flex space-x-6 items-center">
                        <li>
                            <Link to="/" className="hover:underline">
                                Trang chủ
                            </Link>
                        </li>
                        <li>
                            <Link to="/announcements" className="hover:underline">
                                Thông báo
                            </Link>
                        </li>
                        <li>
                            <Link to="/timeline" className="hover:underline">
                                Lịch tuyển sinh
                            </Link>
                        </li>

                        {/* Dropdown User */}
                        <li className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen((prev) => !prev)}
                                className="flex items-center cursor-pointer"
                            >
                                <User className="w-6 h-6" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg z-50">
                                    <ul>
                                        <Link
                                            to="/register/step1"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="block px-4 py-2 hover:bg-gray-100"
                                        >
                                            Đăng ký
                                        </Link>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="block px-4 py-2 hover:bg-gray-100"
                                        >
                                            Đăng nhập
                                        </Link>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="block px-4 py-2 hover:bg-gray-100"
                                        >
                                            Hồ sơ
                                        </Link>
                                    </ul>
                                </div>
                            )}
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
