import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaPlus } from "react-icons/fa";
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
                    {isEditing ? "Cập nhật" : "Thêm"} khối xét tuyển
                </h2>

                {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã khối</label>
                        <input
                            type="text"
                            value={admissionBlockId}
                            onChange={(e) => setAdmissionBlockId(e.target.value)}
                            placeholder="Nhập mã khối"
                            required
                            disabled={isEditing}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên khối</label>
                        <input
                            type="text"
                            value={admissionBlockName}
                            onChange={(e) => setAdmissionBlockName(e.target.value)}
                            placeholder="Nhập tên khối"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Môn học 1</label>
                        <select
                            value={admissionBlockSubject1}
                            onChange={(e) => setAdmissionBlockSubject1(e.target.value)}
                            required
                            disabled={isLoadingSubjects}
                            className={`w-full border border-gray-300 rounded-md px-3 py-2 ${
                                isLoadingSubjects ? "bg-gray-200 text-gray-600 cursor-not-allowed" : ""
                            }`}
                        >
                            <option value="">
                                {isLoadingSubjects ? "Đang tải..." : "Chọn môn học 1"}
                            </option>
                            {getFilteredSubjects([admissionBlockSubject2, admissionBlockSubject3]).map((subject) => (
                                <option key={subject.suId} value={subject.subject}>
                                    {subject.subject}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Môn học 2</label>
                        <select
                            value={admissionBlockSubject2}
                            onChange={(e) => setAdmissionBlockSubject2(e.target.value)}
                            required
                            disabled={isLoadingSubjects}
                            className={`w-full border border-gray-300 rounded-md px-3 py-2 ${
                                isLoadingSubjects ? "bg-gray-200 text-gray-600 cursor-not-allowed" : ""
                            }`}
                        >
                            <option value="">
                                {isLoadingSubjects ? "Đang tải..." : "Chọn môn học 2"}
                            </option>
                            {getFilteredSubjects([admissionBlockSubject1, admissionBlockSubject3]).map((subject) => (
                                <option key={subject.suId} value={subject.subject}>
                                    {subject.subject}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Môn học 3</label>
                        <select
                            value={admissionBlockSubject3}
                            onChange={(e) => setAdmissionBlockSubject3(e.target.value)}
                            required
                            disabled={isLoadingSubjects}
                            className={`w-full border border-gray-300 rounded-md px-3 py-2 ${
                                isLoadingSubjects ? "bg-gray-200 text-gray-600 cursor-not-allowed" : ""
                            }`}
                        >
                            <option value="">
                                {isLoadingSubjects ? "Đang tải..." : "Chọn môn học 3"}
                            </option>
                            {getFilteredSubjects([admissionBlockSubject1, admissionBlockSubject2]).map((subject) => (
                                <option key={subject.suId} value={subject.subject}>
                                    {subject.subject}
                                </option>
                            ))}
                        </select>
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
                            disabled={isLoadingSubjects}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isEditing ? <FaCheck /> : <FaPlus />}
                            {isLoadingSubjects ? "Đang tải..." : isEditing ? "Cập nhật" : "Thêm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdmissionBlockFormModal;
