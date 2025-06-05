import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import InfoPermissionModal from "../Modals/PermissionModal/InfoPermissionModal";
import PermissionFormModal from "../Modals/PermissionModal/PermissionFormModal";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PermissionList = ({ users: usersProp = [], setUsers: setUsersProp }) => {
    // Internal state for users, decoupled from props
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(5);
    const [isLoading, setIsLoading] = useState(true);

    // Keep a ref to know if initial load is done
    const hasLoadedRef = useRef(false);

    // Debounce search query with cleanup
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1); // Reset to first page when search changes
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load users from API (only on first mount or explicit reload)
    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Vui lòng đăng nhập");
            // Lấy danh sách user có quyền (permissions)
            const response = await axios.get(`${API_BASE_URL}/users/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            let userData = response.data?.data;
            if (!userData && Array.isArray(response.data)) {
                userData = response.data;
            }
            if (!userData && Array.isArray(response.data?.users)) {
                userData = response.data.users;
            }
            if (!userData) {
                throw new Error("Không lấy được danh sách người dùng");
            }
            setUsers(userData);
            if (typeof setUsersProp === "function") setUsersProp(userData);
            setError("");
        } catch (error) {
            setUsers([]);
            if (typeof setUsersProp === "function") setUsersProp([]);
            setError(error.response?.data?.message || error.message || "Lỗi khi tải danh sách người dùng");
        } finally {
            setIsLoading(false);
        }
    }, [setUsersProp]);

    // On mount: only load if no data in props, else use props
    useEffect(() => {
        if (usersProp && Array.isArray(usersProp) && usersProp.length > 0) {
            setUsers(usersProp);
            hasLoadedRef.current = true;
            setIsLoading(false);
        } else {
            loadUsers().then(() => {
                hasLoadedRef.current = true;
            });
        }
        // eslint-disable-next-line
    }, []);

    // If props change (for example, after add/edit), update local users
    useEffect(() => {
        if (hasLoadedRef.current && usersProp && Array.isArray(usersProp) && usersProp.length > 0) {
            setUsers(usersProp);
        }
    }, [usersProp]);

    // Update filteredUsers when filters change
    useEffect(() => {
        if (!users || !Array.isArray(users)) {
            setFilteredUsers([]);
            return;
        }
        let filtered = [...users];
        // Apply search filter
        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase().trim();
            filtered = filtered.filter(
                (user) => user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query)
            );
        }
        setFilteredUsers(filtered);

        // Adjust current page if necessary
        const maxPage = Math.ceil(filtered.length / usersPerPage);
        if (currentPage > maxPage) {
            setCurrentPage(Math.max(1, maxPage));
        }
    }, [users, debouncedSearchQuery, usersPerPage, currentPage]);

    // Xoá quyền
    const handleDelete = async (user) => {
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa quyền của ${user.name}?`);
        if (confirmDelete) {
            try {
                const token = localStorage.getItem("token");
                console.log("Xoá quyền cho user:", user.userId);
                await axios.delete(`${API_BASE_URL}/permissions/delete/${user.userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                await loadUsers();
                toast.success("Xóa quyền thành công!");
                setError("");
            } catch (error) {
                setError(error.response?.data?.message || "Lỗi khi xóa quyền");
            }
        }
    };

    const handleMoreClick = (user) => {
        setSelectedUser(user);
    };

    const handleEdit = (user) => {
        setUserToEdit(user);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setIsModalOpen(false);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleUsersPerPageChange = (e) => {
        setUsersPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when items per page changes
    };

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Navigate to specific page
    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Create page range for pagination
    const getPageRange = () => {
        const delta = 1; // Number of pages to show before and after current page
        let range = [];

        // Always show first page
        range.push(1);

        // Calculate start and end of the main range
        let start = Math.max(2, currentPage - delta);
        let end = Math.min(totalPages - 1, currentPage + delta);

        // Add ellipsis after first page if needed
        if (start > 2) {
            range.push("...");
        }

        // Add the main range of pages
        for (let i = start; i <= end; i++) {
            range.push(i);
        }

        // Add ellipsis before last page if needed
        if (end < totalPages - 1) {
            range.push("...");
        }

        // Always show last page if there is more than one page
        if (totalPages > 1) {
            range.push(totalPages);
        }

        return range;
    };

    return (
        <div className="w-full bg-white shadow-md">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-blue-600 text-center">Quản lý phân quyền</h1>
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
                        {/* Ô tìm kiếm */}
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
                                placeholder="Tìm kiếm theo tên hoặc email"
                                className="pl-10 p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Nút thêm quyền */}
                    {/* <button
                        onClick={handleAddPermission}
                        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors flex items-center whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm quyền
                    </button> */}
                </div>

                <div className="border border-gray-300 rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Tên người dùng
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Email
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Trạng thái
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center">
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
                                ) : currentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                            Không có người dùng phù hợp
                                        </td>
                                    </tr>
                                ) : (
                                    currentUsers.map((user) => (
                                        <tr key={user.userId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                    ${
                                                        user.majorGroup && user.majorGroup.length > 0
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {user.majorGroup && user.majorGroup.length > 0
                                                        ? "Kích hoạt"
                                                        : "Chưa kích hoạt"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
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
                                                        onClick={() => handleDelete(user)}
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
                                                        onClick={() => handleMoreClick(user)}
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
                                value={usersPerPage}
                                onChange={handleUsersPerPageChange}
                                className="mx-1 p-1 border border-gray-300 rounded-md"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                            mục / trang
                        </span>
                        <span className="text-sm text-gray-700">
                            Tổng: <span className="font-medium">{filteredUsers.length}</span> người dùng
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
                    <PermissionFormModal
                        userId={userToEdit?._id}
                        userToEdit={userToEdit}
                        setUsers={setUsers}
                        onClose={() => setIsModalOpen(false)}
                        isEditing={isEditing}
                        reloadUsers={loadUsers}
                    />
                )}

                <InfoPermissionModal user={selectedUser} onClose={handleCloseModal} />
            </div>
        </div>
    );
};

export default PermissionList;
