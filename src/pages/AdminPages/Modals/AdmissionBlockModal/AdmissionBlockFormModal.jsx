import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaPlus, FaIdCard, FaTag, FaBook, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdmissionBlockFormModal = ({ admissionBlockToEdit, setAdmissionBlocks, onClose, isEditing }) => {
    const [admissionBlockId, setAdmissionBlockId] = useState("");
    const [admissionBlockName, setAdmissionBlockName] = useState("");
    const [admissionBlockSubject1, setAdmissionBlockSubject1] = useState("");
    const [admissionBlockSubject2, setAdmissionBlockSubject2] = useState("");
    const [admissionBlockSubject3, setAdmissionBlockSubject3] = useState("");
    const [error, setError] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

    // Fetch subjects from API
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setIsLoadingSubjects(true);
                const response = await axios.get(`${API_BASE_URL}/subjects`);
                if (response.data.success) {
                    setSubjects(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching subjects:", error);
                toast.error("Không thể tải danh sách môn học", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } finally {
                setIsLoadingSubjects(false);
            }
        };

        fetchSubjects();
    }, []);

    useEffect(() => {
        if (admissionBlockToEdit) {
            setAdmissionBlockId(admissionBlockToEdit.admissionBlockId);
            setAdmissionBlockName(admissionBlockToEdit.admissionBlockName);
            setAdmissionBlockSubject1(admissionBlockToEdit.admissionBlockSubject1 || "");
            setAdmissionBlockSubject2(admissionBlockToEdit.admissionBlockSubject2 || "");
            setAdmissionBlockSubject3(admissionBlockToEdit.admissionBlockSubject3 || "");
        } else {
            setAdmissionBlockId("");
            setAdmissionBlockName("");
            setAdmissionBlockSubject1("");
            setAdmissionBlockSubject2("");
            setAdmissionBlockSubject3("");
        }
    }, [admissionBlockToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const newAdmissionBlock = {
            admissionBlockId,
            admissionBlockName,
            admissionBlockSubject1,
            admissionBlockSubject2,
            admissionBlockSubject3,
        };

        try {
            if (isEditing && admissionBlockToEdit) {
                await axios.put(`${API_BASE_URL}/adbs/update/${admissionBlockId}`, newAdmissionBlock, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Cập nhật khối xét tuyển thành công!");
            } else {
                await axios.post(`${API_BASE_URL}/adbs/add`, newAdmissionBlock, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Thêm khối xét tuyển thành công!");
            }

            const response = await axios.get(`${API_BASE_URL}/adbs/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAdmissionBlocks(response.data);
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    const getFilteredSubjects = (excludeSubjects = []) => {
        return subjects.filter(subject => !excludeSubjects.includes(subject.subject));
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        {isEditing ? (
                            <FaCheck className="w-8 h-8 text-blue-600" />
                        ) : (
                            <FaPlus className="w-8 h-8 text-blue-600" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {isEditing ? "Cập nhật khối xét tuyển" : "Thêm khối xét tuyển mới"}
                </h2>
                    <p className="text-gray-600 text-sm">
                        {isEditing 
                            ? "Chỉnh sửa thông tin khối xét tuyển hiện tại"
                            : "Điền thông tin để tạo khối xét tuyển mới"
                        }
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                        <div className="flex">
                            <FaTimes className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            Thông tin cơ bản
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaIdCard className="inline-block w-4 h-4 mr-2 text-gray-500" />
                                    Mã khối <span className="text-red-500">*</span>
                                </label>
                        <input
                            type="text"
                            value={admissionBlockId}
                            onChange={(e) => setAdmissionBlockId(e.target.value)}
                                    placeholder="Ví dụ: A00, A01, D01..."
                            required
                            disabled={isEditing}
                                    className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                        isEditing ? "bg-gray-100 text-gray-600 cursor-not-allowed" : "hover:border-gray-400"
                                    }`}
                        />
                                {isEditing && (
                                    <p className="mt-1 text-xs text-gray-500">Mã khối không thể thay đổi khi chỉnh sửa</p>
                                )}
                    </div>

                    <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaTag className="inline-block w-4 h-4 mr-2 text-gray-500" />
                                    Tên khối <span className="text-red-500">*</span>
                                </label>
                        <input
                            type="text"
                            value={admissionBlockName}
                            onChange={(e) => setAdmissionBlockName(e.target.value)}
                                    placeholder="Ví dụ: Khối A00 - Toán, Lý, Hóa"
                            required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                        />
                            </div>
                        </div>
                    </div>

                    {/* Subjects Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            <FaBook className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            Môn học trong khối
                        </h3>
                        
                        {isLoadingSubjects ? (
                            <div className="flex items-center justify-center py-8">
                                <FaSpinner className="animate-spin h-6 w-6 text-blue-500 mr-3" />
                                <span className="text-gray-600">Đang tải danh sách môn học...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Môn học 1 <span className="text-red-500">*</span>
                                    </label>
                        <select
                            value={admissionBlockSubject1}
                            onChange={(e) => setAdmissionBlockSubject1(e.target.value)}
                            required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                        >
                                        <option value="">-- Chọn môn 1 --</option>
                            {getFilteredSubjects([admissionBlockSubject2, admissionBlockSubject3]).map((subject) => (
                                <option key={subject.suId} value={subject.subject}>
                                    {subject.subject}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Môn học 2 <span className="text-red-500">*</span>
                                    </label>
                        <select
                            value={admissionBlockSubject2}
                            onChange={(e) => setAdmissionBlockSubject2(e.target.value)}
                            required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                        >
                                        <option value="">-- Chọn môn 2 --</option>
                            {getFilteredSubjects([admissionBlockSubject1, admissionBlockSubject3]).map((subject) => (
                                <option key={subject.suId} value={subject.subject}>
                                    {subject.subject}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Môn học 3 <span className="text-red-500">*</span>
                                    </label>
                        <select
                            value={admissionBlockSubject3}
                            onChange={(e) => setAdmissionBlockSubject3(e.target.value)}
                            required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                        >
                                        <option value="">-- Chọn môn 3 --</option>
                            {getFilteredSubjects([admissionBlockSubject1, admissionBlockSubject2]).map((subject) => (
                                <option key={subject.suId} value={subject.subject}>
                                    {subject.subject}
                                </option>
                            ))}
                        </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
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
                            disabled={isLoadingSubjects}
                            className="order-1 sm:order-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                            title={isEditing ? "Cập nhật thông tin khối xét tuyển" : "Thêm khối xét tuyển mới"}
                        >
                            {isLoadingSubjects ? (
                                <FaSpinner className="animate-spin w-4 h-4" />
                            ) : isEditing ? (
                                <FaCheck className="w-4 h-4" />
                            ) : (
                                <FaPlus className="w-4 h-4" />
                            )}
                            {isLoadingSubjects ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdmissionBlockFormModal;
