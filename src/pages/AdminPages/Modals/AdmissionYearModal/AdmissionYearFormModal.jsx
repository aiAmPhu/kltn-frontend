import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaCalendarAlt, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdmissionYearFormModal = ({ yearId, yearToEdit, setYears, onClose, isEditing }) => {
    const [yearIdInput, setYearIdInput] = useState("");
    const [yearName, setYearName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("inactive");
    const [error, setError] = useState("");

    useEffect(() => {
        if (yearToEdit) {
            setYearIdInput(yearToEdit.yearId);
            setYearName(yearToEdit.yearName);
            setStartDate(new Date(yearToEdit.startDate).toISOString().split('T')[0]);
            setEndDate(new Date(yearToEdit.endDate).toISOString().split('T')[0]);
            setStatus(yearToEdit.status);
        }
    }, [yearToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const yearData = {
            yearId: yearIdInput,
            yearName,
            startDate,
            endDate,
            status
        };

        try {
            if (isEditing) {
                await axios.put(`${API_BASE_URL}/adys/update/${yearIdInput}`, yearData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Cập nhật năm tuyển sinh thành công!");
            } else {
                await axios.post(`${API_BASE_URL}/adys/add`, yearData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Thêm năm tuyển sinh thành công!");
            }

            const response = await axios.get(`${API_BASE_URL}/adys/getAll`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setYears(response.data.data || response.data);
            onClose();
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
            setError(errorMsg);
            toast.error(errorMsg);
            console.error("Error:", error.response || error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
                    {isEditing ? "Cập nhật" : "Thêm"} năm tuyển sinh
                </h2>

                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FaCalendarAlt className="inline-block mr-2" />
                            Mã năm
                        </label>
                        <input
                            type="text"
                            value={yearIdInput}
                            onChange={(e) => setYearIdInput(e.target.value)}
                            placeholder="Nhập mã năm"
                            required
                            disabled={isEditing}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FaCalendarAlt className="inline-block mr-2" />
                            Tên năm
                        </label>
                        <input
                            type="text"
                            value={yearName}
                            onChange={(e) => setYearName(e.target.value)}
                            placeholder="Nhập tên năm"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FaClock className="inline-block mr-2" />
                            Ngày bắt đầu
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FaClock className="inline-block mr-2" />
                            Ngày kết thúc
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                        </select>
                    </div>

                    <div className="flex justify-between mt-6">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                        >
                            <FaCheck />
                            {isEditing ? "Cập nhật" : "Thêm"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
                        >
                            <FaTimes />
                            Đóng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdmissionYearFormModal; 