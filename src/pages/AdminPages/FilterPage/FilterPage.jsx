import React, { useState, useEffect } from "react";
import axios from "axios";

const FilterPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");
    const [filtering, setFiltering] = useState(false);

    // Thêm state cho snapshot
    const [snapshotOption, setSnapshotOption] = useState({
        enabled: true, // Mặc định tạo snapshot
        notes: "",
        currentYear: null,
    });

    useEffect(() => {
        fetchCurrentYear();
    }, []);

    const fetchCurrentYear = async () => {
        try {
            const token = localStorage.getItem("token");
            // Sử dụng route mới
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/wish/years`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const activeYear = response.data.data?.find((year) => year.status === "active");
            if (activeYear) {
                setSnapshotOption((prev) => ({
                    ...prev,
                    currentYear: activeYear,
                    notes: `Thống kê năm ${activeYear.yearName} - ${new Date().toLocaleDateString("vi-VN")}`,
                }));
            }
        } catch (error) {
            console.error("Error fetching current year:", error);
            // Nếu không lấy được năm, vẫn để mặc định
            setSnapshotOption((prev) => ({
                ...prev,
                notes: `Thống kê lọc trúng tuyển - ${new Date().toLocaleDateString("vi-VN")}`,
            }));
        }
    };

    // Hàm xử lý lọc nguyện vọng VÀ tạo snapshot
    const handleFilter = async () => {
        setFiltering(true);
        setError(null);
        setSuccessMsg("");

        try {
            const token = localStorage.getItem("token");

            // 1. Thực hiện lọc trúng tuyển
            const filterResponse = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/wish/filter`,
                {},
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );

            let snapshotMessage = "";

            // 2. Tạo snapshot nếu được bật
            if (snapshotOption.enabled) {
                try {
                    const snapshotResponse = await axios.post(
                        `${process.env.REACT_APP_API_BASE_URL}/snapshots/create-yearly`,
                        {
                            yearId: snapshotOption.currentYear?.yearId,
                            notes: snapshotOption.notes,
                            snapshotType: "yearly_summary",
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    snapshotMessage = `\n📊 Đã tạo snapshot thống kê`;
                } catch (snapshotError) {
                    console.error("Snapshot creation failed:", snapshotError);
                    snapshotMessage = "\n⚠️ Lọc thành công nhưng không thể tạo snapshot thống kê.";
                }
            }

            setSuccessMsg(`✅ Lọc thành công! Danh sách trúng tuyển đã được cập nhật.${snapshotMessage}`);
        } catch (err) {
            console.error("Filter error:", err);
            setError("❌ Lỗi khi lọc nguyện vọng.");
        } finally {
            setFiltering(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">🎯 Lọc Danh Sách Trúng Tuyển</h1>

            {/* Current Year Info */}
            {snapshotOption.currentYear && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">📅 Năm tuyển sinh hiện tại</h3>
                    <p className="text-blue-700">
                        <strong>{snapshotOption.currentYear.yearName}</strong> (ID: {snapshotOption.currentYear.yearId})
                    </p>
                </div>
            )}

            {/* Snapshot Options */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 Tùy chọn thống kê so sánh năm</h3>

                <div className="space-y-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={snapshotOption.enabled}
                            onChange={(e) =>
                                setSnapshotOption((prev) => ({
                                    ...prev,
                                    enabled: e.target.checked,
                                }))
                            }
                            className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Tự động tạo snapshot thống kê khi lọc</span>
                    </label>

                    <div className="text-sm text-gray-600 ml-7 bg-gray-50 p-3 rounded">
                        <p className="font-medium mb-1">📌 Snapshot sẽ lưu thông tin:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Tổng số sinh viên đăng ký trong năm</li>
                            <li>Số lượng đăng ký theo từng ngành</li>
                            <li>Số lượng đăng ký theo từng diện xét tuyển</li>
                            <li>Chi tiết các ngành và diện đang mở</li>
                            <li>Thống kê trúng tuyển sau khi lọc</li>
                        </ul>
                        <p className="mt-2 text-blue-600 font-medium">
                            👉 Dữ liệu này sẽ dùng để so sánh với các năm khác
                        </p>
                    </div>

                    {snapshotOption.enabled && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ghi chú cho snapshot:
                            </label>
                            <input
                                type="text"
                                value={snapshotOption.notes}
                                onChange={(e) =>
                                    setSnapshotOption((prev) => ({
                                        ...prev,
                                        notes: e.target.value,
                                    }))
                                }
                                placeholder={`Thống kê tổng kết năm ${snapshotOption.currentYear?.yearName}...`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-6">
                <button
                    onClick={handleFilter}
                    disabled={filtering}
                    className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 ${
                        filtering ? "opacity-60 cursor-not-allowed" : "transform hover:scale-105"
                    }`}
                >
                    {filtering && (
                        <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    )}
                    <span className="text-lg">{filtering ? "⏳ Đang xử lý..." : "🎯 Lọc danh sách trúng tuyển"}</span>
                </button>

                {successMsg && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg text-center w-full shadow-sm">
                        <div className="whitespace-pre-line">{successMsg}</div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-center w-full shadow-sm">
                        {error}
                    </div>
                )}

                <div className="text-gray-600 text-center">
                    <p>
                        Nhấn nút <span className="font-semibold text-blue-700">"Lọc danh sách trúng tuyển"</span> để hệ
                        thống tự động xét tuyển các nguyện vọng theo quy tắc ưu tiên và điểm chuẩn.
                    </p>
                    <p className="mt-2">
                        Sau khi lọc, bạn có thể xem danh sách trúng tuyển tại mục{" "}
                        <span className="font-semibold text-blue-700">"Quản lý danh sách trúng tuyển"</span>.
                    </p>
                    {snapshotOption.enabled && (
                        <p className="mt-2 text-blue-600">
                            📊 Snapshot thống kê sẽ được tạo để so sánh với các năm khác.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterPage;
