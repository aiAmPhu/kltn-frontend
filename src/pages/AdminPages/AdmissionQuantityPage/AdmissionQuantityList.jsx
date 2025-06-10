import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import AdmissionQuantityFormModal from "../Modals/AdmissionQuantityModal/AdmissionQuantityFormModal";
import InfoModal from "../Modals/AdmissionQuantityModal/InfoModal";
import ImportModal from "../Modals/AdmissionQuantityModal/ImportModal";
import {
    FaExclamationCircle,
    FaSearch,
    FaPlus,
    FaSpinner,
    FaChartBar,
    FaEdit,
    FaTrash,
    FaInfoCircle,
    FaDownload,
    FaUpload,
} from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdmissionQuantityList = ({ quantities = [], setQuantities }) => {
    const [selectedQuantity, setSelectedQuantity] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quantityToEdit, setQuantityToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isLoading, setIsLoading] = useState(true);
    const [majors, setMajors] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [quantityToDelete, setQuantityToDelete] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Load majors and criteria
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const [majorsRes, criteriaRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/adms/getall`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_BASE_URL}/adcs/getall`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                setMajors(majorsRes.data || []);
                setCriteria(criteriaRes.data || []);
                setError("");
            } catch (error) {
                const errorMessage = "Lỗi khi tải dữ liệu ngành và diện xét tuyển";
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (quantity) => {
        setQuantityToDelete(quantity);
        setShowDeleteModal(true);
    };

    const performDelete = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!quantityToDelete.majorId || !quantityToDelete.criteriaId) {
                throw new Error("Thiếu thông tin ngành hoặc diện xét tuyển");
            }

            await axios.delete(`${API_BASE_URL}/adqs/delete`, {
                headers: { Authorization: `Bearer ${token}` },
                data: {
                    majorId: quantityToDelete.majorId,
                    criteriaId: quantityToDelete.criteriaId,
                },
            });

            const response = await axios.get(`${API_BASE_URL}/adqs/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setQuantities(response.data);
            toast.success("Xóa chỉ tiêu thành công!");
            setError("");
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Lỗi khi xóa chỉ tiêu";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setShowDeleteModal(false);
            setQuantityToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setQuantityToDelete(null);
    };

    const handleEdit = (quantity) => {
        setQuantityToEdit(quantity);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleAddQuantity = () => {
        setQuantityToEdit(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleMoreClick = (quantity) => {
        setSelectedQuantity(quantity);
    };

    const handleCloseModal = () => {
        setSelectedQuantity(null);
        setIsModalOpen(false);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Filter quantities based on search
    const filteredQuantities = quantities.filter((quantity) => {
        if (!searchQuery) return true;
        const major = majors.find((m) => m.majorId === quantity.majorId);
        const criterion = criteria.find((c) => c.criteriaId === quantity.criteriaId);
        return (
            major?.majorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            criterion?.criteriaName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredQuantities.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredQuantities.length / itemsPerPage);

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
        if (filteredQuantities.length > 0 && currentItems.length === 0 && currentPage > 1) {
            setCurrentPage(1);
        }
    }, [filteredQuantities.length, currentItems.length, currentPage]);

    // Export to Excel function
    const handleExportToExcel = async () => {
        setIsExporting(true);
        try {
            // Prepare data for export
            const exportData = quantities.map((quantity) => {
                const major = majors.find((m) => m.majorId === quantity.majorId);
                const criterion = criteria.find((c) => c.criteriaId === quantity.criteriaId);

                return {
                    "Mã ngành": quantity.majorId,
                    "Mã diện xét tuyển": quantity.criteriaId,
                    "Số lượng chỉ tiêu": quantity.quantity,
                };
            });

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);

            // Set column widths
            const colWidths = [
                { wch: 15 }, // Mã ngành
                { wch: 40 }, // Tên ngành
                { wch: 20 }, // Mã diện xét tuyển
                { wch: 30 }, // Tên diện xét tuyển
                { wch: 20 }, // Số lượng chỉ tiêu
            ];
            ws["!cols"] = colWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, "Chỉ tiêu tuyển sinh");

            // Generate filename with current date
            const currentDate = new Date().toISOString().slice(0, 10);
            const filename = `Chi_tieu_tuyen_sinh_${currentDate}.xlsx`;

            // Save file
            XLSX.writeFile(wb, filename);

            toast.success("Xuất file Excel thành công!");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error("Lỗi khi xuất file Excel");
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportClick = () => {
        setShowImportModal(true);
    };

    const handleImportSuccess = () => {
        setShowImportModal(false);
        // Refresh data after import
        const fetchUpdatedData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE_URL}/adqs/getall`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setQuantities(response.data);
            } catch (error) {
                console.error("Error refreshing data:", error);
            }
        };
        fetchUpdatedData();
    };

    return (
        <div className="w-full bg-white shadow-lg rounded-xl border border-gray-200">
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Quản lý chỉ tiêu tuyển sinh</h1>
                </div>

                {/* Search and Actions */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div className="w-full lg:flex-1 lg:max-w-md">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Tìm kiếm theo tên ngành hoặc diện xét tuyển"
                                className="pl-10 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleExportToExcel}
                            disabled={isExporting || quantities.length === 0}
                            className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Xuất file Excel"
                        >
                            {isExporting ? (
                                <FaSpinner className="text-sm animate-spin" />
                            ) : (
                                <FaDownload className="text-sm" />
                            )}
                            <span className="hidden sm:inline">{isExporting ? "Đang xuất..." : "Xuất Excel"}</span>
                            <span className="sm:hidden">{isExporting ? "Xuất..." : "Xuất"}</span>
                        </button>

                        <button
                            onClick={handleImportClick}
                            className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 shadow-md whitespace-nowrap"
                            title="Nhập từ file Excel"
                        >
                            <FaUpload className="text-sm" />
                            <span className="hidden sm:inline">Nhập Excel</span>
                            <span className="sm:hidden">Nhập</span>
                        </button>

                        <button
                            onClick={handleAddQuantity}
                            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-md whitespace-nowrap"
                            title="Thêm chỉ tiêu tuyển sinh mới"
                        >
                            <FaPlus className="text-sm" />
                            <span className="hidden sm:inline">Thêm chỉ tiêu</span>
                            <span className="sm:hidden">Thêm</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5"
                                    >
                                        Ngành
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell w-1/3"
                                    >
                                        Diện xét tuyển
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
                                    >
                                        Chỉ tiêu
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-auto"
                                    >
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 sm:px-6 py-8 text-center">
                                            <div className="flex justify-center items-center">
                                                <FaSpinner className="animate-spin h-6 w-6 text-blue-500 mr-3" />
                                                <span className="text-gray-600">Đang tải...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 sm:px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <FaPlus className="h-5 w-5 text-blue-500" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        Chưa có chỉ tiêu tuyển sinh nào
                                                    </h3>
                                                    <p className="text-sm text-gray-600 max-w-md">
                                                        Bắt đầu bằng cách tạo chỉ tiêu tuyển sinh đầu tiên cho hệ thống
                                                        của bạn
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleAddQuantity}
                                                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                                                >
                                                    <FaPlus className="text-sm" />
                                                    Tạo chỉ tiêu đầu tiên
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((quantity) => {
                                        const major = majors.find((m) => m.majorId === quantity.majorId);
                                        const criterion = criteria.find((c) => c.criteriaId === quantity.criteriaId);
                                        return (
                                            <tr key={quantity.aqId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 sm:px-6 py-4 w-2/5">
                                                    <div className="text-sm text-gray-900 font-medium">
                                                        {major?.majorName || "N/A"}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 lg:hidden">
                                                        Diện: {criterion?.criteriaName || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 hidden lg:table-cell w-1/3">
                                                    <div className="text-sm text-gray-900 break-words">
                                                        {criterion?.criteriaName || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap w-20">
                                                    <div className="text-sm text-gray-900 font-semibold">
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                            {quantity.quantity} chỉ tiêu
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-auto">
                                                    <div className="flex justify-end space-x-1 sm:space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(quantity)}
                                                            className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 p-2 rounded-lg transition-colors"
                                                            title="Chỉnh sửa chỉ tiêu"
                                                        >
                                                            <FaEdit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(quantity)}
                                                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-lg transition-colors"
                                                            title="Xóa chỉ tiêu này"
                                                        >
                                                            <FaTrash className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleMoreClick(quantity)}
                                                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-lg transition-colors"
                                                            title="Xem chi tiết chỉ tiêu"
                                                        >
                                                            <FaInfoCircle className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

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
                            Tổng: <span className="font-medium text-blue-600">{filteredQuantities.length}</span> chỉ
                            tiêu
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

                {isModalOpen && (
                    <AdmissionQuantityFormModal
                        quantityId={quantityToEdit?.aqId}
                        quantityToEdit={quantityToEdit}
                        setQuantities={setQuantities}
                        onClose={() => setIsModalOpen(false)}
                        isEditing={isEditing}
                        majors={majors}
                        criteria={criteria}
                    />
                )}

                <InfoModal quantity={selectedQuantity} onClose={handleCloseModal} majors={majors} criteria={criteria} />

                {/* Import Modal */}
                {showImportModal && (
                    <ImportModal
                        onClose={() => setShowImportModal(false)}
                        onSuccess={handleImportSuccess}
                        majors={majors}
                        criteria={criteria}
                    />
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && quantityToDelete && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
                        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaExclamationCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Xác nhận xóa</h3>
                                <p className="text-gray-600">Bạn có chắc chắn muốn xóa chỉ tiêu này?</p>
                                <p className="text-sm text-red-500 mt-2">Hành động này không thể hoàn tác!</p>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleCancelDelete}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors shadow-md"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={performDelete}
                                    className="bg-red-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-md"
                                >
                                    Xác nhận xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdmissionQuantityList;
