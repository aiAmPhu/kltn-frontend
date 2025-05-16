import React from "react";
import { FaTimes, FaIdCard, FaInfoCircle, FaList, FaToggleOn } from "react-icons/fa";

const InfoModal = ({ major, onClose }) => {
    if (!major) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Chi tiết ngành xét tuyển</h2>
                <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2">
                        <FaIdCard className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Mã ngành:</span> {major.majorId}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaIdCard className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Mã ngành:</span> {major.majorCodeName}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaInfoCircle className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Tên ngành:</span> {major.majorName}
                    </p>
                    <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FaList className="text-blue-500" /> Tổ hợp xét tuyển:
                        </p>
                        <div className="bg-gray-50 p-3 rounded">
                            {major.majorCombination ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {major.majorCombination.map((combo, index) => (
                                        <li key={index} className="text-gray-600">{combo}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">Không có tổ hợp xét tuyển</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-2">Mô tả:</p>
                        <p className="bg-gray-50 p-3 rounded text-gray-600">
                            {major.majorDescription || "Không có mô tả"}
                        </p>
                    </div>
                    <p className="flex items-center gap-2">
                        <FaToggleOn className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Trạng thái:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            major.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {major.isActive ? 'Đang hoạt động' : 'Đã ẩn'}
                        </span>
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