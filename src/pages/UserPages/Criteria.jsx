import { useEffect, useState } from "react";
import axios from "axios";

function Criteria() {
    const [criterias, setCriterias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCriterias = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adcs/getAll`);
                setCriterias(res.data);
            } catch (err) {
                console.error("Lỗi khi lấy diện xét tuyển:", err);
                setError("Không thể tải dữ liệu diện xét tuyển.");
            } finally {
                setLoading(false);
            }
        };
        fetchCriterias();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500 py-10">Đang tải dữ liệu...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500 py-10">{error}</p>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 mt-12">
            <h1 className="text-3xl font-bold mb-8 text-blue-700 border-l-8 border-blue-500 pl-4 bg-blue-50 py-2">
                CÁC DIỆN XÉT TUYỂN
            </h1>

            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-md">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                            <th className="px-4 py-3 border-b w-1/6">Mã diện</th>
                            <th className="px-4 py-3 border-b w-1/3">Tên diện</th>
                            <th className="px-4 py-3 border-b w-1/2">Mô tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        {criterias.map((item) => (
                            <tr key={item.criteriaId} className="hover:bg-gray-50 text-sm">
                                <td className="px-4 py-3 border-b">{item.criteriaId}</td>
                                <td className="px-4 py-3 border-b font-medium text-blue-700">{item.criteriaName}</td>
                                <td className="px-4 py-3 border-b text-gray-700 whitespace-pre-line text-sm">
                                    {item.criteriaDescription || (
                                        <span className="italic text-gray-400">Chưa có mô tả.</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Criteria;
