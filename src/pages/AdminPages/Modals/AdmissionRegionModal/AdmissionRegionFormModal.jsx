import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdmissionRegionFormModal = ({ regionId, regionToEdit, setRegions, onClose, isEditing }) => {
    const [regionIdInput, setRegionIdInput] = useState("");
    const [regionName, setRegionName] = useState("");
    const [regionScored, setRegionScored] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (regionToEdit) {
            setRegionIdInput(regionToEdit.regionId);
            setRegionName(regionToEdit.regionName);
            setRegionScored(regionToEdit.regionScored);
        } else {
            setRegionIdInput("");
            setRegionName("");
            setRegionScored("");
        }
    }, [regionToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const newRegion = {
            regionId: regionIdInput,
            regionName,
            regionScored: parseFloat(regionScored),
        };

        try {
            if (isEditing && regionId) {
                await axios.put(`${API_BASE_URL}/adrs/update/${regionId}`, newRegion, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Cập nhật khu vực ưu tiên thành công!");
            } else {
                await axios.post(`${API_BASE_URL}/adrs/add`, newRegion, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Thêm khu vực ưu tiên thành công!");
            }

            const response = await axios.get(`${API_BASE_URL}/adrs/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRegions(response.data);
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
                    {isEditing ? "Cập nhật" : "Thêm"} đối tượng ưu tiên
                </h2>

                {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã đối tượng</label>
                        <input
                            type="text"
                            value={regionIdInput}
                            onChange={(e) => setRegionIdInput(e.target.value)}
                            placeholder="Nhập mã đối tượng"
                            required
                            disabled={isEditing}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đối tượng</label>
                        <input
                            type="text"
                            value={regionName}
                            onChange={(e) => setRegionName(e.target.value)}
                            placeholder="Nhập tên đối tượng"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Điểm ưu tiên</label>
                        <input
                            type="number"
                            step="0.1"
                            value={regionScored}
                            onChange={(e) => setRegionScored(e.target.value)}
                            placeholder="Nhập điểm ưu tiên"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
                        >
                            <FaTimes /> Đóng
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                        >
                            {isEditing ? <FaCheck /> : <FaPlus />}
                            {isEditing ? "Cập nhật" : "Thêm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdmissionRegionFormModal;
