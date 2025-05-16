import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom"; // Thêm Outlet
import { FaBars, FaUsers, FaFileAlt, FaCog, FaSignOutAlt, FaGraduationCap, FaListAlt, FaUniversity, FaMapMarkerAlt, FaUserTag, FaChartBar, FaCalendarAlt } from "react-icons/fa";
import logo from "../../assets/logo_hcmute.png";

const AdminPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const linkClass = (path) =>
    `flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
      location.pathname === path ? "bg-blue-800" : "hover:bg-blue-700"
    }`;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-[#00548f] text-white flex flex-col transition-all duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div className="flex flex-col items-center py-4">
          <img
            src={logo}
            alt="HCMUTE Logo"
            className={`${sidebarOpen ? "w-24" : "w-10"} mb-4 transition-all duration-300`}
          />
          {sidebarOpen && <span className="text-sm font-bold">HCMUTE</span>}
        </div>

        {/* Menu items */}
        <nav className="flex-1 px-2 space-y-2">
          <Link to="/admin/users" className={linkClass("/admin/users")}>
            <FaUsers className="text-xl" />
            {sidebarOpen && <span>Quản lý người dùng</span>}
          </Link>
          <Link to="/admin/admission-years" className={linkClass("/admin/admission-years")}>
            <FaCalendarAlt className="text-xl" />
            {sidebarOpen && <span>Quản lý năm tuyển sinh</span>}
          </Link>
          <Link to="/admin/admission-blocks" className={linkClass("/admin/admission-blocks")}>
            <FaGraduationCap className="text-xl" />
            {sidebarOpen && <span>Quản lý khối xét tuyển</span>}
          </Link>
          <Link to="/admin/admission-majors" className={linkClass("/admin/admission-majors")}>
            <FaUniversity className="text-xl" />
            {sidebarOpen && <span>Quản lý ngành xét tuyển</span>}
          </Link>
          <Link to="/admin/admission-criteria" className={linkClass("/admin/admission-criteria")}>
            <FaListAlt className="text-xl" />
            {sidebarOpen && <span>Quản lý diện xét tuyển</span>}
          </Link>
          <Link to="/admin/admission-regions" className={linkClass("/admin/admission-regions")}>
            <FaMapMarkerAlt className="text-xl" />
            {sidebarOpen && <span>Quản lý khu vực ưu tiên</span>}
          </Link>
          <Link to="/admin/admission-objects" className={linkClass("/admin/admission-objects")}>
            <FaUserTag className="text-xl" />
            {sidebarOpen && <span>Quản lý đối tượng ưu tiên</span>}
          </Link>
          <Link to="/admin/admission-quantities" className={linkClass("/admin/admission-quantities")}>
            <FaChartBar className="text-xl" />
            {sidebarOpen && <span>Quản lý chỉ tiêu</span>}
          </Link>
        </nav>

        {/* Logout */}
        <div className="mt-auto px-2 pb-4">
          <Link
            to="/"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-white"
          >
            <FaSignOutAlt className="text-xl" />
            {sidebarOpen && <span>Đăng xuất</span>}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="bg-[#00548f] text-white py-3 px-4 flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 text-xl focus:outline-none"
            title="Thu gọn/mở rộng menu"
          >
            <FaBars />
          </button>
          <span className="text-lg font-semibold uppercase">
            Trường Đại Học Sư Phạm Kỹ Thuật TP.HCM
          </span>
        </div>

        {/* Outlet hiển thị nội dung page con */}
        <div className="p-6 overflow-y-auto bg-gray-100 h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
