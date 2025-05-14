import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

function AdmissionBlocks() {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlocks = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adbs/getall`);
                setBlocks(res.data);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu khối xét tuyển:", err);
                setError("Không thể tải dữ liệu khối xét tuyển.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlocks();
    }, []);

    if (loading)
        return (
            <div className="text-center py-10">
                <FaSpinner className="animate-spin text-3xl text-blue-500" />
                <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
            </div>
        );
    if (error)
        return (
            <div className="text-center text-red-500 py-10">
                <p>{error}</p>
            </div>
        );

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 mt-12">
            <h1 className="text-3xl font-bold mb-8 text-blue-700 border-l-8 border-blue-500 pl-4 bg-blue-50 py-2">
                Các Khối Xét Tuyển
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blocks.map((block) => (
                    <div
                        key={block.admissionBlockId}
                        className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                    >
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-xl font-semibold text-blue-700">
                                    {block.admissionBlockName}
                                </h2>
                                <span className="text-sm text-gray-500">{block.admissionBlockId}</span>
                            </div>
                            <ul className="text-sm text-gray-700 space-y-2">
                                <li>
                                    <span className="font-semibold text-blue-600">Môn 1:</span> {block.admissionBlockSubject1}
                                </li>
                                <li>
                                    <span className="font-semibold text-blue-600">Môn 2:</span> {block.admissionBlockSubject2}
                                </li>
                                <li>
                                    <span className="font-semibold text-blue-600">Môn 3:</span> {block.admissionBlockSubject3}
                                </li>
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdmissionBlocks;
