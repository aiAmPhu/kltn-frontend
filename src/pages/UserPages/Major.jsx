import React, { useEffect, useState } from "react";
import axios from "axios";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaArrowCircleRight, FaSearch } from "react-icons/fa";

function Majors() {
    const [majors, setMajors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const navigate = useNavigate();
    
    // Set document title
    useDocumentTitle("Ngành xét tuyển");

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
                const token = localStorage.getItem("token");
                let response;
                
                if (token) {
                    // Đã đăng nhập: Lấy từ wish/form-data
                    response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/wish/form-data`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const { majors } = response.data.data;
                    const dataWithImages = majors.map((major) => ({
                        ...major,
                        image: major.image || majorImages[Math.floor(Math.random() * majorImages.length)],
                    }));
                    setMajors(dataWithImages);
                } else {
                    // Chưa đăng nhập: Chỉ lấy những ngành được chấp nhận
                    response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adms/getAll`);
                    const dataWithImages = response.data.map((major) => ({
                        ...major,
                        image: major.image || majorImages[Math.floor(Math.random() * majorImages.length)],
                    }));
                    setMajors(dataWithImages);
                }
            } catch (error) {
                console.error("Lỗi khi fetch majors:", error);
                // Fallback to public endpoint
                try {
                    const fallbackResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adms/getAll`);
                    const dataWithImages = fallbackResponse.data.map((major) => ({
                        ...major,
                        image: major.image || majorImages[Math.floor(Math.random() * majorImages.length)],
                    }));
                    setMajors(dataWithImages);
                } catch (fallbackError) {
                    console.error("Lỗi khi fetch majors từ fallback:", fallbackError);
                }
            }
        };

        fetchMajors();
    }, []);

    // Lọc danh sách theo từ khóa tìm kiếm
    const removeDiacritics = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };

    const filteredMajors = majors.filter((major) =>
        removeDiacritics(major.majorName).includes(removeDiacritics(searchTerm))
    );

    const totalPages = Math.ceil(filteredMajors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentMajors = filteredMajors.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 mt-12">
            <h1 className="text-3xl font-bold mb-8 text-blue-700 border-l-8 border-blue-500 pl-4 bg-blue-50 py-2">
                CÁC CHƯƠNG TRÌNH ĐÀO TẠO
            </h1>

            {/* Ô tìm kiếm */}
            <div className="mb-6 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Tìm kiếm ngành học..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // reset về trang 1 khi tìm
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                />
                <FaSearch className="text-gray-500" />
            </div>

            {/* Danh sách ngành */}
            <div className="space-y-10">
                {currentMajors.length > 0 ? (
                    currentMajors.map((major) => (
                        <div
                            key={major.majorId}
                            className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                        >
                            <img
                                src={major.image}
                                alt={major.majorName}
                                className="w-full sm:w-1/3 h-48 object-cover"
                            />
                            <div className="p-6 flex-1">
                                <h2 className="text-xl font-semibold text-blue-700 mb-2">{major.majorName}</h2>
                                <p
                                    className="text-gray-700 text-sm line-clamp-3 mb-4"
                                    dangerouslySetInnerHTML={{
                                        __html: major?.majorDescription || "Chưa có mô tả cho ngành này...",
                                    }}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/majors/${major.majorId}`)}
                                        className="inline-block px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        <FaArrowCircleRight className="inline mr-1" /> Xem chi tiết
                                    </button>
                                    <button
                                        onClick={() => navigate('/wish', { state: { selectedMajor: major } })}
                                        className="inline-block px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Đăng ký
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 italic mt-10">Không tìm thấy ngành phù hợp.</p>
                )}
            </div>

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-10">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                    >
                        <FaArrowLeft className="inline mr-1" /> Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                        .map((page, index, array) => {
                            const isDots = index > 0 && page - array[index - 1] > 1;
                            return (
                                <React.Fragment key={page}>
                                    {isDots && <span className="px-2 text-gray-500">...</span>}
                                    <button
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 border rounded ${
                                            currentPage === page ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                </React.Fragment>
                            );
                        })}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                    >
                        Sau <FaArrowRight className="inline ml-1" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default Majors;
