import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const StatisticsPage = () => {
    const [loading, setLoading] = useState(false);
    const [snapshots, setSnapshots] = useState([]);
    const [selectedSnapshots, setSelectedSnapshots] = useState([]);
    const [comparisonData, setComparisonData] = useState(null);
    const [viewMode, setViewMode] = useState("overview"); // overview, comparison, detailed
    const [error, setError] = useState("");

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchSnapshots();
    }, []);

    const fetchSnapshots = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/snapshots`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSnapshots(response.data.data || []);
        } catch (error) {
            console.error("Error fetching snapshots:", error);
            setError("Không thể tải dữ liệu snapshots");
        } finally {
            setLoading(false);
        }
    };

    const handleCompareSnapshots = async () => {
        if (selectedSnapshots.length < 2) {
            toast.warning("Vui lòng chọn ít nhất 2 snapshots để so sánh");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                `${API_BASE_URL}/snapshots/compare`,
                {
                    snapshotIds: selectedSnapshots,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.data && response.data.data) {
                console.log("Setting comparison data:", response.data.data);
                setComparisonData(response.data.data);
                setViewMode("comparison");
            } else {
                console.error("Invalid response structure:", response.data);
                setError("Dữ liệu response không đúng format");
            }
        } catch (error) {
            console.error("Error comparing snapshots:", error);
            setError("Không thể so sánh snapshots");
        } finally {
            setLoading(false);
        }
    };

    // Chart colors
    const chartColors = [
        "rgb(59, 130, 246)", // Blue
        "rgb(16, 185, 129)", // Green
        "rgb(245, 101, 101)", // Red
        "rgb(251, 191, 36)", // Yellow
        "rgb(139, 92, 246)", // Purple
        "rgb(236, 72, 153)", // Pink
    ];

    // Overview Charts Data
    const getOverviewChartData = () => {
        const yearlySnapshots = snapshots.filter((s) => s.snapshotType === "yearly_summary");

        return {
            labels: yearlySnapshots.map((s) => s.yearName),
            datasets: [
                {
                    label: "Tổng sinh viên",
                    data: yearlySnapshots.map((s) => s.totalStudents),
                    backgroundColor: chartColors[0],
                    borderColor: chartColors[0],
                    borderWidth: 1,
                },
                {
                    label: "Tổng nguyện vọng",
                    data: yearlySnapshots.map((s) => s.totalWishes),
                    backgroundColor: chartColors[1],
                    borderColor: chartColors[1],
                    borderWidth: 1,
                },
            ],
        };
    };

    // Status Distribution Chart
    const getStatusDistributionData = () => {
        const latestSnapshot = snapshots.find((s) => s.snapshotType === "yearly_summary");
        if (!latestSnapshot) return null;

        return {
            labels: ["Chờ duyệt", "Đã duyệt", "Từ chối"],
            datasets: [
                {
                    data: [latestSnapshot.pendingWishes, latestSnapshot.acceptedWishes, latestSnapshot.rejectedWishes],
                    backgroundColor: [
                        "rgb(251, 191, 36)", // Yellow for pending
                        "rgb(16, 185, 129)", // Green for accepted
                        "rgb(245, 101, 101)", // Red for rejected
                    ],
                    borderWidth: 2,
                },
            ],
        };
    };

    // Top Majors Chart
    const getTopMajorsData = () => {
        const latestSnapshot = snapshots.find((s) => s.snapshotType === "yearly_summary");
        if (!latestSnapshot || !latestSnapshot.studentsByMajor) return null;

        const top10Majors = latestSnapshot.studentsByMajor
            .sort((a, b) => b.uniqueStudents - a.uniqueStudents)
            .slice(0, 10);

        return {
            labels: top10Majors.map((m) => m.majorCodeName || m.majorName),
            datasets: [
                {
                    label: "Số sinh viên đăng ký",
                    data: top10Majors.map((m) => m.uniqueStudents),
                    backgroundColor: chartColors.slice(0, 10),
                    borderWidth: 1,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Thống kê tuyển sinh",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">📊 Thống kê và So sánh</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
            )}

            {/* View Mode Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                {[
                    { key: "overview", label: "📈 Tổng quan", icon: "📈" },
                    { key: "comparison", label: "🔄 So sánh", icon: "🔄" },
                    { key: "detailed", label: "📋 Chi tiết", icon: "📋" },
                ].map((mode) => (
                    <button
                        key={mode.key}
                        onClick={() => setViewMode(mode.key)}
                        className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                            viewMode === mode.key
                                ? "bg-blue-500 text-white shadow-md"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                        }`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>

            {/* Overview Mode */}
            {viewMode === "overview" && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {snapshots.slice(0, 1).map((snapshot) => (
                            <React.Fragment key={snapshot.snapshotId}>
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Tổng sinh viên</h3>
                                    <p className="text-3xl font-bold text-blue-600">{snapshot.totalStudents}</p>
                                    <p className="text-sm text-blue-600 mt-1">Năm {snapshot.yearName}</p>
                                </div>
                                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">Tổng nguyện vọng</h3>
                                    <p className="text-3xl font-bold text-green-600">{snapshot.totalWishes}</p>
                                    <p className="text-sm text-green-600 mt-1">
                                        TB:{" "}
                                        {snapshot.totalStudents > 0
                                            ? (snapshot.totalWishes / snapshot.totalStudents).toFixed(1)
                                            : 0}{" "}
                                        NV/SV
                                    </p>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                                    <h3 className="text-lg font-semibold text-purple-800 mb-2">Tổng ngành</h3>
                                    <p className="text-3xl font-bold text-purple-600">{snapshot.totalMajors}</p>
                                    <p className="text-sm text-purple-600 mt-1">Đang tuyển sinh</p>
                                </div>
                                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                                    <h3 className="text-lg font-semibold text-orange-800 mb-2">Tỷ lệ trúng tuyển</h3>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {snapshot.totalWishes > 0
                                            ? ((snapshot.acceptedWishes / snapshot.totalStudents) * 100).toFixed(1)
                                            : 0}
                                        %
                                    </p>
                                    <p className="text-sm text-orange-600 mt-1">
                                        {snapshot.acceptedWishes}/{snapshot.totalWishes}
                                    </p>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Yearly Trend */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">📈 Xu hướng theo năm</h3>
                            {snapshots.length > 0 && <Bar data={getOverviewChartData()} options={chartOptions} />}
                        </div>

                        {/* Status Distribution */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">🥧 Phân bố trạng thái</h3>
                            {getStatusDistributionData() && (
                                <Pie
                                    data={getStatusDistributionData()}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: "bottom" },
                                        },
                                    }}
                                />
                            )}
                        </div>

                        {/* Top Majors */}
                        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                            <h3 className="text-lg font-semibold mb-4">🎓 Top 10 ngành được đăng ký nhiều nhất</h3>
                            {getTopMajorsData() && (
                                <Bar
                                    data={getTopMajorsData()}
                                    options={{
                                        ...chartOptions,
                                        indexAxis: "y",
                                        plugins: {
                                            legend: { display: false },
                                        },
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison Mode */}
            {viewMode === "comparison" && (
                <div className="space-y-6">
                    {/* Snapshot Selection */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">🔍 Chọn snapshots để so sánh</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {snapshots.map((snapshot) => (
                                <label
                                    key={snapshot.snapshotId}
                                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedSnapshots.includes(snapshot.snapshotId)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedSnapshots([...selectedSnapshots, snapshot.snapshotId]);
                                            } else {
                                                setSelectedSnapshots(
                                                    selectedSnapshots.filter((id) => id !== snapshot.snapshotId)
                                                );
                                            }
                                        }}
                                        className="mr-3"
                                    />
                                    <div>
                                        <div className="font-medium">{snapshot.yearName}</div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(snapshot.createdAt).toLocaleDateString("vi-VN")}
                                        </div>
                                        <div className="text-xs text-blue-600">
                                            {snapshot.totalStudents} SV • {snapshot.totalWishes} NV
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={handleCompareSnapshots}
                            disabled={selectedSnapshots.length < 2}
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            🔄 So sánh ({selectedSnapshots.length} snapshots)
                        </button>
                    </div>

                    {/* Comparison Results */}
                    {comparisonData && (
                        <>
                            {console.log("About to render comparison data:", comparisonData)}
                            {console.log("basicComparison:", comparisonData.basicComparison)}
                            {console.log("growthAnalysis:", comparisonData.growthAnalysis)}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Basic Comparison */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold mb-4">📊 So sánh cơ bản</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-2">Năm</th>
                                                    <th className="text-right py-2">Sinh viên</th>
                                                    <th className="text-right py-2">Nguyện vọng</th>
                                                    <th className="text-right py-2">Tỷ lệ trúng tuyển</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(comparisonData.basicComparison || []).map((item, index) => (
                                                    <tr key={index} className="border-b">
                                                        <td className="py-2 font-medium">{item.yearName}</td>
                                                        <td className="text-right py-2">
                                                            {item.totalStudents.toLocaleString()}
                                                        </td>
                                                        <td className="text-right py-2">
                                                            {item.totalWishes.toLocaleString()}
                                                        </td>
                                                        <td className="text-right py-2">{item.acceptanceRate}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Growth Comparison */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold mb-4">📈 Tăng trưởng</h3>
                                    <div className="space-y-3">
                                        {(comparisonData.growthAnalysis || []).map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center p-3 bg-gray-50 rounded"
                                            >
                                                <span className="font-medium">{item.metric}</span>
                                                <span
                                                    className={`font-bold ${
                                                        item.change > 0
                                                            ? "text-green-600"
                                                            : item.change < 0
                                                            ? "text-red-600"
                                                            : "text-gray-600"
                                                    }`}
                                                >
                                                    {item.change > 0 ? "+" : ""}
                                                    {item.change}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Detailed Mode */}
            {viewMode === "detailed" && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">📋 Chi tiết tất cả snapshots</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4">Năm</th>
                                        <th className="text-left py-3 px-4">Loại</th>
                                        <th className="text-right py-3 px-4">Sinh viên</th>
                                        <th className="text-right py-3 px-4">Nguyện vọng</th>
                                        <th className="text-right py-3 px-4">Ngành</th>
                                        <th className="text-right py-3 px-4">Trúng tuyển</th>
                                        <th className="text-left py-3 px-4">Thời gian</th>
                                        <th className="text-left py-3 px-4">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {snapshots.map((snapshot) => (
                                        <tr key={snapshot.snapshotId} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium">{snapshot.yearName}</td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs ${
                                                        snapshot.snapshotType === "yearly_summary"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : snapshot.snapshotType === "manual"
                                                            ? "bg-green-100 text-green-800"
                                                            : snapshot.snapshotType === "auto"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {snapshot.snapshotType}
                                                </span>
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                {snapshot.totalStudents.toLocaleString()}
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                {snapshot.totalWishes.toLocaleString()}
                                            </td>
                                            <td className="text-right py-3 px-4">{snapshot.totalMajors}</td>
                                            <td className="text-right py-3 px-4">
                                                <span className="text-green-600 font-medium">
                                                    {snapshot.acceptedWishes} (
                                                    {snapshot.totalWishes > 0
                                                        ? (
                                                              (snapshot.acceptedWishes / snapshot.totalWishes) *
                                                              100
                                                          ).toFixed(1)
                                                        : 0}
                                                    %)
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {new Date(snapshot.createdAt).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                                                {snapshot.notes}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatisticsPage;
