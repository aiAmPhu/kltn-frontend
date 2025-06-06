import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaPlus } from "react-icons/fa";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdmissionCriteriaFormModal = ({ criteriaToEdit, setCriterias, onClose, isEditing }) => {
    const [criteriaId, setCriteriaId] = useState("");
    const [criteriaName, setCriteriaName] = useState("");
    const [criteriaDescription, setCriteriaDescription] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (criteriaToEdit) {
            setCriteriaId(criteriaToEdit.criteriaId);
            setCriteriaName(criteriaToEdit.criteriaName);
            setCriteriaDescription(criteriaToEdit.criteriaDescription || "");
        } else {
            setCriteriaId("");
            setCriteriaName("");
            setCriteriaDescription("");
        }
    }, [criteriaToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const newCriteria = {
            criteriaId,
            criteriaName,
            criteriaDescription,
        };

        try {
            if (isEditing && criteriaToEdit) {
                await axios.put(`${API_BASE_URL}/adcs/update/${criteriaId}`, newCriteria, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Cập nhật thành công!");
            } else {
                await axios.post(`${API_BASE_URL}/adcs/add`, newCriteria, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Thêm diện xét tuyển thành công!");
            }

            const response = await axios.get(`${API_BASE_URL}/adcs/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCriterias(response.data);
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-blue-600 text-center sticky top-0 bg-white py-2 z-10 border-b">
                    {isEditing ? "Cập nhật" : "Thêm"} diện xét tuyển
                </h2>

                {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã diện</label>
                        <input
                            type="text"
                            value={criteriaId}
                            onChange={(e) => setCriteriaId(e.target.value)}
                            placeholder="Nhập mã diện"
                            required
                            disabled={isEditing}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên diện</label>
                        <input
                            type="text"
                            value={criteriaName}
                            onChange={(e) => setCriteriaName(e.target.value)}
                            placeholder="Nhập tên diện"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <div className="border border-gray-300 rounded-md">
                            <CKEditor
                                editor={ClassicEditor}
                                data={criteriaDescription}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    setCriteriaDescription(data);
                                }}
                                config={{
                                    toolbar: [
                                        "heading",
                                        "|",
                                        "bold",
                                        "italic",
                                        "link",
                                        "bulletedList",
                                        "numberedList",
                                        "|",
                                        "outdent",
                                        "indent",
                                        "|",
                                        "blockQuote",
                                        "insertTable",
                                        "undo",
                                        "redo",
                                    ],
                                    language: "vi",
                                    height: "300px",
                                }}
                            />
                        </div>
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

export default AdmissionCriteriaFormModal;
