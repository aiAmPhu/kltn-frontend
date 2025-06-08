import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlay, FaSpinner, FaInfoCircle, FaCalendarAlt, FaChartBar } from "react-icons/fa";
import { toast } from "react-toastify";

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

                    snapshotMessage = " Đã tạo snapshot thống kê.";
                } catch (snapshotError) {
                    console.error("Snapshot creation failed:", snapshotError);
                    snapshotMessage = " Lọc thành công nhưng không thể tạo snapshot thống kê.";
                }
            }

            setSuccessMsg(`Xét duyệt thành công! Danh sách trúng tuyển đã được cập nhật.${snapshotMessage}`);
            toast.success("Xét duyệt nguyện vọng thành công!");
        } catch (err) {
            console.error("Filter error:", err);
            const errorMessage = "Lỗi khi lọc nguyện vọng.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setFiltering(false);
        }
    };

    return (
        <div className="w-full bg-white shadow-lg rounded-xl border border-gray-200">
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Xét duyệt nguyện vọng</h1>
                </div>

                {/* Current Year Info */}
                {snapshotOption.currentYear && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FaCalendarAlt className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-blue-800">Năm tuyển sinh hiện tại</h3>
                                <p className="text-blue-700">
                                    <strong>{snapshotOption.currentYear.yearName}</strong> (ID: {snapshotOption.currentYear.yearId})
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Snapshot Options */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FaChartBar className="text-purple-600 text-sm" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Tùy chọn thống kê so sánh năm</h3>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={snapshotOption.enabled}
                                onChange={(e) =>
                                    setSnapshotOption((prev) => ({
                                        ...prev,
                                        enabled: e.target.checked,
                                    }))
                                }
                                className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                            />
                            <span className="text-sm font-medium text-gray-700">Tự động tạo snapshot thống kê khi lọc</span>
                        </label>

                        <div className="text-sm text-gray-600 ml-7 bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FaInfoCircle className="text-blue-500 text-xs flex-shrink-0" />
                                <p className="font-medium">Snapshot sẽ lưu thông tin:</p>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                                <li>Tổng số sinh viên đăng ký trong năm</li>
                                <li>Số lượng đăng ký theo từng ngành</li>
                                <li>Số lượng đăng ký theo từng diện xét tuyển</li>
                                <li>Chi tiết các ngành và diện đang mở</li>
                                <li>Thống kê trúng tuyển sau khi lọc</li>
                            </ul>
                            <p className="mt-3 text-blue-600 font-medium text-sm">
                                Dữ liệu này sẽ dùng để so sánh với các năm khác
                            </p>
                        </div>

                        {snapshotOption.enabled && (
                            <div className="ml-7">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Success Message */}
                {successMsg && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 mb-6">
                        <div className="font-medium">{successMsg}</div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
                        <div className="font-medium">{error}</div>
                    </div>
                )}

                {/* Action Section */}
                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={handleFilter}
                        disabled={filtering}
                        className={`inline-flex items-center gap-3 px-8 py-4 bg-blue-500 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-600 transition-all duration-200 ${
                            filtering ? "opacity-60 cursor-not-allowed" : "hover:shadow-xl transform hover:scale-105"
                        }`}
                        title="Thực hiện xét duyệt nguyện vọng"
                    >
                        {filtering ? (
                            <FaSpinner className="animate-spin h-5 w-5" />
                        ) : (
                            <FaPlay className="h-5 w-5" />
                        )}
                        <span className="text-lg">{filtering ? "Đang xử lý..." : "Xét duyệt nguyện vọng"}</span>
                    </button>

                    {/* Instructions */}
                    <div className="text-gray-600 text-center max-w-2xl">
                        <p className="text-sm">
                            Nhấn nút <span className="font-semibold text-blue-700">"Xét duyệt nguyện vọng"</span> để hệ
                            thống tự động xét tuyển các nguyện vọng theo quy tắc ưu tiên và điểm chuẩn.
                        </p>
                        <p className="mt-2 text-sm">
                            Sau khi lọc, bạn có thể xem danh sách trúng tuyển tại mục{" "}
                            <span className="font-semibold text-blue-700">"Quản lý danh sách trúng tuyển"</span>.
                        </p>
                        {snapshotOption.enabled && (
                            <p className="mt-2 text-sm text-blue-600 font-medium">
                                Snapshot thống kê sẽ được tạo để so sánh với các năm khác.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterPage;
