import React from "react";
import {
    FaFacebookF,
    FaYoutube,
    FaMapMarkerAlt,
    FaPhoneAlt,
   
} from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-blue-50 text-gray-700">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Logo */}
                <div className="md:col-span-2 flex justify-center md:justify-start">
                    <img
                        src="/hcmute-logo.png"
                        alt="HCMUTE Logo"
                        className="w-32 h-32 object-contain"
                    />
                </div>

                {/* Liên Hệ Tuyển Sinh */}
                <div className="md:col-span-5">
                    <h3 className="text-xl font-semibold border-b-2 border-blue-500 pb-1 mb-4">
                        Liên Hệ Tuyển Sinh
                    </h3>
                    <p className="text-sm leading-relaxed mb-3">
                        Hội Đồng Tuyển Sinh Trường ĐH Sư Phạm Kỹ Thuật TP.HCM<br />
                        Phòng Tuyển Sinh & Công Tác Sinh Viên - Phòng Đào Tạo
                    </p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <FaMapMarkerAlt className="mt-1" />
                            <span>01 Võ Văn Ngân, Q.Thủ Đức, TP.HCM</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <FaPhoneAlt /> (028) 3722 5724 - (028) 3896 1333
                        </li>
                    </ul>
                </div>

                {/* Kết Nối Với HCMUTE */}
                <div className="md:col-span-5">
                    <h3 className="text-xl font-semibold border-b-2 border-blue-500 pb-1 mb-4">
                        Kết Nối Với HCMUTE
                    </h3>
                    <div className="flex mb-4">
                        <input
                            type="email"
                            placeholder="Nhập địa chỉ email..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <button className="bg-blue-500 text-white px-4 py-2 text-sm font-medium rounded-r-md hover:bg-blue-600 whitespace-nowrap">
                            Đăng Ký
                        </button>
                    </div>
                    <div className="text-sm">
                        <p className="flex items-center gap-2 mb-2">
                            <FaMapMarkerAlt /> ĐH Sư Phạm Kỹ Thuật TP.HCM
                        </p>
                        <div className="flex gap-3">
                            <a href="https://www.facebook.com/SPKT.tuyensinh" className="bg-blue-700 hover:bg-blue-800 text-white p-2 rounded-full transition">
                                <FaFacebookF />
                            </a>
                            <a href="https://www.youtube.com/watch?v=sQH0-tBvyY4" className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition">
                                <FaYoutube />
                            </a>
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold border-b-2 border-blue-500 pb-1 mb-4">
                        SINH VIÊN THỰC HIỆN
                    </h3>

                    <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Phạm Lê Thiên Phú - 21110274</li>
                        <li>Nguyễn Duy Sơn - 21110290</li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-blue-600 text-white text-sm flex flex-col md:flex-row justify-between items-center px-6 py-4">
                <p className="text-center">
                    ©2025 - Sản phẩm là khoá luận tốt nghiệp không mang tính chất thương mại
                </p>
                <p className="mt-2 md:mt-0 text-center">
                    HOTLINE: (028) 3722 5724
                </p>
            </div>
        </footer>
    );
};

export default Footer;
