import React from "react";
import { FaTimes, FaUser, FaEnvelope, FaUserTag, FaListUl } from "react-icons/fa";

const InfoPermissionModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Chi tiết phân quyền</h2>
                <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2">
                        <FaUser className="text-blue-500" /> <span className="font-medium text-gray-700">Tên:</span> {user.name}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaEnvelope className="text-blue-500" /> <span className="font-medium text-gray-700">Email:</span> {user.email}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaUserTag className="text-blue-500" /> <span className="font-medium text-gray-700">Vai trò:</span>{" "}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold 
                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'reviewer' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'}`}>
                            {user.role}
                        </span>
                    </p>
                    <div className="mt-4">
                        <p className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                            <FaListUl className="text-blue-500" /> Các ngành học:
                        </p>
                        {Array.isArray(user.majorGroup) && user.majorGroup.length > 0 ? (
                            <table className="table-auto border-collapse border border-gray-500 w-full">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-500 px-4 py-2" colSpan={4}>
                                            Danh sách ngành học
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.majorGroup
                                        .reduce((rows, major, index) => {
                                            if (index % 4 === 0) rows.push([]);
                                            rows[rows.length - 1].push(major);
                                            return rows;
                                        }, [])
                                        .map((row, rowIndex) => (
                                            <tr key={rowIndex} className="hover:bg-gray-100">
                                                {row.map((major, colIndex) => (
                                                    <td
                                                        key={colIndex}
                                                        className="border border-gray-500 px-4 py-2 text-center"
                                                    >
                                                        {major}
                                                    </td>
                                                ))}
                                                {row.length < 4 &&
                                                    Array.from({ length: 4 - row.length }).map((_, emptyIndex) => (
                                                        <td
                                                            key={`empty-${rowIndex}-${emptyIndex}`}
                                                            className="border border-gray-500 px-4 py-2"
                                                        ></td>
                                                    ))}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 italic">Không có chuyên ngành có sẵn</p>
                        )}
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

export default InfoPermissionModal;