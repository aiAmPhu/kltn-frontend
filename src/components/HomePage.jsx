import { useState, useEffect } from "react";
import { HelpCircle, UserPlus, GraduationCap, Award, BookOpen } from "lucide-react";
import axios from "axios";
import Banner from "./Banner.jsx";

function HomePage() {
    const [majors, setMajors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const majorImages = [
        "/Major/HCMUTE-1.jpg",
        "/Major/HCMUTE-2.jpg",
        "/Major/HCMUTE-3.jpg",
        "/Major/HCMUTE-4.jpg",
        "/Major/HCMUTE-5.jpg",
        "/Major/HCMUTE-6.png",
        "/Major/HCMUTE-7.png",
        "/Major/HCMUTE-8.png",
    ];

    useEffect(() => {
        const fetchMajors = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adms/getAll`);
                setMajors(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchMajors();
    }, []);


    return (
        <div className="bg-gray-50 min-h-screen">
            <Banner />

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Đại học chính quy */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6 shadow-md">
                    <h2 className="text-center text-2xl font-bold text-blue-800 mb-6 flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 mr-2 text-blue-700" />
                        ĐẠI HỌC CHÍNH QUY
                        <GraduationCap className="w-8 h-8 ml-2 text-blue-700" />
                    </h2>
                    
                    {loading ? (
                        <div className="text-center p-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto mb-2"></div>
                            <p className="text-gray-600">Đang tải ngành học...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-4 rounded-lg text-red-600 mb-4">
                            <p>Lỗi: {error}</p>
                        </div>
                    ) : majors.length === 0 ? (
                        <p className="text-gray-600 mb-4 text-center">Không có ngành học nào.</p>
                    ) : (
                        <div className="space-y-4 mb-4">
                            {majors.map((major, index) => (
                                <div
                                    key={major.majorId}
                                    className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200"
                                >
                                    <div className="flex items-center mb-2 md:mb-0">
                                        <Award className="w-5 h-5 mr-2 text-yellow-500" />
                                        <span className="text-blue-800 font-medium text-lg">{major.majorName}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg flex items-center text-sm transition-all duration-200 hover:translate-y-px">
                                            <UserPlus className="w-4 h-4 mr-1" />
                                            Đăng ký
                                        </button>
                                        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg flex items-center text-sm transition-all duration-200 hover:translate-y-px">
                                            <BookOpen className="w-4 h-4 mr-1" />
                                            Hướng dẫn
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;