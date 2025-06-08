import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateYearModal from "../Modals/AdmissionYearModal/CreateYearModal.jsx";
import ConfigModal from "../Modals/AdmissionYearModal/ConfigModal.jsx";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { 
    FaExclamationCircle, 
    FaPlus, 
    FaSpinner, 
    FaCalendarAlt,
    FaCog, 
    FaPlay, 
    FaInfoCircle,
    FaCheckCircle,
    FaPauseCircle
} from "react-icons/fa";
import { toast } from "react-toastify";

const AdmissionYearList = () => {
    useDocumentTitle("Quản lý năm tuyển sinh");
    
    const [years, setYears] = useState([]);
    const [activeYear, setActiveYear] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showConfigForm, setShowConfigForm] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const [currentConfig, setCurrentConfig] = useState(null);
    const [availableOptions, setAvailableOptions] = useState({
        criteria: [],
        majors: [],
        objects: [],
        regions: [],
    });
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [yearToActivate, setYearToActivate] = useState(null);
    const [formData, setFormData] = useState({
        yearId: "",
        yearName: "",
        startDate: "",
        endDate: "",
        description: "",
    });

    // Fetch all available options
    const fetchAvailableOptions = async () => {
        try {
            const token = localStorage.getItem("token");

            const [criteriaRes, majorsRes, objectsRes, regionsRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/adcs/getAll`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/adms/getAll`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/ados/getAll`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/adrs/getAll`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setAvailableOptions({
                criteria: criteriaRes.data || [],
                majors: majorsRes.data || [],
                objects: objectsRes.data || [],
                regions: regionsRes.data || [],
            });
        } catch (error) {
            console.error("Error fetching options:", error);
            toast.error("Lỗi khi tải dữ liệu cấu hình");
        }
    };

    // Fetch year config
    const fetchYearConfig = async (yearId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admissionYear/config/${yearId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCurrentConfig(response.data.data);
        } catch (error) {
            console.error("Error fetching config:", error);
            setCurrentConfig({ criteria: [], majors: [], objects: [], regions: [] });
        }
    };

    // Handle configure button click
    const handleConfigureClick = async (year) => {
        if (year.status !== "active") {
            toast.error("Chỉ có thể cấu hình năm tuyển sinh đang hoạt động!");
            return;
        }
        setSelectedYear(year);
        setLoading(true);
        await Promise.all([fetchAvailableOptions(), fetchYearConfig(year.yearId)]);
        setLoading(false);
        setShowConfigForm(true);
    };

    // Save configuration
    const handleSaveConfig = async (selectedItems) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/admissionYear/configure/${selectedYear.yearId}`,
                selectedItems,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowConfigForm(false);
            toast.success("Cấu hình năm tuyển sinh thành công!");
        } catch (error) {
            toast.error("Lỗi: " + (error.response?.data?.message || "Không thể cấu hình"));
        }
    };

    // Load years
    const fetchYears = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Vui lòng đăng nhập");
            
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admissionYear/getAll`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setYears(response.data.data || []);
            const active = response.data.data?.find((year) => year.status === "active");
            setActiveYear(active);
        } catch (error) {
            console.error("Error fetching years:", error);
            toast.error("Lỗi khi tải danh sách năm tuyển sinh");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchYears();
    }, []);

    // Create year
    const handleCreateYear = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/admissionYear/create`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowCreateForm(false);
            setFormData({ yearId: "", yearName: "", startDate: "", endDate: "", description: "" });
            fetchYears();
            toast.success("Tạo năm tuyển sinh thành công!");
        } catch (error) {
            toast.error("Lỗi: " + (error.response?.data?.message || "Không thể tạo năm"));
        }
    };

    // Handle activate year click
    const handleActivateClick = (year) => {
        setYearToActivate(year);
        setShowActivateModal(true);
    };

    // Confirm activate year
    const confirmActivateYear = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/admissionYear/activate/${yearToActivate.yearId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchYears();
            toast.success("Kích hoạt năm tuyển sinh thành công! Các năm khác đã được tự động vô hiệu hóa.");
        } catch (error) {
            toast.error("Lỗi: " + (error.response?.data?.message || "Không thể kích hoạt"));
        } finally {
            setShowActivateModal(false);
            setYearToActivate(null);
        }
    };

    const handleCancelActivate = () => {
        setShowActivateModal(false);
        setYearToActivate(null);
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    return (
        <div className="w-full bg-white shadow-lg rounded-xl border border-gray-200">
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Quản lý năm tuyển sinh</h1>
                </div>

                {/* Header Actions */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div className="flex-1">
                        {/* Active Year Info */}
                        {activeYear ? (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FaCheckCircle className="text-green-600 text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-green-800">
                                            Năm tuyển sinh đang hoạt động: {activeYear.yearName}
                                        </h3>
                                        <p className="text-green-700 text-sm">
                                            Từ {formatDisplayDate(activeYear.startDate)} đến {formatDisplayDate(activeYear.endDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <FaExclamationCircle className="text-yellow-600 text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-yellow-800">
                                            Chưa có năm tuyển sinh nào đang hoạt động
                                        </h3>
                                        <p className="text-yellow-700 text-sm">
                                            Vui lòng kích hoạt một năm tuyển sinh để bắt đầu
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-md whitespace-nowrap"
                        title="Tạo năm tuyển sinh mới"
                    >
                        <FaPlus className="text-sm" />
                        <span className="hidden sm:inline">Tạo năm mới</span>
                        <span className="sm:hidden">Tạo</span>
                    </button>
                </div>

                {/* Years Grid */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mr-3" />
                            <span className="text-gray-600 text-lg">Đang tải...</span>
                        </div>
                    ) : years.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FaPlus className="h-8 w-8 text-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        Chưa có năm tuyển sinh nào
                                    </h3>
                                    <p className="text-gray-600 max-w-md">
                                        Bắt đầu bằng cách tạo năm tuyển sinh đầu tiên cho hệ thống của bạn
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <FaPlus className="text-sm" />
                                    Tạo năm tuyển sinh đầu tiên
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {years.map((year) => (
                                <div key={year.yearId} className="border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 bg-white">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FaCalendarAlt className="text-blue-600 text-lg" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{year.yearName}</h3>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                                year.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {year.status === "active" ? (
                                                <>
                                                    <FaCheckCircle className="w-3 h-3" />
                                                    Hoạt động
                                                </>
                                            ) : (
                                                <>
                                                    <FaPauseCircle className="w-3 h-3" />
                                                    Không hoạt động
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                            <p className="text-sm font-medium text-gray-600 mb-1">Thời gian</p>
                                            <p className="text-sm text-gray-900">
                                                {formatDisplayDate(year.startDate)} - {formatDisplayDate(year.endDate)}
                                            </p>
                                        </div>

                                        {year.description && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-sm font-medium text-gray-600 mb-1">Mô tả</p>
                                                <p className="text-sm text-gray-900 line-clamp-2">{year.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        {year.status !== "active" ? (
                                            <button
                                                onClick={() => handleActivateClick(year)}
                                                className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                                                title="Kích hoạt năm tuyển sinh này"
                                            >
                                                <FaPlay className="w-3 h-3" />
                                                Kích hoạt
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleConfigureClick(year)}
                                                className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                                                title="Cấu hình năm tuyển sinh này"
                                            >
                                                <FaCog className="w-3 h-3" />
                                                Cấu hình
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modals */}
                <CreateYearModal
                    show={showCreateForm}
                    onClose={() => setShowCreateForm(false)}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleCreateYear}
                />

                <ConfigModal
                    show={showConfigForm}
                    onClose={() => setShowConfigForm(false)}
                    selectedYear={selectedYear}
                    currentConfig={currentConfig}
                    availableOptions={availableOptions}
                    loading={loading}
                    onSaveConfig={handleSaveConfig}
                />

                {/* Activate Confirmation Modal */}
                {showActivateModal && yearToActivate && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
                        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaExclamationCircle className="w-8 h-8 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Xác nhận kích hoạt</h3>
                                <p className="text-gray-600">
                                    Kích hoạt năm <span className="font-semibold text-gray-800">{yearToActivate.yearName}</span> sẽ tự động vô hiệu hóa các năm khác.
                                </p>
                                <p className="text-sm text-orange-500 mt-2">Bạn có chắc chắn muốn tiếp tục?</p>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleCancelActivate}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors shadow-md"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={confirmActivateYear}
                                    className="bg-green-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors shadow-md"
                                >
                                    Xác nhận kích hoạt
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdmissionYearList;
