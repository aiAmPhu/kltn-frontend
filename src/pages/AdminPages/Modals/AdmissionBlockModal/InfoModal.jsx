import React from "react";
import { FaTimes, FaBook, FaGraduationCap, FaClipboardList } from "react-icons/fa";

const InfoModal = ({ admissionBlock, onClose }) => {
    if (!admissionBlock) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
            <div className="bg-white w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-2xl shadow-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 sm:mb-6 pb-3 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                        Chi tiết khối xét tuyển
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        title="Đóng"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Thông tin cơ bản */}
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <FaGraduationCap className="text-blue-500 text-lg mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Mã khối:</span>
                                <span className="text-base font-semibold text-gray-900 break-words">
                                    {admissionBlock.admissionBlockId}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FaBook className="text-blue-500 text-lg mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Tên khối:</span>
                                <span className="text-base font-semibold text-gray-900 break-words">
                                    {admissionBlock.admissionBlockName}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách môn học */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <FaClipboardList className="text-gray-600 text-lg" />
                            <span className="font-semibold text-gray-800">Các môn học</span>
                        </div>
                        
                        <div className="space-y-3">
                            {admissionBlock.admissionBlockSubject1 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-3 transition-colors hover:bg-blue-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                            1
                                        </div>
                                        <span className="text-gray-800 font-medium break-words">
                                            {admissionBlock.admissionBlockSubject1}
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            {admissionBlock.admissionBlockSubject2 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-3 transition-colors hover:bg-blue-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                            2
                                        </div>
                                        <span className="text-gray-800 font-medium break-words">
                                            {admissionBlock.admissionBlockSubject2}
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            {admissionBlock.admissionBlockSubject3 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-3 transition-colors hover:bg-blue-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                            3
                                        </div>
                                        <span className="text-gray-800 font-medium break-words">
                                            {admissionBlock.admissionBlockSubject3}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                        <FaTimes className="text-sm" /> 
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal; 