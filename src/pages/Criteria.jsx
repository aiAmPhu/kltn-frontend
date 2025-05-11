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

    if (loading) return <p className="text-center text-gray-500 py-10">Đang tải dữ liệu...</p>;
    if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 mt-12">
            <h1 className="text-2xl font-bold mb-6 text-blue-700">Các diện xét tuyển</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded shadow-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                            <th className="px-4 py-3 border-b">Mã diện</th>
                            <th className="px-4 py-3 border-b">Tên diện</th>
                            <th className="px-4 py-3 border-b">Mô tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        {criterias.map((item) => (
                            <tr key={item.criteriaId} className="hover:bg-gray-50 text-sm">
                                <td className="px-4 py-3 border-b">{item.criteriaId}</td>
                                <td className="px-4 py-3 border-b">{item.criteriaName}</td>
                                <td className="px-4 py-3 border-b">{item.criteriaDescription}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Criteria;
