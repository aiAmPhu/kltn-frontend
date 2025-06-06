import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ObjectFormModal = ({ objectId, objectToEdit, setObjects, onClose, isEditing }) => {
    const [objectData, setObjectData] = useState({
        objectId: "",
        objectName: "",
        objectScored: "",
        objectDescription: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (objectToEdit) {
            setObjectData({
                objectId: objectToEdit.objectId,
                objectName: objectToEdit.objectName,
                objectScored: objectToEdit.objectScored,
                objectDescription: objectToEdit.objectDescription,
            });
        }
    }, [objectToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            if (isEditing && objectId) {
                await axios.put(`${API_BASE_URL}/ados/update/${objectId}`, objectData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Cập nhật đối tượng ưu tiên thành công!");
            } else {
                await axios.post(`${API_BASE_URL}/ados/add`, objectData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Thêm đối tượng ưu tiên thành công!");
            }

            const response = await axios.get(`${API_BASE_URL}/ados/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setObjects(response.data);
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setObjectData((prev) => ({
            ...prev,
            [name]: name === "objectScored" ? parseFloat(value) || value : value,
        }));
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
                    {isEditing ? "Cập nhật" : "Thêm"} đối tượng ưu tiên
                </h2>

                {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã đối tượng</label>
                        <input
                            type="text"
                            name="objectId"
                            value={objectData.objectId}
                            onChange={handleChange}
                            placeholder="Nhập mã đối tượng"
                            required
                            disabled={isEditing}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đối tượng</label>
                        <input
                            type="text"
                            name="objectName"
                            value={objectData.objectName}
                            onChange={handleChange}
                            placeholder="Nhập tên đối tượng"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Điểm ưu tiên</label>
                        <input
                            type="number"
                            name="objectScored"
                            value={objectData.objectScored}
                            onChange={handleChange}
                            placeholder="Nhập điểm ưu tiên"
                            required
                            step="0.25"
                            min="0"
                            max="10"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                            name="objectDescription"
                            value={objectData.objectDescription}
                            onChange={handleChange}
                            placeholder="Nhập mô tả"
                            required
                            rows={4}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                            <FaCheck />
                            {isEditing ? "Cập nhật" : "Thêm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ObjectFormModal;
