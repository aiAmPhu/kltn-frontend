import React from "react";
import { FaTimes, FaGraduationCap, FaListAlt, FaChartBar } from "react-icons/fa";

const InfoModal = ({ quantity, onClose, majors, criteria }) => {
    if (!quantity) return null;

    const major = majors.find(m => m.majorId === quantity.majorId);
    const criterion = criteria.find(c => c.criteriaId === quantity.criteriaId);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Chi tiết chỉ tiêu</h2>
                <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2">
                        <FaGraduationCap className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Ngành:</span> {major?.majorName || 'N/A'}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaListAlt className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Diện xét tuyển:</span> {criterion?.criteriaName || 'N/A'}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaChartBar className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Số lượng chỉ tiêu:</span> {quantity.quantity}
                    </p>
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