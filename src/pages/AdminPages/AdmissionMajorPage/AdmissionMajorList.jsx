import React, { useState, useEffect } from "react";
import axios from "axios";
import InfoModal from "../Modals/AdmissionMajorModal/InfoModal";
import AdmissionMajorFormModal from "../Modals/AdmissionMajorModal/AdmissionMajorFormModal";
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdmissionMajorList = ({ majors = [], setMajors }) => {
    const [selectedMajor, setSelectedMajor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [majorToEdit, setMajorToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isLoading, setIsLoading] = useState(true);

    // Load admission majors from API
    const loadAdmissionMajors = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Vui lòng đăng nhập");
            const response = await axios.get(`${API_BASE_URL}/adms/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMajors(response.data);
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Lỗi khi tải danh sách ngành xét tuyển");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAdmissionMajors();
    }, []);

    const handleDelete = async (major) => {
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa ngành ${major.majorName}?`);
        if (confirmDelete) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${API_BASE_URL}/adms/delete/${major.majorId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                await loadAdmissionMajors();
                setError("");
            } catch (error) {
                setError(error.response?.data?.message || "Lỗi khi xóa ngành xét tuyển");
            }
        }
    };

    const handleMoreClick = (major) => {
        setSelectedMajor(major);
    };

    const handleEdit = (major) => {
        setMajorToEdit(major);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleAddMajor = () => {
        setMajorToEdit(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedMajor(null);
        setIsModalOpen(false);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Filter majors based on search query
    const filteredMajors = majors.filter(
        (major) =>
            major.majorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            major.majorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            major.majorCodeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMajors.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMajors.length / itemsPerPage);

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

    return (
        <div className="w-full bg-white shadow-md">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-blue-600 text-center">Quản lý Ngành xét tuyển</h1>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4 flex-grow">
                        <div className="relative flex-grow max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Tìm kiếm theo tên hoặc mã ngành"
                                className="pl-10 p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAddMajor}
                        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors flex items-center whitespace-nowrap"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm ngành xét tuyển
                    </button>
                </div>

                <div className="border border-gray-300 rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]"
                                    >
                                        Mã ngành
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]"
                                    >
                                        Tên ngành
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]"
                                    >
                                        Tổ hợp xét tuyển
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]"
                                    >
                                        Mô tả
                                    </th>
                                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                                        Trạng thái
                                    </th> */}
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]"
                                    >
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center">
                                                <svg
                                                    className="animate-spin h-5 w-5 text-blue-500 mr-2"
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
                                                <span>Đang tải...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                            Không có ngành xét tuyển phù hợp
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((major) => (
                                        <tr key={major.majorId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{major.majorId}</div>
                                                <div className="text-sm text-gray-500">{major.majorCodeName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 break-words">
                                                    {major.majorName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500">
                                                    {major.majorCombination ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {major.majorCombination.map((combo, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded break-words"
                                                                >
                                                                    {combo}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        "Không có tổ hợp"
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className="text-sm text-gray-500 prose prose-sm max-w-none line-clamp-2"
                                                    dangerouslySetInnerHTML={{
                                                        __html: major.majorDescription || "Không có mô tả",
                                                    }}
                                                />
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        major.isActive
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {major.isActive ? "Đang hoạt động" : "Đã ẩn"}
                                                </span>
                                            </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(major)}
                                                        className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 p-1 rounded-md transition-colors"
                                                        title="Cập nhật"
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
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(major)}
                                                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-1 rounded-md transition-colors"
                                                        title="Xoá"
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
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoreClick(major)}
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-1 rounded-md transition-colors"
                                                        title="Xem thêm"
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
                                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
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

                <div className="flex flex-col md:flex-row justify-between items-center mt-4">
                    <div className="flex items-center mb-4 md:mb-0">
                        <span className="text-sm text-gray-700 mr-4">
                            Hiển thị
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="mx-1 p-1 border border-gray-300 rounded-md"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                            mục / trang
                        </span>
                        <span className="text-sm text-gray-700">
                            Tổng: <span className="font-medium">{filteredMajors.length}</span> ngành xét tuyển
                        </span>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-1">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-2 py-1 rounded-md flex items-center ${
                                    currentPage === 1
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>

                            {getPageRange().map((page, index) =>
                                page === "..." ? (
                                    <span key={`ellipsis-${index}`} className="px-2 py-1">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={`page-${page}`}
                                        onClick={() => paginate(page)}
                                        className={`px-3 py-1 rounded-md ${
                                            currentPage === page
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-2 py-1 rounded-md flex items-center ${
                                    currentPage === totalPages
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <AdmissionMajorFormModal
                        majorToEdit={majorToEdit}
                        setMajors={setMajors}
                        onClose={() => setIsModalOpen(false)}
                        isEditing={isEditing}
                    />
                )}

                <InfoModal major={selectedMajor} onClose={handleCloseModal} />
            </div>
        </div>
    );
};

export default AdmissionMajorList;
