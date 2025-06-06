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
                console.log(res.data); // Kiểm tra dữ liệu trả về
                setMajor(res.data);
            } catch (err) {
                console.error("Không thể lấy thông tin ngành:", err);
            }
        };
        fetchMajor();
    }, [id]);

    const handleBack = () => {
        navigate("/major");
    };

    if (!major) {
        return <div className="text-center py-10 text-xl">Đang tải thông tin ngành...</div>;
    }

    const isActive = major?.isActive;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 mt-12">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
                <div className="relative mb-8">
                    <h1 className="text-4xl font-bold text-red-600 mt-2 text-center">{major.majorName}</h1>
                </div>

                {/* Mã ngành & tổ hợp môn */}
                <div className="mb-8">
                    <p className="font-semibold text-blue-600 text-xl mt-4 mb-2">Tổ hợp môn:</p>
                    <div className="flex flex-wrap gap-3">
                        {major.majorCombination.map((comb, idx) => (
                            <span
                                key={idx}
                                className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-medium"
                            >
                                {comb}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Mô tả ngành học */}
                <div className="mb-10">
                    <h2 className="text-blue-600 font-semibold text-xl mb-3">MÔ TẢ NGÀNH HỌC</h2>
                    <p
                        className="text-gray-700 text-base"
                        dangerouslySetInnerHTML={{
                            __html: major?.majorDescription || "Chưa có mô tả cho ngành này...",
                        }}
                    />
                </div>

                <div className="text-center">
                    <div className="text-right">
                        <button
                            onClick={handleBack}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                        >
                            ← Quay lại danh sách ngành
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MajorDetail;
