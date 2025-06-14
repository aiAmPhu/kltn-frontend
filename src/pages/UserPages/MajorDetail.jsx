import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

function MajorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: major, isLoading, error } = useQuery({
        queryKey: ['major', id],
        queryFn: async () => {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adms/getMajorByID/${id}`);
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const handleBack = () => {
        navigate("/major");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg">Đang tải thông tin ngành...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <div className="text-red-600 text-xl mb-4">Không thể tải thông tin ngành</div>
                <button
                    onClick={handleBack}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                    Quay lại danh sách ngành
                </button>
            </div>
        );
    }

    if (!major) {
        return (
            <div className="text-center py-10">
                <div className="text-gray-600 text-xl mb-4">Không tìm thấy thông tin ngành</div>
                <button
                    onClick={handleBack}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                    Quay lại danh sách ngành
                </button>
            </div>
        );
    }

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
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                        >
                            ← Quay lại danh sách ngành
                        </button>
                        <button
                            onClick={() => navigate('/wish', { state: { selectedMajor: major } })}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                        >
                            Đăng ký ngành này
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MajorDetail;
