import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateYearModal from "../Modals/AdmissionYearModal/CreateYearModal.jsx";
import ConfigModal from "../Modals/AdmissionYearModal/ConfigModal.jsx";
import { toast } from "react-toastify";

const AdmissionYearList = () => {
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
        }
    };

    // Fetch year config
    const fetchYearConfig = async (yearId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admissionYear/config/${yearId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Year config response:", response.data.data);
            setCurrentConfig(response.data.data);
        } catch (error) {
            console.error("Error fetching config:", error);
            setCurrentConfig({ criteria: [], majors: [], objects: [], regions: [] });
        }
    };

    // Handle configure button click
    const handleConfigureClick = async (year) => {
        // Thêm kiểm tra quyền
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
                selectedItems, // { criteria: [...], majors: [...], objects: [...], regions: [...] }
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
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admissionYear/getAll`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setYears(response.data.data);
            const active = response.data.data.find((year) => year.status === "active");
            setActiveYear(active);
        } catch (error) {
            console.error("Error fetching years:", error);
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
    // Activate year
    const handleActivateYear = async (yearId) => {
        if (!window.confirm("Kích hoạt năm này sẽ tự động vô hiệu hóa các năm khác. Bạn có chắc chắn?")) {
            return;
        }
        try {
            const token = localStorage.getItem("token");
            console.log("Activating year:", yearId);
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/admissionYear/activate/${yearId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchYears();
            toast.success("Kích hoạt năm tuyển sinh thành công! Các năm khác đã được tự động vô hiệu hóa.");
        } catch (error) {
            toast.error("Lỗi: " + (error.response?.data?.message || "Không thể kích hoạt"));
        }
    };
    const formatDisplayDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-blue-700">Quản lý Năm Tuyển Sinh</h1>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Tạo Năm Mới
                </button>
            </div>

            {/* Active Year Info */}
            {activeYear && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded">
                    <h3 className="text-lg font-semibold text-green-800">
                        Năm Tuyển Sinh Đang Hoạt Động: {activeYear.yearName}
                    </h3>
                    <p className="text-green-700">
                        Từ {formatDisplayDate(activeYear.startDate)} đến {formatDisplayDate(activeYear.endDate)}
                    </p>
                </div>
            )}

            {/* Years List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {years.map((year) => (
                    <div key={year.yearId} className="border rounded-lg p-4 shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{year.yearName}</h3>
                            <span
                                className={`px-2 py-1 rounded text-xs ${
                                    year.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                            >
                                {year.status === "active" ? "Hoạt động" : "Không hoạt động"}
                            </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                            {formatDisplayDate(year.startDate)} - {formatDisplayDate(year.endDate)}
                        </p>

                        <p className="text-sm mb-4">{year.description}</p>

                        <div className="flex gap-2">
                            {year.status !== "active" ? (
                                // Năm không active: chỉ hiện button Kích hoạt
                                <button
                                    onClick={() => handleActivateYear(year.yearId)}
                                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                >
                                    Kích hoạt
                                </button>
                            ) : (
                                // Năm đang active: chỉ hiện button Cấu hình
                                <button
                                    onClick={() => handleConfigureClick(year)}
                                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                >
                                    Cấu hình
                                </button>
                            )}
                        </div>
                    </div>
                ))}
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
        </div>
    );
};

export default AdmissionYearList;
