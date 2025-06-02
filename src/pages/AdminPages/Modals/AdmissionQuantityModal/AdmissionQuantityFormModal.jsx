import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaGraduationCap, FaListAlt, FaChartBar } from "react-icons/fa";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdmissionQuantityFormModal = ({
    quantityId,
    quantityToEdit,
    setQuantities,
    onClose,
    isEditing,
    majors,
    criteria,
}) => {
    const [majorId, setMajorId] = useState("");
    const [criteriaId, setCriteriaId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [error, setError] = useState("");
    const [isMajorDropdownOpen, setIsMajorDropdownOpen] = useState(false);
    const [isCriteriaDropdownOpen, setIsCriteriaDropdownOpen] = useState(false);

    useEffect(() => {
        if (quantityToEdit) {
            setMajorId(quantityToEdit.majorId);
            setCriteriaId(quantityToEdit.criteriaId);
            setQuantity(quantityToEdit.quantity.toString());
        }
    }, [quantityToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const quantityData = {
            majorId,
            criteriaId,
            quantity: parseInt(quantity),
        };

        try {
            if (isEditing) {
                const updateData = {
                    oldMajorId: quantityToEdit.majorId,
                    oldCriteriaId: quantityToEdit.criteriaId,
                    newMajorId: majorId,
                    newCriteriaId: criteriaId,
                    quantity: parseInt(quantity),
                };

                await axios.put(`${API_BASE_URL}/adqs/update`, updateData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("Cập nhật chỉ tiêu thành công!");
            } else {
                await axios.post(`${API_BASE_URL}/adqs/add`, quantityData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("Thêm chỉ tiêu thành công!");
            }

            const response = await axios.get(`${API_BASE_URL}/adqs/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setQuantities(response.data);
            onClose();
        } catch (error) {
            if (error.response?.status === 409) {
                setError("Chỉ tiêu cho ngành và diện xét tuyển này đã tồn tại.");
            } else {
                setError(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
            }
            console.error("Error:", error.response || error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
                    {isEditing ? "Cập nhật" : "Thêm"} chỉ tiêu
                </h2>

                {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FaGraduationCap className="inline-block mr-2" />
                            Ngành
                        </label>
                        <select
                            value={majorId}
                            onChange={(e) => setMajorId(e.target.value)}
                            onClick={() => setIsMajorDropdownOpen(!isMajorDropdownOpen)}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none"
                        >
                            <option value="">Chọn ngành</option>
                            {majors.map((major) => (
                                <option key={major.majorId} value={major.majorId}>
                                    {major.majorName}
                                </option>
                            ))}
                        </select>
                        {isMajorDropdownOpen ? (
                            <ChevronUpIcon className="absolute right-2 top-8 w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDownIcon className="absolute right-2 top-8 w-5 h-5 text-gray-400" />
                        )}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FaListAlt className="inline-block mr-2" />
                            Diện xét tuyển
                        </label>
                        <select
                            value={criteriaId}
                            onChange={(e) => setCriteriaId(e.target.value)}
                            onClick={() => setIsCriteriaDropdownOpen(!isCriteriaDropdownOpen)}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none"
                        >
                            <option value="">Chọn diện xét tuyển</option>
                            {criteria.map((criterion) => (
                                <option key={criterion.criteriaId} value={criterion.criteriaId}>
                                    {criterion.criteriaName}
                                </option>
                            ))}
                        </select>
                        {isCriteriaDropdownOpen ? (
                            <ChevronUpIcon className="absolute right-2 top-8 w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDownIcon className="absolute right-2 top-8 w-5 h-5 text-gray-400" />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FaChartBar className="inline-block mr-2" />
                            Số lượng chỉ tiêu
                        </label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Nhập số lượng chỉ tiêu"
                            required
                            min="0"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
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

export default AdmissionQuantityFormModal;
