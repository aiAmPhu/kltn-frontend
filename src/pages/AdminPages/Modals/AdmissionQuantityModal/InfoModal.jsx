import React from "react";
import { FaTimes, FaGraduationCap, FaListAlt, FaChartBar, FaInfoCircle, FaClipboardList } from "react-icons/fa";

const InfoModal = ({ quantity, onClose, majors, criteria }) => {
    if (!quantity) return null;

    const major = majors.find(m => m.majorId === quantity.majorId);
    const criterion = criteria.find(c => c.criteriaId === quantity.criteriaId);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header - Fixed */}
                <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                            <FaInfoCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Chi tiết chỉ tiêu tuyển sinh
                        </h2>
                    </div>
                </div>

                <div className="my-6"></div>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            <FaClipboardList className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            Thông tin chỉ tiêu
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FaGraduationCap className="text-blue-600 text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">Ngành đào tạo</p>
                                        <p className="text-lg font-bold text-blue-900 break-words">
                                            {major?.majorName || 'Không xác định'}
                                        </p>
                                        {major?.majorId && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Mã ngành: {major.majorId}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FaListAlt className="text-green-600 text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">Diện xét tuyển</p>
                                        <p className="text-lg font-bold text-green-900 break-words">
                                            {criterion?.criteriaName || 'Không xác định'}
                                        </p>
                                        {criterion?.criteriaId && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Mã diện: {criterion.criteriaId}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <FaChartBar className="text-orange-600 text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">Số lượng chỉ tiêu</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-orange-900">
                                                {quantity.quantity}
                                            </span>
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                                                sinh viên
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            Tóm tắt thông tin
                        </h3>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-gray-700 text-sm leading-relaxed">
                                Chỉ tiêu tuyển sinh cho ngành{" "}
                                <span className="font-semibold text-blue-800">
                                    {major?.majorName || 'không xác định'}
                                </span>{" "}
                                theo diện{" "}
                                <span className="font-semibold text-green-800">
                                    {criterion?.criteriaName || 'không xác định'}
                                </span>{" "}
                                là{" "}
                                <span className="font-bold text-orange-800 text-lg">
                                    {quantity.quantity} sinh viên
                                </span>
                                .
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Fixed */}
                <div className="sticky bottom-0 bg-white z-10 flex justify-end pt-6 border-t border-gray-200 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
                        title="Đóng chi tiết chỉ tiêu tuyển sinh"
                    >
                        <FaTimes className="w-4 h-4" /> 
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal; 