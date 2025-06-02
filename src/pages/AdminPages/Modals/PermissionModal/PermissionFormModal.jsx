import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaListUl } from "react-icons/fa";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PermissionFormModal = ({ userId, userToEdit, setUsers, onClose, isEditing }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [admissionMajors, setAdmissionMajors] = useState([]);
    const [selectedMajors, setSelectedMajors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Ensure we always have the correct userId (from userToEdit if not passed)
    const effectiveUserId = userId || userToEdit?._id || userToEdit?.userId;

    useEffect(() => {
        const fetchAdmissionMajors = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE_URL}/adms/getall`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAdmissionMajors(response.data?.data || response.data || []);
            } catch (error) {
                setError("Không thể tải danh sách ngành học");
            }
        };
        fetchAdmissionMajors();

        if (userToEdit) {
            setName(userToEdit.name || "");
            setEmail(userToEdit.email || "");
            setSelectedMajors(userToEdit.majorGroup || []);
        } else {
            setName("");
            setEmail("");
            setSelectedMajors([]);
        }
    }, [userToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validate userId before making the request
        if (!effectiveUserId) {
            setError("Không xác định được người dùng để cập nhật phân quyền.");
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem("token");
        try {
            await axios.put(
                `${API_BASE_URL}/permissions/update/${effectiveUserId}`,
                { majorGroup: selectedMajors },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh user list
            const response = await axios.get(`${API_BASE_URL}/users/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data?.data || response.data || []);
            alert("Cập nhật phân quyền thành công!");
            onClose();
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Đã xảy ra lỗi, vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleMajorChange = (majorId) => {
        setSelectedMajors((prev) =>
            prev.includes(majorId) ? prev.filter((id) => id !== majorId) : [...prev, majorId]
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
                    <FaListUl className="inline mr-2 text-blue-500" />
                    Cập nhật phân quyền
                </h2>
                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={name}
                            disabled
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                            placeholder="Tên"
                        />
                        <input
                            type="text"
                            value={email}
                            disabled
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                            placeholder="Email"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium text-gray-700">
                            Chọn các ngành học được phân quyền:
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto border border-gray-300 rounded p-2 bg-gray-50">
                            {admissionMajors.length === 0 && (
                                <div className="col-span-full text-gray-400 italic text-center">
                                    Không có ngành học nào
                                </div>
                            )}
                            {admissionMajors.map((major) => (
                                <label
                                    key={major._id || major.majorId}
                                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        value={major.majorId}
                                        checked={selectedMajors.includes(major.majorId)}
                                        onChange={() => handleMajorChange(major.majorId)}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                    <span className="text-sm">{major.majorId}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between mt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2 ${
                                isLoading ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                        >
                            <FaCheck />
                            {isLoading ? "Đang lưu..." : "Cập nhật"}
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

export default PermissionFormModal;
