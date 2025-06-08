import React from "react";
import { FaTimes, FaBook, FaGraduationCap, FaClipboardList, FaInfoCircle } from "react-icons/fa";

const InfoModal = ({ admissionBlock, onClose }) => {
    if (!admissionBlock) return null;

    const subjects = [
        { subject: admissionBlock.admissionBlockSubject1, color: "bg-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { subject: admissionBlock.admissionBlockSubject2, color: "bg-green-500", bgColor: "bg-green-50", borderColor: "border-green-200" },
        { subject: admissionBlock.admissionBlockSubject3, color: "bg-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-200" }
    ].filter(item => item.subject);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <FaInfoCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Chi tiết khối xét tuyển
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Thông tin đầy đủ về khối xét tuyển và các môn học
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            <FaGraduationCap className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            Thông tin cơ bản
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FaGraduationCap className="text-blue-600 text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">Mã khối xét tuyển</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {admissionBlock.admissionBlockId}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FaBook className="text-green-600 text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">Tên khối xét tuyển</p>
                                        <p className="text-lg font-bold text-gray-900 break-words">
                                            {admissionBlock.admissionBlockName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subjects Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            <FaClipboardList className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            Môn học trong khối
                        </h3>
                        
                        {subjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {subjects.map((item, index) => (
                                    <div 
                                        key={index}
                                        className={`${item.bgColor} ${item.borderColor} border rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 ${item.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-gray-600 mb-1">Môn {index + 1}</p>
                                                <p className="text-sm font-semibold text-gray-800 break-words">
                                                    {item.subject}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaBook className="text-gray-400 text-xl" />
                                </div>
                                <p className="text-gray-500 text-sm">Không có môn học nào được thiết lập</p>
                            </div>
                        )}
                    </div>


                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
                        title="Đóng chi tiết khối xét tuyển"
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