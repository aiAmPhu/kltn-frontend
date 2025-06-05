import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaPlus } from "react-icons/fa";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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
                alert("Cập nhật ngành thành công!");
            } else {
                await axios.post(`${API_BASE_URL}/adms/add`, newMajor, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("Thêm ngành thành công!");
            }

            const response = await axios.get(`${API_BASE_URL}/adms/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMajors(response.data);
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-blue-600 text-center sticky top-0 bg-white py-2 z-10 border-b">
                    {isEditing ? "Cập nhật" : "Thêm"} ngành xét tuyển
                </h2>

                {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã ngành</label>
                        <input
                            type="text"
                            value={majorId}
                            onChange={(e) => setMajorId(e.target.value)}
                            placeholder="Nhập mã ngành"
                            required
                            disabled={isEditing}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên ngành</label>
                        <input
                            type="text"
                            value={majorName}
                            onChange={(e) => setMajorName(e.target.value)}
                            placeholder="Nhập tên ngành"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tổ hợp xét tuyển</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedBlock}
                                onChange={(e) => setSelectedBlock(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
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
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Thêm
                            </button>
                        </div>
                        {majorCombination.length > 0 && (
                            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                {majorCombination.map((combo, index) => {
                                    const block = admissionBlocks.find((b) => b.admissionBlockId === combo);
                                    return (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="flex-1 bg-gray-50 p-2 rounded">
                                                {block
                                                    ? `${block.admissionBlockName} (${block.admissionBlockSubject1}, ${block.admissionBlockSubject2}, ${block.admissionBlockSubject3})`
                                                    : combo}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCombination(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <div className="border border-gray-300 rounded-md">
                            <CKEditor
                                editor={ClassicEditor}
                                data={majorDescription}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    setMajorDescription(data);
                                }}
                                config={{
                                    toolbar: [
                                        'heading',
                                        '|',
                                        'bold',
                                        'italic',
                                        'link',
                                        'bulletedList',
                                        'numberedList',
                                        '|',
                                        'outdent',
                                        'indent',
                                        '|',
                                        'blockQuote',
                                        'insertTable',
                                        'undo',
                                        'redo'
                                    ],
                                    language: 'vi',
                                    height: '300px'
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between mt-6">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                        >
                            {isEditing ? <FaCheck /> : <FaPlus />}
                            {isEditing ? "Cập nhật" : "Thêm"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
                        >
                            <FaTimes /> Đóng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdmissionMajorFormModal;
