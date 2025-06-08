import React from "react";
import { FaTimes, FaIdCard, FaTag, FaFileAlt, FaInfoCircle, FaClipboardList} from "react-icons/fa";

const InfoModal = ({ criteria, onClose }) => {
    if (!criteria) return null;

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
                            Chi tiết diện xét tuyển
                        </h2>
                    </div>
                </div>

                <div className="my-6"></div>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            <FaClipboardList className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            Thông tin cơ bản
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FaIdCard className="text-blue-600 text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">Mã diện xét tuyển</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {criteria.criteriaId}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FaTag className="text-green-600 text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">Tên diện xét tuyển</p>
                                        <p className="text-lg font-bold text-gray-900 break-words">
                                            {criteria.criteriaName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            <FaFileAlt className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            Mô tả chi tiết
                        </h3>
                        
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div 
                                className="text-gray-700 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: criteria.criteriaDescription || "Không có mô tả" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Fixed */}
                <div className="sticky bottom-0 bg-white z-10 flex justify-end pt-6 border-t border-gray-200 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
                        title="Đóng chi tiết diện xét tuyển"
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