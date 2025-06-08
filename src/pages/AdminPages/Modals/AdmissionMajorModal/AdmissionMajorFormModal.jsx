import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaPlus, FaIdCard, FaTag, FaFileAlt, FaLayerGroup, FaSpinner } from "react-icons/fa";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdmissionMajorFormModal = ({ majorToEdit, setMajors, onClose, isEditing }) => {
    const [majorId, setMajorId] = useState("");
    const [majorName, setMajorName] = useState("");
    const [majorCombination, setMajorCombination] = useState([]);
    const [majorDescription, setMajorDescription] = useState("");
    const [error, setError] = useState("");
    const [admissionBlocks, setAdmissionBlocks] = useState([]);
    const [selectedBlock, setSelectedBlock] = useState("");

    useEffect(() => {
        const fetchAdmissionBlocks = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE_URL}/adms/blocks`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAdmissionBlocks(response.data);
            } catch (error) {
                setError("Lỗi khi tải danh sách khối xét tuyển");
                toast.error("Lỗi khi tải danh sách khối xét tuyển");
            }
        };

        fetchAdmissionBlocks();
    }, []);

    useEffect(() => {
        if (majorToEdit) {
            setMajorId(majorToEdit.majorId);
            setMajorName(majorToEdit.majorName);
            setMajorCombination(majorToEdit.majorCombination || []);
            setMajorDescription(majorToEdit.majorDescription || "");
        } else {
            setMajorId("");
            setMajorName("");
            setMajorCombination([]);
            setMajorDescription("");
        }
    }, [majorToEdit]);

    const handleAddCombination = () => {
        if (selectedBlock && !majorCombination.includes(selectedBlock)) {
            setMajorCombination([...majorCombination, selectedBlock]);
            setSelectedBlock("");
        }
    };

    const handleRemoveCombination = (index) => {
        setMajorCombination(majorCombination.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const newMajor = {
            majorId,
            majorName,
            majorCombination,
            majorDescription,
        };

        try {
            if (isEditing && majorToEdit) {
                await axios.put(`${API_BASE_URL}/adms/update/${majorId}`, newMajor, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Cập nhật ngành xét tuyển thành công!");
            } else {
                await axios.post(`${API_BASE_URL}/adms/add`, newMajor, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Thêm ngành xét tuyển thành công!");
            }

            const response = await axios.get(`${API_BASE_URL}/adms/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMajors(response.data);
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
                            {isEditing ? "Cập nhật ngành xét tuyển" : "Thêm ngành xét tuyển mới"}
                        </h2>
                    </div>
                </div>

                <div className="my-6"></div>

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
                                    Mã ngành <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={majorId}
                                    onChange={(e) => setMajorId(e.target.value)}
                                    placeholder="Ví dụ: 7140231V, 7140231A, 7140246V, 7140246A, ..."
                                    required
                                    disabled={isEditing}
                                    className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                        isEditing ? "bg-gray-100 text-gray-600 cursor-not-allowed" : "hover:border-gray-400"
                                    }`}
                                />
                                {isEditing && (
                                    <p className="mt-1 text-xs text-gray-500">Mã ngành không thể thay đổi khi chỉnh sửa</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaTag className="inline-block w-4 h-4 mr-2 text-gray-500" />
                                    Tên ngành <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={majorName}
                                    onChange={(e) => setMajorName(e.target.value)}
                                    placeholder="Ví dụ: Sư phạm tiếng Anh (đào tạo bằng tiếng Việt), ..."
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Admission Combinations Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            <FaLayerGroup className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            Tổ hợp xét tuyển
                        </h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thêm tổ hợp xét tuyển
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedBlock}
                                    onChange={(e) => setSelectedBlock(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                >
                                    <option value="">Chọn khối xét tuyển</option>
                                    {admissionBlocks.map((block) => (
                                        <option key={block.admissionBlockId} value={block.admissionBlockId}>
                                            {block.admissionBlockName} ({block.admissionBlockSubject1},{" "}
                                            {block.admissionBlockSubject2}, {block.admissionBlockSubject3})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddCombination}
                                    className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
                                    title="Thêm tổ hợp xét tuyển"
                                >
                                    <FaPlus className="w-4 h-4" />
                                    Thêm
                                </button>
                            </div>
                            
                            {majorCombination.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        Danh sách tổ hợp đã chọn ({majorCombination.length})
                                    </p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                        {majorCombination.map((combo, index) => {
                                            const block = admissionBlocks.find((b) => b.admissionBlockId === combo);
                                            return (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                                    <span className="text-sm text-gray-800">
                                                        {block
                                                            ? `${block.admissionBlockName} (${block.admissionBlockSubject1}, ${block.admissionBlockSubject2}, ${block.admissionBlockSubject3})`
                                                            : combo}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCombination(index)}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-100 transition-colors"
                                                        title="Xóa tổ hợp này"
                                                    >
                                                        <FaTimes className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
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
                                Mô tả ngành xét tuyển
                            </label>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={majorDescription}
                                    onChange={(event, editor) => {
                                        const data = editor.getData();
                                        setMajorDescription(data);
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
                                Mô tả chi tiết về ngành xét tuyển, cơ hội nghề nghiệp và yêu cầu đầu vào
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
                            title={isEditing ? "Cập nhật thông tin ngành xét tuyển" : "Thêm ngành xét tuyển mới"}
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

export default AdmissionMajorFormModal;
