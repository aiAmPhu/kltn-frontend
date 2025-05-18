// src/pages/ReviewerPage.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUser,
  FaSpinner,
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
} from "react-icons/fa";

const ReviewerPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("userId");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Ref for sticky header
  const tableContainerRef = useRef(null);

  // Lấy dữ liệu user từ API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/users/getAll`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(res.data.data || []);
      } catch (err) {
        setError("Lỗi khi tải danh sách người dùng 😓");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  // Lọc, tìm kiếm và sắp xếp user
  const getFilteredUsers = () => {
    let result = users;

    // Search: tìm theo tên hoặc userId (không phân biệt hoa thường, loại bỏ khoảng trắng thừa)
    if (searchTerm.trim() !== "") {
      const search = searchTerm.trim().toLowerCase();
      result = result.filter(
        (user) =>
          (user.name && user.name.toLowerCase().includes(search)) ||
          (user.userId && user.userId.toString().includes(search))
      );
    }

    // Filter theo trạng thái
    if (filterStatus !== "all") {
      result = result.filter((user) => user.status === filterStatus);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle undefined/null
      if (aValue === undefined || aValue === null) aValue = "";
      if (bValue === undefined || bValue === null) bValue = "";

      // Numeric sort for userId
      if (sortField === "userId") {
        aValue = Number(aValue);
        bValue = Number(bValue);
        if (isNaN(aValue)) aValue = 0;
        if (isNaN(bValue)) bValue = 0;
      } else {
        // String sort for name, status
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  };

  const filteredUsers = getFilteredUsers();

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Khi search/filter/sort thay đổi thì reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, users, sortField, sortOrder]);

  // Hàm chuyển trang
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Tạo mảng số trang hiển thị
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return "Đang chờ";
    }
  };

  // Xử lý đổi sort
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Hiển thị icon sort
  const renderSortIcon = (field) => {
    if (sortField !== field)
      return <span className="ml-1 text-gray-400">&#8597;</span>;
    if (sortOrder === "asc") {
      return <span className="ml-1 text-blue-600">&#8593;</span>;
    }
    return <span className="ml-1 text-blue-600">&#8595;</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaUser className="text-blue-600" />
                Reviewer Dashboard
              </h1>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-white"
                title="Đăng xuất"
              >
                <FaSignOutAlt className="text-xl" />
                <span>Đăng xuất</span>
              </button>
            </div>

            {/* Search, Filter, and Sort Section */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Đang chờ</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                  </select>
                  {/* Sort dropdown */}
                  <select
                    value={sortField + "_" + sortOrder}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split("_");
                      setSortField(field);
                      setSortOrder(order);
                    }}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="userId_asc">ID tăng dần</option>
                    <option value="userId_desc">ID giảm dần</option>
                    <option value="name_asc">Tên A-Z</option>
                    <option value="name_desc">Tên Z-A</option>
                    <option value="status_asc">Trạng thái A-Z</option>
                    <option value="status_desc">Trạng thái Z-A</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col min-h-[350px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-blue-600" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <FaExclamationCircle className="text-2xl mr-2" />
                  <p>{error}</p>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Table/List */}
                  <div
                    className="table-responsive mt-3 flex-1"
                    style={{ maxHeight: "50vh", overflowY: "auto" }}
                    ref={tableContainerRef}
                  >
                    <div className="relative">
                      {/* Sticky header row */}
                      <div
                        className="hidden md:grid grid-cols-12 px-4 py-2 text-gray-500 text-sm font-semibold border-b border-gray-100 bg-white z-10"
                        style={{
                          position: "sticky",
                          top: 0,
                          left: 0,
                          right: 0,
                          boxShadow: "0 2px 4px -2px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div
                          className="col-span-2 cursor-pointer flex items-center"
                          onClick={() => handleSortChange("userId")}
                        >
                          ID
                          {renderSortIcon("userId")}
                        </div>
                        <div
                          className="col-span-7 cursor-pointer flex items-center"
                          onClick={() => handleSortChange("name")}
                        >
                          Tên
                          {renderSortIcon("name")}
                        </div>
                        <div
                          className="col-span-3 cursor-pointer flex items-center"
                          onClick={() => handleSortChange("status")}
                        >
                          Trạng thái
                          {renderSortIcon("status")}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {currentItems.length === 0 ? (
                          <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">
                              Không tìm thấy kết quả phù hợp
                            </p>
                          </div>
                        ) : (
                          // Desktop/tablet: grid, Mobile: flex
                          currentItems.map((user) => (
                            <div
                              key={user.userId}
                              onClick={() =>
                                navigate(`/reviewer/user/${user.userId}`)
                              }
                              className="group cursor-pointer flex flex-col md:grid md:grid-cols-12 md:items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                            >
                              {/* ID */}
                              <div className="flex items-center gap-4 md:col-span-2">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold">
                                  {user.userId}
                                </div>
                                <div className="md:hidden">
                                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {user.name}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    ID: {user.userId}
                                  </p>
                                </div>
                              </div>
                              {/* Name */}
                              <div className="hidden md:flex md:col-span-7 items-center">
                                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {user.name}
                                </h3>
                              </div>
                              {/* Status */}
                              <div className="md:col-span-3 flex items-center">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                    user.status
                                  )}`}
                                >
                                  {getStatusText(user.status)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-3">
                      <div className="text-sm text-gray-500 mb-2 md:mb-0">
                        Hiển thị{" "}
                        {filteredUsers.length === 0
                          ? 0
                          : indexOfFirstItem + 1}{" "}
                        - {Math.min(indexOfLastItem, filteredUsers.length)} của{" "}
                        {filteredUsers.length} kết quả
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg ${
                            currentPage === 1
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <FaChevronLeft />
                        </button>

                        {getPageNumbers().map((number, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              typeof number === "number" &&
                              handlePageChange(number)
                            }
                            className={`px-3 py-1 rounded-lg ${
                              number === currentPage
                                ? "bg-blue-600 text-white"
                                : number === "..."
                                ? "text-gray-500 cursor-default"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            disabled={number === "..."}
                          >
                            {number}
                          </button>
                        ))}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-lg ${
                            currentPage === totalPages
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerPage;
