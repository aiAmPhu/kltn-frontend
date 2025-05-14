import { React, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Majors() {
    const [majors, setMajors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const navigate = useNavigate();

    useEffect(() => {
    const fetchMajors = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adms/getAll`);
            console.log(response.data); // Kiểm tra dữ liệu trả về
            setMajors(response.data);
        } catch (error) {
            console.error("Lỗi khi fetch majors:", error);
        }
    };

    fetchMajors();
}, []);

    const totalPages = Math.ceil(majors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentMajors = majors.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 mt-12">
            <h1 className="text-3xl font-bold mb-8 text-blue-700 border-l-8 border-blue-500 pl-4 bg-blue-50 py-2">
                Các Chương Trình Đào Tạo
            </h1>

            <div className="space-y-10">
                {currentMajors.map((major) => (
                    <div
                        key={major.majorId}
                        className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                    >
                        <img
                            src={major.image || "https://via.placeholder.com/300x200?text=No+Image"}
                            alt={major.majorName}
                            className="w-full sm:w-1/3 h-48 object-cover"
                        />
                        <div className="p-6 flex-1">
                            <h2 className="text-xl font-semibold text-blue-700 mb-2">
                                {major.majorName} ({major.majorCodeName})
                            </h2>
                            <p
                                className="text-gray-700 text-sm line-clamp-3 mb-4"
                                dangerouslySetInnerHTML={{
                                    __html: major?.majorDescription || "Chưa có mô tả cho ngành này...",
                                }}
                            />
                            <button
                                onClick={() => navigate(`/majors/${major.majorId}`)}
                                className="inline-block px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                ➤ Xem chi tiết
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* PHÂN TRANG */}
            <div className="flex justify-center items-center space-x-2 mt-10">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                    ← Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 border rounded ${
                            currentPage === i + 1
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100"
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                    Sau →
                </button>
            </div>
        </div>
    );
}

export default Majors;
