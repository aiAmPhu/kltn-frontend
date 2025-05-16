import React from "react";
import { FaTimes, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const InfoModal = ({ year, onClose }) => {
    if (!year) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Chi tiết năm tuyển sinh</h2>
                <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Mã năm:</span> {year.yearId}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Tên năm:</span> {year.yearName}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaClock className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Ngày bắt đầu:</span> {formatDate(year.startDate)}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaClock className="text-blue-500" /> 
                        <span className="font-medium text-gray-700">Ngày kết thúc:</span> {formatDate(year.endDate)}
                    </p>
                    <p className="flex items-center gap-2">
                        {year.status === 'active' ? (
                            <FaCheckCircle className="text-green-500" />
                        ) : (
                            <FaTimesCircle className="text-red-500" />
                        )}
                        <span className="font-medium text-gray-700">Trạng thái:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold 
                            ${year.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {year.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
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