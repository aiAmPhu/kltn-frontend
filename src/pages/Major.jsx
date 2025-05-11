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
                setMajors(response.data); // Đổ vào state
            } catch (error) {
                console.error("Lỗi khi fetch majors:", error);
            }
        };

        fetchMajors();
    }, []);
    // Tính chỉ số phân trang
    const totalPages = Math.ceil(majors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentMajors = majors.slice(startIndex, startIndex + itemsPerPage);
    return (
        <div className="max-w-6xl mx-auto px-4 py-10 mt-12">
            <h1 className="text-2xl font-bold mb-6 text-blue-700">Danh sách các ngành tuyển sinh</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentMajors.map((major) => (
                    <div
                        key={major.majorId}
                        className="bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition"
                    >
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">{major.majorName}</h2>
                        <p className="text-sm text-gray-500 mb-1">
                            <span className="font-medium text-gray-700">Mã ngành:</span> {major.majorCodeName}
                        </p>
                        <button
                            onClick={() => navigate(`/majors/${major.majorId}`)}
                            className="mt-3 inline-block px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Xem chi tiết
                        </button>
                    </div>
                ))}
            </div>
            {/* PHÂN TRANG */}
            <div className="flex justify-center items-center space-x-2 mt-10">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    ← Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 border rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : ""}`}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    Sau →
                </button>
            </div>
        </div>
    );
}

export default Majors;
