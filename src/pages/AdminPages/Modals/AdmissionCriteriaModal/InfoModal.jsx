import React from "react";
import { FaTimes, FaIdCard, FaInfoCircle } from "react-icons/fa";

const InfoModal = ({ criteria, onClose }) => {
    if (!criteria) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Chi tiết diện xét tuyển</h2>
                <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2">
                        <FaIdCard className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Mã diện:</span> {criteria.criteriaId}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaInfoCircle className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Tên diện:</span> {criteria.criteriaName}
                    </p>
                    <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-2">Mô tả:</p>
                        <p className="bg-gray-50 p-3 rounded text-gray-600">
                            {criteria.criteriaDescription || "Không có mô tả"}
                        </p>
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="inline-flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                    >
                        <FaTimes /> Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal; 