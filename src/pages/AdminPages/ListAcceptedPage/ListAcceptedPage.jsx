import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { 
    FaUsers, 
    FaSpinner, 
    FaSearch, 
    FaFileExport, 
    FaFilter,
    FaEye,
    FaExclamationCircle,
    FaPlus
} from "react-icons/fa";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

const ListAcceptedPage = () => {
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");

    // Set document title
    useDocumentTitle("Danh sách trúng tuyển");
    // Filter states
    const [filterType, setFilterType] = useState("all");
    const [filterValue, setFilterValue] = useState("");
    const [majorOptions, setMajorOptions] = useState([]);
    const [criteriaOptions, setCriteriaOptions] = useState([]);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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
                setError("");
            } else {
                console.error("Unexpected data structure:", response.data);
                setError("Dữ liệu không đúng định dạng");
            }
        } catch (err) {
            console.error("Error fetching filtered data:", err);
            const errorMessage = err.response?.data?.message || "Lỗi khi tải dữ liệu";
            if (!errorMessage.toLowerCase().includes("không tìm được") && 
                !errorMessage.toLowerCase().includes("not found") &&
                err.response?.status !== 404) {
                setError(errorMessage);
                toast.error(errorMessage);
            } else {
                setError("");
                setWishes([]);
            }
        } finally {
            setLoading(false);
        }
    };

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
        setCurrentPage(1);
        if (newFilterType === "all" || newFilterType === "top3") {
            // Auto fetch for these types
            setLoading(true);
        }
    };

    const handleFilterValueChange = (newFilterValue) => {
        setFilterValue(newFilterValue);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
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
        toast.success("Xuất file Excel thành công!");
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = wishes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(wishes.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const getPageRange = () => {
        const delta = 1;
        let range = [];
        range.push(1);

        let start = Math.max(2, currentPage - delta);
        let end = Math.min(totalPages - 1, currentPage + delta);

        if (start > 2) {
            range.push("...");
        }

        for (let i = start; i <= end; i++) {
            range.push(i);
        }

        if (end < totalPages - 1) {
            range.push("...");
        }

        if (totalPages > 1) {
            range.push(totalPages);
        }

        return range;
    };

    // Reset to page 1 if current page is empty after data changes
    useEffect(() => {
        if (wishes.length > 0 && currentItems.length === 0 && currentPage > 1) {
            setCurrentPage(1);
        }
    }, [wishes.length, currentItems.length, currentPage]);

    return (
        <div className="w-full bg-white shadow-lg rounded-xl border border-gray-200">
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Danh sách trúng tuyển</h1>
                </div>

                {/* Filter and Export Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        {/* Filter Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại lọc:</label>
                            <select
                                value={filterType}
                                onChange={(e) => handleFilterTypeChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

                    {/* Export Button */}
                    <button
                        onClick={exportToExcel}
                        disabled={!wishes.length}
                        className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-md whitespace-nowrap"
                        title="Xuất danh sách ra file Excel"
                    >
                        <FaFileExport className="text-sm" />
                        <span className="hidden sm:inline">Xuất Excel</span>
                        <span className="sm:hidden">Xuất</span>
                    </button>
                </div>

                {/* Success Message */}
                {successMsg && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 mb-6">
                        <div className="font-medium">{successMsg}</div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
                        <div className="font-medium">{error}</div>
                    </div>
                )}

                {/* Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã nguyện vọng</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sinh viên</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ưu tiên</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Diện XT</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Khối XT</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngành</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="px-4 sm:px-6 py-8 text-center">
                                            <div className="flex justify-center items-center">
                                                <FaSpinner className="animate-spin h-6 w-6 text-blue-500 mr-3" />
                                                <span className="text-gray-600">Đang tải...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-4 sm:px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <FaEye className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        Không có dữ liệu trúng tuyển
                                                    </h3>
                                                    <p className="text-sm text-gray-600 max-w-md">
                                                        {filterType === "all" 
                                                            ? "Chưa có sinh viên nào trúng tuyển. Vui lòng thực hiện lọc danh sách trước."
                                                            : "Không có kết quả phù hợp với bộ lọc đã chọn."
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((wish, index) => (
                                        <tr key={wish.wishId || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {indexOfFirstItem + index + 1}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{wish.wishId}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{wish.User?.name || "N/A"}</div>
                                                <div className="text-xs text-gray-500">{wish.User?.userId || wish.uId}</div>
                                                <div className="text-xs text-gray-500 md:hidden">{wish.User?.email || "N/A"}</div>
                                                <div className="text-xs text-gray-500 lg:hidden mt-1">
                                                    Diện: {wish.criteriaId} • Khối: {wish.admissionBlockId}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                                <div className="text-sm text-gray-500">{wish.User?.email || "N/A"}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {wish.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">{wish.criteriaId}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">{wish.admissionBlockId}</td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{wish.majorId}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-600">{wish.scores}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col lg:flex-row justify-between items-center mt-6 gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-700">
                        <div className="flex items-center">
                            <span className="mr-2">Hiển thị</span>
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="mx-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                            <span className="ml-2">mục / trang</span>
                        </div>
                        <div className="text-center sm:text-left">
                            Tổng: <span className="font-medium text-blue-600">{wishes.length}</span> kết quả trúng tuyển
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-1">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 rounded-lg flex items-center transition-colors ${
                                    currentPage === 1
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                                title="Trang trước"
                            >
                                <ChevronLeftIcon className="h-4 w-4" />
                            </button>

                            {getPageRange().map((page, index) =>
                                page === "..." ? (
                                    <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={`page-${page}`}
                                        onClick={() => paginate(page)}
                                        className={`px-3 py-2 rounded-lg transition-colors ${
                                            currentPage === page
                                                ? "bg-blue-500 text-white shadow-md"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                        title={`Trang ${page}`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-2 rounded-lg flex items-center transition-colors ${
                                    currentPage === totalPages
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                                title="Trang sau"
                            >
                                <ChevronRightIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListAcceptedPage;
