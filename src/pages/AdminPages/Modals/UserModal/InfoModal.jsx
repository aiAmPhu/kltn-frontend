import React from "react";
import { FaTimes, FaUser, FaEnvelope, FaUserTag, FaImage } from "react-icons/fa";

const InfoModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
                <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Chi tiết người dùng</h2>
                <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2">
                        <FaUser className="text-blue-500" /> <span className="font-medium text-gray-700">Tên:</span>{" "}
                        {user.name}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaEnvelope className="text-blue-500" />{" "}
                        <span className="font-medium text-gray-700">Email:</span> {user.email}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaUserTag className="text-blue-500" />{" "}
                        <span className="font-medium text-gray-700">Vai trò:</span>{" "}
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold
                            ${
                                user.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : user.role === "reviewer"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                        >
                            {user.role}
                        </span>
                    </p>
                    {/* {user.pic && (
                        <div className="text-center mt-4">
                            <p className="font-medium text-gray-700 flex items-center justify-center gap-2">
                                <FaImage className="text-blue-500" /> Ảnh đại diện:
                            </p>
                            <img src={user.pic} alt="Avatar" className="rounded-lg mt-2 mx-auto w-40 h-40 object-cover shadow-md" />
                        </div>
                    )} */}
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
