import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";

const ListAcceptedPage = () => {
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtering, setFiltering] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // Hàm gọi API lấy danh sách trúng tuyển
    const fetchAcceptedWishes = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/wish/getAccepted`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );
            console.log("API Response:", response.data); // Debug log
            if (response.data && Array.isArray(response.data)) {
                setWishes(response.data);
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                setWishes(response.data.data);
            } else {
                console.error("Unexpected data structure:", response.data);
                setError("Dữ liệu không đúng định dạng");
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err.response || err); // Debug log
            setError(err.response?.data?.message || "Lỗi khi tải dữ liệu");
            setLoading(false);
        }
    };

    // Gọi API lấy danh sách trúng tuyển khi load trang hoặc sau khi lọc
    useEffect(() => {
        fetchAcceptedWishes();
    }, []);

    // Hàm lọc danh sách trúng tuyển
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
            await fetchAcceptedWishes(); // Reload lại danh sách
        } catch (err) {
            setError("Lỗi khi lọc nguyện vọng.");
        } finally {
            setFiltering(false);
        }
    };

    // Xuất file CSV
    const exportToCSV = () => {
        if (!wishes.length) {
            alert("Không có dữ liệu để xuất!");
            return;
        }
        const csvData = Papa.unparse(
            wishes.map((wish) => ({
                "Mã Nguyện Vọng": wish.wishId,
                "Độ Ưu Tiên": wish.priority,
                "Diện Xét Tuyển": wish.criteriaId,
                "Khối Xét Tuyển": wish.admissionBlockId,
                "Ngành Xét Tuyển": wish.majorId,
                "Điểm Xét Tuyển": wish.scores,
                "Trạng Thái": wish.status,
            }))
        );
        const csvWithBom = "\uFEFF" + csvData;
        const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "DanhSachTrungTuyen.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Giao diện loading
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-700 text-lg">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    // Giao diện lỗi
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
                    {error}
                </div>
            </div>
        );
    }

    // Không có dữ liệu
    if (wishes.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500 text-lg">Không có dữ liệu trúng tuyển.</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h1 className="text-3xl font-bold text-blue-700 text-center md:text-left">Danh sách Trúng Tuyển</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleFilter}
                        disabled={filtering}
                        className={`inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition ${filtering ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        {filtering && (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {filtering ? "Đang lọc..." : "Lọc danh sách trúng tuyển"}
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Xuất file CSV
                    </button>
                </div>
            </div>
            {successMsg && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded">
                    {successMsg}
                </div>
            )}
            <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">#</th>
                            <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">Mã Nguyện Vọng</th>
                            <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">Độ Ưu Tiên</th>
                            <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">Diện Xét Tuyển</th>
                            <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">Khối Xét Tuyển</th>
                            <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">Ngành Xét Tuyển</th>
                            <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">Điểm Xét Tuyển</th>
                            <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {wishes.map((wish, index) => (
                            <tr key={index} className="hover:bg-blue-50 transition">
                                <td className="px-4 py-2 text-center">{index + 1}</td>
                                <td className="px-4 py-2">{wish.wishId}</td>
                                <td className="px-4 py-2">{wish.priority}</td>
                                <td className="px-4 py-2">{wish.criteriaId}</td>
                                <td className="px-4 py-2">{wish.admissionBlockId}</td>
                                <td className="px-4 py-2">{wish.majorId}</td>
                                <td className="px-4 py-2">{wish.scores}</td>
                                <td className="px-4 py-2">{wish.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListAcceptedPage;