import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaPlus, FaIdCard, FaTag, FaStar, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdmissionRegionFormModal = ({ regionId, regionToEdit, setRegions, onClose, isEditing }) => {
    const [regionIdInput, setRegionIdInput] = useState("");
    const [regionName, setRegionName] = useState("");
    const [regionScored, setRegionScored] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsSubmitting(true);
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
            const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
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
                            {isEditing ? "Cập nhật khu vực ưu tiên" : "Thêm khu vực ưu tiên mới"}
                        </h2>
                    </div>
                </div>

                <div className="my-6"></div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

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
                                    Mã khu vực <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={regionIdInput}
                                    onChange={(e) => setRegionIdInput(e.target.value)}
                                    placeholder="Ví dụ: KV1, KV2..."
                                    required
                                    disabled={isEditing}
                                    className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                        isEditing ? "bg-gray-100 text-gray-600 cursor-not-allowed" : "hover:border-gray-400"
                                    }`}
                                />
                                {isEditing && (
                                    <p className="mt-1 text-xs text-gray-500">Mã khu vực không thể thay đổi khi chỉnh sửa</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaTag className="inline-block w-4 h-4 mr-2 text-gray-500" />
                                    Tên khu vực <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={regionName}
                                    onChange={(e) => setRegionName(e.target.value)}
                                    placeholder="Ví dụ: Khu vực 1, Khu vực 2, ..."
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaStar className="inline-block w-4 h-4 mr-2 text-gray-500" />
                                    Điểm ưu tiên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    max="10"
                                    value={regionScored}
                                    onChange={(e) => setRegionScored(e.target.value)}
                                    placeholder="Ví dụ: 2.0, 1.5, 1.0..."
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Nhập điểm ưu tiên cho khu vực này (từ 0 đến 10 điểm, bước nhảy 0.25)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Fixed */}
                    <div className="sticky bottom-0 bg-white z-10 flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="order-2 sm:order-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Đóng modal và hủy thao tác"
                        >
                            <FaTimes className="w-4 h-4" /> 
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="order-1 sm:order-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isEditing ? "Cập nhật khu vực ưu tiên" : "Thêm khu vực ưu tiên mới"}
                        >
                            {isSubmitting ? (
                                <FaSpinner className="w-4 h-4 animate-spin" />
                            ) : isEditing ? (
                                <FaCheck className="w-4 h-4" />
                            ) : (
                                <FaPlus className="w-4 h-4" />
                            )}
                            {isSubmitting ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdmissionRegionFormModal;
