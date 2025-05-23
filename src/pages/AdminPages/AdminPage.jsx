import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaGraduationCap,
  FaListAlt,
  FaUniversity,
  FaMapMarkerAlt,
  FaUserTag,
  FaChartBar,
  FaCalendarAlt,
  FaCheckCircle,
  FaFilter,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaComments,
} from "react-icons/fa";
import logo from "../../assets/logo_hcmute.png";

const menuItems = [
  {
    to: "/admin/users",
    icon: <FaUsers className="text-lg" />,
    label: "Quản lý người dùng",
  },
  {
    to: "/admin/admission-years",
    icon: <FaCalendarAlt className="text-lg" />,
    label: "Quản lý năm tuyển sinh",
  },
  {
    to: "/admin/admission-blocks",
    icon: <FaGraduationCap className="text-lg" />,
    label: "Quản lý khối xét tuyển",
  },
  {
    to: "/admin/admission-majors",
    icon: <FaUniversity className="text-lg" />,
    label: "Quản lý ngành xét tuyển",
  },
  {
    to: "/admin/admission-criteria",
    icon: <FaListAlt className="text-lg" />,
    label: "Quản lý diện xét tuyển",
  },
  {
    to: "/admin/admission-regions",
    icon: <FaMapMarkerAlt className="text-lg" />,
    label: "Quản lý khu vực ưu tiên",
  },
  {
    to: "/admin/admission-objects",
    icon: <FaUserTag className="text-lg" />,
    label: "Quản lý đối tượng ưu tiên",
  },
  {
    to: "/admin/admission-quantities",
    icon: <FaChartBar className="text-lg" />,
    label: "Quản lý chỉ tiêu",
  },
  {
    to: "/admin/permissions",
    icon: <FaUserTag className="text-lg" />,
    label: "Quản lý quyền",
  },
  {
    to: "/admin/filter",
    icon: <FaFilter className="text-lg" />,
    label: "Lọc danh sách trúng tuyển",
  },
  {
    to: "/admin/list-accepted",
    icon: <FaCheckCircle className="text-lg" />,
    label: "Xem danh sách trúng tuyển",
  },
  {
    to: "/admin/chat",
    icon: <FaComments className="text-lg" />,
    label: "Chat với người dùng",
  },
];

const AdminPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Custom link class for active/inactive and compact/expanded
  const linkClass = (path) =>
    `group flex items-center ${
      sidebarOpen ? "space-x-3 px-3" : "justify-center px-0"
    } py-2 rounded-lg transition-all duration-200 ${
      location.pathname === path
        ? "bg-blue-800 font-semibold"
        : "hover:bg-blue-700"
    }`;

  // Hàm xử lý đăng xuất: xóa token và chuyển về trang đăng nhập
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-[#00548f] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-blue-900/30`}
      >
        {/* Logo */}
        <div className="flex flex-col items-center py-4">
          <img
            src={logo}
            alt="HCMUTE Logo"
            className={`${
              sidebarOpen ? "w-20" : "w-8"
            } mb-3 transition-all duration-300`}
          />
          {sidebarOpen && (
            <span className="text-xs font-bold tracking-wide">HCMUTE</span>
          )}
        </div>

        {/* Menu items */}
        <nav className={`flex-1 ${sidebarOpen ? "px-2" : "px-1"} space-y-1`}>
          {menuItems.map((item) => (
            <Link key={item.to} to={item.to} className={linkClass(item.to)}>
              <span
                className={`${
                  location.pathname === item.to
                    ? "text-white"
                    : "text-blue-100 group-hover:text-white"
                }`}
              >
                {item.icon}
              </span>
              {sidebarOpen && (
                <span
                  className={`truncate text-sm ${
                    location.pathname === item.to
                      ? "font-semibold"
                      : "font-normal"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>
        {/* Đã chuyển nút đăng xuất lên topbar */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="bg-[#00548f] text-white py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className={`
                ml-3 flex items-center justify-center
                w-9 h-9 rounded-full
                bg-white/20 hover:bg-white/30
                text-white transition
                focus:outline-none
                border border-white/30
                shadow
              `}
              title={sidebarOpen ? "Thu gọn menu" : "Mở rộng menu"}
              style={{
                backdropFilter: "blur(2px)",
              }}
            >
              {sidebarOpen ? (
                <FaAngleDoubleLeft className="text-lg" />
              ) : (
                <FaAngleDoubleRight className="text-lg" />
              )}
            </button>
            <span className="text-lg font-semibold uppercase">
              TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT THÀNH PHỐ HỒ CHÍ MINH
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-white"
            title="Đăng xuất"
          >
            <FaSignOutAlt className="text-xl" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
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
