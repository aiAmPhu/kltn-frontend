import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
function MajorDetail() {
    const { id } = useParams();
    const [major, setMajor] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchMajor = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adms/getMajorByID/${id}`);
                setMajor(res.data);
            } catch (err) {
                console.error("Không thể lấy thông tin ngành:", err);
            }
        };
        fetchMajor();
    }, [id]);
    if (!major) return <div className="text-center py-10">Đang tải thông tin ngành...</div>;
    const handleBack = () => {
        navigate("/major"); // Quay lại trang danh sách các ngành
    };
    // Xử lý tình trạng xét tuyển (isActive)
    const isActive = major ? major.isActive : false;
    return (
        <div className="max-w-screen-xl mx-auto px-4 py-8 mt-12">
            {major ? (
                <div className={`border rounded-lg shadow-lg p-6 ${isActive ? "bg-green-100" : "bg-gray-200"}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-semibold text-blue-700">{major.majorName}</h1>
                        <span
                            className={`py-1 px-4 rounded-full text-white font-semibold text-xs ${
                                isActive ? "bg-green-500" : "bg-gray-500"
                            }`}
                        >
                            {isActive ? "Đang xét tuyển" : "Không xét tuyển"}
                        </span>
                    </div>

                    <p className="text-gray-600 mb-4">{major.majorDescription}</p>

                    <div className="mb-6">
                        <p className="font-semibold text-blue-600">Mã ngành: {major.majorCodeName}</p>
                        <p className="font-medium text-blue-500 mt-2">Tổ hợp môn:</p>
                        <ul className="list-disc pl-5 text-sm text-gray-700">
                            {major.majorCombination.map((comb, idx) => (
                                <li key={idx}>{comb}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleBack}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-gray-500">Đang tải thông tin ngành...</p>
            )}
        </div>
    );
}

export default MajorDetail;
