import React from "react";
import { FaPlus, FaTimes, FaCalendarAlt, FaTag, FaFileAlt, FaCheck } from "react-icons/fa";

const CreateYearModal = ({ show, onClose, formData, setFormData, onSubmit }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header - Fixed */}
                <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                            <FaPlus className="w-6 h-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Tạo năm tuyển sinh mới
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Tạo năm tuyển sinh mới cho hệ thống
                        </p>
                    </div>
                </div>

                <div className="my-6"></div>

                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            Thông tin cơ bản
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaCalendarAlt className="inline-block w-4 h-4 mr-2 text-gray-500" />
                                    Mã năm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.yearId}
                                    onChange={(e) => setFormData({ ...formData, yearId: e.target.value })}
                                    placeholder="Ví dụ: 2024"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Mã định danh duy nhất cho năm tuyển sinh
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaTag className="inline-block w-4 h-4 mr-2 text-gray-500" />
                                    Tên năm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.yearName}
                                    onChange={(e) => setFormData({ ...formData, yearName: e.target.value })}
                                    placeholder="Ví dụ: Năm tuyển sinh 2024"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Tên hiển thị của năm tuyển sinh
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Time Period */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            <FaCalendarAlt className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            Thời gian hoạt động
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày bắt đầu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Ngày bắt đầu tuyển sinh
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày kết thúc <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                    min={formData.startDate}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Ngày kết thúc tuyển sinh
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            <FaFileAlt className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            Thông tin bổ sung
                        </h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả năm tuyển sinh
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="4"
                                placeholder="Mô tả chi tiết về năm tuyển sinh này..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 resize-none"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Mô tả chi tiết về mục tiêu và đặc điểm của năm tuyển sinh này
                            </p>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <FaCheck className="w-4 h-4" />
                            Tóm tắt thông tin
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span className="font-medium">Mã năm:</span>
                                <span className="text-blue-600">{formData.yearId || "Chưa nhập"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Tên năm:</span>
                                <span className="text-blue-600">{formData.yearName || "Chưa nhập"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Thời gian:</span>
                                <span className="text-blue-600">
                                    {formData.startDate && formData.endDate 
                                        ? `${formData.startDate} - ${formData.endDate}`
                                        : "Chưa nhập"
                                    }
                                </span>
                            </div>
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
                            className="order-1 sm:order-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
                            title="Tạo năm tuyển sinh mới"
                        >
                            <FaPlus className="w-4 h-4" />
                            Tạo năm mới
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateYearModal;
