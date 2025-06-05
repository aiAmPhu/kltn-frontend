import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const ListAcceptedPage = () => {
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtering, setFiltering] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    // Filter states
    const [filterType, setFilterType] = useState("all");
    const [filterValue, setFilterValue] = useState("");
    const [majorOptions, setMajorOptions] = useState([]);
    const [criteriaOptions, setCriteriaOptions] = useState([]);

    const filterOptions = [
        { value: "all", label: "Tất cả danh sách trúng tuyển" },
        { value: "top3", label: "Top 3 sinh viên điểm cao nhất" },
        { value: "byMajor", label: "Lọc theo ngành" },
        { value: "byCriteria", label: "Lọc theo diện xét tuyển" },
    ];
    // Fetch filter options (majors, criteria)
    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/wish/getFilterOptions`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setMajorOptions(response.data.data.majors || []);
            setCriteriaOptions(response.data.data.criteria || []);
        } catch (err) {
            console.error("Error fetching filter options:", err);
        }
    };

    // Fetch filtered wishes
    const fetchFilteredWishes = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");

            let params = { filterType };
            if (filterValue && (filterType === "byMajor" || filterType === "byCriteria")) {
                params.filterValue = filterValue;
            }

            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/wish/getFilteredAccepted`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                params,
            });

            if (response.data && Array.isArray(response.data.data)) {
                setWishes(response.data.data);
            } else {
                console.error("Unexpected data structure:", response.data);
                setError("Dữ liệu không đúng định dạng");
            }
        } catch (err) {
            console.error("Error fetching filtered data:", err);
            setError(err.response?.data?.message || "Lỗi khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    // Gọi API lấy danh sách trúng tuyển khi load trang hoặc sau khi lọc
    useEffect(() => {
        fetchFilterOptions();
    }, []);
    // Load wishes when filter changes
    useEffect(() => {
        if (filterType === "byMajor" && !filterValue && majorOptions.length > 0) {
            return; // Wait for user to select a major
        }
        if (filterType === "byCriteria" && !filterValue && criteriaOptions.length > 0) {
            return; // Wait for user to select a criteria
        }
        fetchFilteredWishes();
    }, [filterType, filterValue]);

    const handleFilterTypeChange = (newFilterType) => {
        setFilterType(newFilterType);
        setFilterValue(""); // Reset filter value
        if (newFilterType === "all" || newFilterType === "top3") {
            // Auto fetch for these types
            setLoading(true);
        }
    };
    // Hàm lọc danh sách trúng tuyển
    const handleFilterValueChange = (newFilterValue) => {
        setFilterValue(newFilterValue);
    };

    // Export to Excel
    const exportToExcel = () => {
        if (!wishes.length) {
            toast.error("Không có dữ liệu để xuất!");
            return;
        }

        const exportData = wishes.map((wish, index) => ({
            STT: index + 1,
            "Mã Nguyện Vọng": wish.wishId,
            "Mã Sinh Viên": wish.User?.userId || wish.uId,
            "Tên Sinh Viên": wish.User?.name || "N/A",
            Email: wish.User?.email || "N/A",
            "Độ Ưu Tiên": wish.priority,
            "Diện Xét Tuyển": wish.criteriaId,
            "Khối Xét Tuyển": wish.admissionBlockId,
            "Ngành Xét Tuyển": wish.majorId,
            "Điểm Xét Tuyển": wish.scores,
            "Trạng Thái": wish.status,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();

        // Set column widths
        const columnWidths = [
            { wch: 5 }, // STT
            { wch: 15 }, // Mã Nguyện Vọng
            { wch: 12 }, // Mã Sinh Viên
            { wch: 25 }, // Tên Sinh Viên
            { wch: 25 }, // Email
            { wch: 12 }, // Độ Ưu Tiên
            { wch: 15 }, // Diện Xét Tuyển
            { wch: 15 }, // Khối Xét Tuyển
            { wch: 15 }, // Ngành Xét Tuyển
            { wch: 15 }, // Điểm Xét Tuyển
            { wch: 12 }, // Trạng Thái
        ];
        worksheet["!cols"] = columnWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách trúng tuyển");

        const filterLabel = filterOptions.find((opt) => opt.value === filterType)?.label || "Tất cả";
        const fileName = `DanhSachTrungTuyen_${filterLabel.replace(/\s+/g, "_")}_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    // Giao diện loading
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                    <svg
                        className="animate-spin h-8 w-8 text-blue-500 mb-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
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
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">{error}</div>
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
                <h1 className="text-3xl font-bold text-blue-700 text-center md:text-left">
                    Danh sách Trúng Tuyển ({wishes.length} kết quả)
                </h1>
                <button
                    onClick={exportToExcel}
                    disabled={!wishes.length}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    Xuất file Excel
                </button>
            </div>

            {/* Filter Controls */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Filter Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại lọc:</label>
                        <select
                            value={filterType}
                            onChange={(e) => handleFilterTypeChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {filterOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Major Filter */}
                    {filterType === "byMajor" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn ngành:</label>
                            <select
                                value={filterValue}
                                onChange={(e) => handleFilterValueChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Chọn ngành --</option>
                                {majorOptions.map((major) => (
                                    <option key={major} value={major}>
                                        {major}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Criteria Filter */}
                    {filterType === "byCriteria" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn diện xét tuyển:</label>
                            <select
                                value={filterValue}
                                onChange={(e) => handleFilterValueChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Chọn diện xét tuyển --</option>
                                {criteriaOptions.map((criteria) => (
                                    <option key={criteria} value={criteria}>
                                        {criteria}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {successMsg && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded">
                    {successMsg}
                </div>
            )}

            {/* Results Table */}
            {wishes.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500 text-lg">Không có dữ liệu trúng tuyển phù hợp với bộ lọc.</div>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200 bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">#</th>
                                <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">
                                    Mã Nguyện Vọng
                                </th>
                                <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">
                                    Mã SV
                                </th>
                                <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">
                                    Tên Sinh Viên
                                </th>
                                <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">
                                    Độ Ưu Tiên
                                </th>
                                <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">
                                    Diện Xét Tuyển
                                </th>
                                <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">
                                    Khối Xét Tuyển
                                </th>
                                <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">
                                    Ngành Xét Tuyển
                                </th>
                                <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">
                                    Điểm Xét Tuyển
                                </th>
                                <th className="px-4 py-3 border-b text-xs font-semibold text-gray-600 uppercase">
                                    Trạng Thái
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {wishes.map((wish, index) => (
                                <tr key={wish.wishId || index} className="hover:bg-blue-50 transition">
                                    <td className="px-4 py-2 text-center">{index + 1}</td>
                                    <td className="px-4 py-2">{wish.wishId}</td>
                                    <td className="px-4 py-2">{wish.User?.userId || wish.uId}</td>
                                    <td className="px-4 py-2">{wish.User?.name || "N/A"}</td>
                                    <td className="px-4 py-2">{wish.priority}</td>
                                    <td className="px-4 py-2">{wish.criteriaId}</td>
                                    <td className="px-4 py-2">{wish.admissionBlockId}</td>
                                    <td className="px-4 py-2">{wish.majorId}</td>
                                    <td className="px-4 py-2 font-semibold text-blue-600">{wish.scores}</td>
                                    <td className="px-4 py-2">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                            {wish.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ListAcceptedPage;
