import React from "react";
import { FaTimes, FaBook, FaGraduationCap } from "react-icons/fa";

const InfoModal = ({ admissionBlock, onClose }) => {
    if (!admissionBlock) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Chi tiết khối xét tuyển</h2>
                <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2">
                        <FaGraduationCap className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Mã khối:</span> {admissionBlock.admissionBlockId}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaBook className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Tên khối:</span> {admissionBlock.admissionBlockName}
                    </p>
                    <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-2">Các môn học:</p>
                        <div className="space-y-2">
                            {admissionBlock.admissionBlockSubject1 && (
                                <p className="bg-gray-50 p-2 rounded">Môn 1: {admissionBlock.admissionBlockSubject1}</p>
                            )}
                            {admissionBlock.admissionBlockSubject2 && (
                                <p className="bg-gray-50 p-2 rounded">Môn 2: {admissionBlock.admissionBlockSubject2}</p>
                            )}
                            {admissionBlock.admissionBlockSubject3 && (
                                <p className="bg-gray-50 p-2 rounded">Môn 3: {admissionBlock.admissionBlockSubject3}</p>
                            )}
                        </div>
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