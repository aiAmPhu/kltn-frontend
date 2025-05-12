import React, { useEffect, useState } from "react";
import axios from "axios";

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

    if (loading) return <p className="text-center text-gray-500 py-10">Đang tải dữ liệu...</p>;
    if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 mt-12">
            <h1 className="text-2xl font-bold mb-6 text-purple-700">Các khối xét tuyển</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blocks.map((block) => (
                    <div
                        key={block.admissionBlockId}
                        className="bg-white shadow-md rounded-lg p-5 border border-gray-200 hover:shadow-lg transition"
                    >
                        <h2 className="text-lg font-semibold text-gray-800 mb-1">
                            {block.admissionBlockId} - {block.admissionBlockName}
                        </h2>
                        <ul className="text-sm text-gray-600 list-disc ml-4">
                            <li>{block.admissionBlockSubject1}</li>
                            <li>{block.admissionBlockSubject2}</li>
                            <li>{block.admissionBlockSubject3}</li>
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdmissionBlocks;
