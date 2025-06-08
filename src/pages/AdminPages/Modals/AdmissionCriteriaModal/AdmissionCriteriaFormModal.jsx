import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaPlus, FaIdCard, FaTag, FaFileAlt, FaSpinner } from "react-icons/fa";
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
                toast.success("Cập nhật diện xét tuyển thành công!");
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
            const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header - Fixed */}
                <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                            {isEditing ? (
                                <FaCheck className="w-6 h-6 text-blue-600" />
                            ) : (
                                <FaPlus className="w-6 h-6 text-blue-600" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {isEditing ? "Cập nhật diện xét tuyển" : "Thêm diện xét tuyển mới"}
                </h2>
                    </div>
                </div>



                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            Thông tin cơ bản
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-4">
                    <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaIdCard className="inline-block w-4 h-4 mr-2 text-gray-500" />
                                    Mã diện <span className="text-red-500">*</span>
                                </label>
                        <input
                            type="text"
                            value={criteriaId}
                            onChange={(e) => setCriteriaId(e.target.value)}
                                    placeholder="Ví dụ: D1, D2, D3..."
                            required
                            disabled={isEditing}
                                    className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                        isEditing ? "bg-gray-100 text-gray-600 cursor-not-allowed" : "hover:border-gray-400"
                                    }`}
                        />
                                {isEditing && (
                                    <p className="mt-1 text-xs text-gray-500">Mã diện không thể thay đổi khi chỉnh sửa</p>
                                )}
                    </div>

                    <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaTag className="inline-block w-4 h-4 mr-2 text-gray-500" />
                                    Tên diện <span className="text-red-500">*</span>
                                </label>
                        <input
                            type="text"
                            value={criteriaName}
                            onChange={(e) => setCriteriaName(e.target.value)}
                                    placeholder="Ví dụ: Ưu tiên xét tuyển HSG, top 200,..."
                            required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                        />
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            <FaFileAlt className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            Mô tả chi tiết
                        </h3>

                    <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả diện xét tuyển
                            </label>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
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
                            <p className="mt-1 text-xs text-gray-500">
                                Mô tả chi tiết về điều kiện và yêu cầu của diện xét tuyển này
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons - Fixed */}
                    <div className="sticky bottom-0 bg-white z-10 flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="order-2 sm:order-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
                            title="Đóng modal và hủy thao tác"
                        >
                            <FaTimes className="w-4 h-4" /> 
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="order-1 sm:order-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
                            title={isEditing ? "Cập nhật thông tin diện xét tuyển" : "Thêm diện xét tuyển mới"}
                        >
                            {isEditing ? (
                                <FaCheck className="w-4 h-4" />
                            ) : (
                                <FaPlus className="w-4 h-4" />
                            )}
                            {isEditing ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdmissionCriteriaFormModal;
