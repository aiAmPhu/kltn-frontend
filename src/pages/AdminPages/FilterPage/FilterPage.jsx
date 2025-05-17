import React, { useState } from "react";
import axios from "axios";
import Papa from "papaparse";

const FilterPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");
    const [filtering, setFiltering] = useState(false);

    // Hàm xử lý lọc nguyện vọng (gọi API filter)
    const handleFilter = async () => {
        setFiltering(true);
        setError(null);
        setSuccessMsg("");
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/wish/filter`,
                {},
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );
            setSuccessMsg("Lọc thành công! Danh sách trúng tuyển đã được cập nhật.");
        } catch (err) {
            setError("Lỗi khi lọc nguyện vọng.");
        } finally {
            setFiltering(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">Lọc Danh Sách Trúng Tuyển</h1>
            <div className="flex flex-col items-center gap-6">
                <button
                    onClick={handleFilter}
                    disabled={filtering}
                    className={`inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition ${
                        filtering ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                >
                    {filtering && (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {filtering ? "Đang lọc..." : "Lọc danh sách trúng tuyển"}
                </button>
                {successMsg && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded text-center w-full">
                        {successMsg}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded text-center w-full">
                        {error}
                    </div>
                )}
                <div className="text-gray-600 text-center mt-8">
                    <p>
                        Nhấn nút <span className="font-semibold text-blue-700">"Lọc danh sách trúng tuyển"</span> để hệ thống tự động xét tuyển các nguyện vọng theo quy tắc ưu tiên và điểm chuẩn.
                    </p>
                    <p className="mt-2">
                        Sau khi lọc, bạn có thể xem danh sách trúng tuyển tại mục <span className="font-semibold text-blue-700">"Quản lý danh sách trúng tuyển"</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FilterPage;