import React, { useState, useEffect } from "react";
import axios from "axios";
import InfoModal from "../Modals/AdmissionCriteriaModal/InfoModal";
import AdmissionCriteriaFormModal from "../Modals/AdmissionCriteriaModal/AdmissionCriteriaFormModal";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { 
    FaExclamationCircle, 
    FaSearch, 
    FaPlus, 
    FaSpinner, 
    FaGraduationCap,
    FaEdit, 
    FaTrash, 
    FaInfoCircle 
} from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdmissionCriteriaList = ({ criterias = [], setCriterias }) => {
    const [selectedCriteria, setSelectedCriteria] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [criteriaToEdit, setCriteriaToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [criteriaToDelete, setCriteriaToDelete] = useState(null);

    // Load admission criteria from API
    const loadAdmissionCriteria = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Vui lòng đăng nhập");
            const response = await axios.get(`${API_BASE_URL}/adcs/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCriterias(response.data || []);
            setError("");
        } catch (error) {
            // Chỉ hiển thị lỗi nếu không phải lỗi "không tìm thấy dữ liệu"
            const errorMessage = error.response?.data?.message || "Lỗi khi tải danh sách diện xét tuyển";
            if (!errorMessage.toLowerCase().includes("không tìm được") && 
                !errorMessage.toLowerCase().includes("not found") &&
                error.response?.status !== 404) {
                setError(errorMessage);
                toast.error(errorMessage);
            } else {
                setError("");
                setCriterias([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAdmissionCriteria();
    }, []);

    const handleDelete = async (criteria) => {
        setCriteriaToDelete(criteria);
        setShowDeleteModal(true);
    };

    const performDelete = async () => {
            try {
                const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/adcs/delete/${criteriaToDelete.criteriaId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                await loadAdmissionCriteria();
            toast.success("Xóa diện xét tuyển thành công!");
                setError("");
            } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa diện xét tuyển");
                setError(error.response?.data?.message || "Lỗi khi xóa diện xét tuyển");
        } finally {
            setShowDeleteModal(false);
            setCriteriaToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setCriteriaToDelete(null);
    };

    const handleMoreClick = (criteria) => {
        setSelectedCriteria(criteria);
    };

    const handleEdit = (criteria) => {
        setCriteriaToEdit(criteria);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleAddCriteria = () => {
        setCriteriaToEdit(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedCriteria(null);
        setIsModalOpen(false);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Filter criteria based on search query
    const filteredCriteria = criterias.filter(
        (criteria) =>
            criteria.criteriaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            criteria.criteriaId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCriteria.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCriteria.length / itemsPerPage);

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
        if (filteredCriteria.length > 0 && currentItems.length === 0 && currentPage > 1) {
            setCurrentPage(1);
        }
    }, [filteredCriteria.length, currentItems.length, currentPage]);

    return (
        <div className="w-full bg-white shadow-lg rounded-xl border border-gray-200">
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Quản lý diện xét tuyển</h1>
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
                                placeholder="Tìm kiếm theo tên hoặc mã diện"
                                className="pl-10 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAddCriteria}
                        className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-md whitespace-nowrap"
                        title="Thêm diện xét tuyển mới"
                    >
                        <FaPlus className="text-sm" />
                        <span className="hidden sm:inline">Thêm diện xét tuyển</span>
                        <span className="sm:hidden">Thêm</span>
                    </button>
                </div>

                {/* Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã diện</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên diện</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Mô tả</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
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
                                                        Chưa có diện xét tuyển nào
                                                    </h3>
                                                    <p className="text-sm text-gray-600 max-w-md">
                                                        Bắt đầu bằng cách tạo diện xét tuyển đầu tiên cho hệ thống của bạn
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleAddCriteria}
                                                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                                                >
                                                    <FaPlus className="text-sm" />
                                                    Tạo diện xét tuyển đầu tiên
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((criteria) => (
                                        <tr key={criteria.criteriaId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {criteria.criteriaId}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="text-sm text-gray-900 font-medium">{criteria.criteriaName}</div>
                                                <div className="text-xs text-gray-500 mt-1 md:hidden line-clamp-2">
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: criteria.criteriaDescription || "Không có mô tả",
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                                <div className="text-sm text-gray-500 line-clamp-2">
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: criteria.criteriaDescription || "Không có mô tả",
                                                    }}
                                                />
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-1 sm:space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(criteria)}
                                                        className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 p-2 rounded-lg transition-colors"
                                                        title="Chỉnh sửa diện xét tuyển"
                                                        >
                                                        <FaEdit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(criteria)}
                                                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-lg transition-colors"
                                                        title="Xóa diện xét tuyển này"
                                                        >
                                                        <FaTrash className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoreClick(criteria)}
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-lg transition-colors"
                                                        title="Xem chi tiết diện xét tuyển"
                                                        >
                                                        <FaInfoCircle className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
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
                            Tổng: <span className="font-medium text-blue-600">{filteredCriteria.length}</span> diện xét tuyển
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
                    <AdmissionCriteriaFormModal
                        criteriaToEdit={criteriaToEdit}
                        setCriterias={setCriterias}
                        onClose={() => setIsModalOpen(false)}
                        isEditing={isEditing}
                    />
                )}

                <InfoModal criteria={selectedCriteria} onClose={handleCloseModal} />

                {/* Delete Confirmation Modal */}
                {showDeleteModal && criteriaToDelete && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
                        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaExclamationCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Xác nhận xóa</h3>
                                <p className="text-gray-600">
                                    Bạn có chắc chắn muốn xóa diện <span className="font-semibold text-gray-800">{criteriaToDelete.criteriaName}</span>?
                                </p>
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

export default AdmissionCriteriaList;
