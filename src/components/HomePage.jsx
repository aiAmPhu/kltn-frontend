import { useState, useEffect } from "react";
import { HelpCircle, UserPlus } from "lucide-react";
import axios from "axios";
import Banner from "./Banner.jsx";

function HomePage() {
    const [majors, setMajors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch majors when the component mounts
    // useEffect(() => {
    //     const fetchMajors = async () => {
    //         try {
    //             const token = localStorage.getItem("token"); // Assuming JWT token is stored in localStorage
    //             const response = await axios.post(
    //                 `${process.env.REACT_APP_API_BASE_URL}/majors/getall`,
    //                 {}, // Empty payload; adjust if backend expects specific data
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`, // Include token for authentication
    //                     },
    //                 }
    //             );

    //             setMajors(response.data); // Assuming the response contains an array of majors
    //             setLoading(false);
    //         } catch (err) {
    //             setError(err.response?.data?.message || err.message);
    //             setLoading(false);
    //         }
    //     };

    //     fetchMajors();
    // }, []);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Banner Component */}
            <Banner />
            {/* Main Content Sections */}
            <div className="max-w-6xl mx-auto">
                {/* Regular University Section */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6 shadow-md">
                    <h2 className="text-center text-2xl font-bold text-blue-800 mb-4">⭐ ĐẠI HỌC CHÍNH QUY ⭐</h2>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div className="flex items-center">
                            <span className="text-yellow-500 mr-2 text-xl">⭐</span>
                            <span className="text-blue-800 font-medium">
                                THÍ SINH ĐĂNG KÝ DỰ THI MÔN NĂNG KHIẾU (VẼ TRANG TRÍ MÀU NƯỚC, VẼ ĐẦU TƯỢNG)
                            </span>
                        </div>
                        <div className="flex space-x-2">
                            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
                                <UserPlus className="w-4 h-4 mr-1" />
                                Đăng ký
                            </button>
                            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
                                <HelpCircle className="w-4 h-4 mr-1" />
                                Hướng dẫn
                            </button>
                        </div>
                    </div>

                    {/* Majors List */}
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-blue-800 mb-4">Danh sách ngành học</h3>
                        {loading ? (
                            <p className="text-gray-600">Đang tải dữ liệu...</p>
                        ) : error ? (
                            <p className="text-red-600">Lỗi: {error}</p>
                        ) : majors.length === 0 ? (
                            <p className="text-gray-600">Không có ngành học nào.</p>
                        ) : (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {majors.map((major) => (
                                    <li
                                        key={major._id} // Assuming each major has a unique `_id`
                                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        <h4 className="text-lg font-medium text-blue-800">{major.name}</h4>
                                        <p className="text-gray-600">{major.description}</p>
                                        {/* Add more fields as needed, e.g., major.code, major.combination */}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* International Education Section */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6 shadow-md">
                    <h2 className="text-center text-2xl font-bold text-blue-800 mb-4">
                        ⭐ LIÊN KẾT ĐÀO TẠO QUỐC TẾ ⭐
                    </h2>

                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div className="flex items-center">
                            <span className="text-yellow-500 mr-2 text-xl">⭐</span>
                            <span className="text-blue-800 font-medium">
                                Xét tuyển các ngành Liên kết đào tạo quốc tế và du học
                            </span>
                        </div>
                        <div>
                            <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
                                <UserPlus className="w-4 h-4 mr-1" />
                                Đăng ký
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
