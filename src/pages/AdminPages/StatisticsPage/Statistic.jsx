import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { 
    FaChartBar, 
    FaSpinner, 
    FaEye,
    FaExchangeAlt,
    FaClipboardList,
    FaUsers,
    FaGraduationCap,
    FaCalendarAlt,
    FaCheckCircle,
    FaExclamationCircle,
    FaInfoCircle,
    FaChartLine,
    FaChartPie,
    FaArrowUp,
    FaArrowDown,
    FaMinus
} from "react-icons/fa";
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

    // Set document title
    useDocumentTitle("Thống kê và so sánh");

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchSnapshots();
    }, []);

    const fetchSnapshots = async () => {
        try {
            setLoading(true);
            if (!token) {
                throw new Error("Vui lòng đăng nhập");
            }
            
            const response = await axios.get(`${API_BASE_URL}/snapshots`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSnapshots(response.data.data || []);
            setError("");
        } catch (error) {
            console.error("Error fetching snapshots:", error);
            const errorMessage = "Không thể tải dữ liệu snapshots";
            setError(errorMessage);
            toast.error(errorMessage);
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
                toast.success("So sánh snapshots thành công!");
            } else {
                console.error("Invalid response structure:", response.data);
                setError("Dữ liệu response không đúng format");
                toast.error("Dữ liệu response không đúng format");
            }
        } catch (error) {
            console.error("Error comparing snapshots:", error);
            const errorMessage = "Không thể so sánh snapshots";
            setError(errorMessage);
            toast.error(errorMessage);
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

    // View mode tabs configuration
    const viewModes = [
        { key: "overview", label: "Tổng quan", icon: FaEye, color: "blue" },
        { key: "comparison", label: "So sánh", icon: FaExchangeAlt, color: "green" },
        { key: "detailed", label: "Chi tiết", icon: FaClipboardList, color: "purple" },
    ];

    // Growth indicator component
    const GrowthIndicator = ({ change }) => {
        if (change > 0) {
            return (
                <span className="inline-flex items-center gap-1 text-green-600 font-bold">
                    <FaArrowUp className="text-xs" />
                    +{change}%
                </span>
            );
        } else if (change < 0) {
            return (
                <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                    <FaArrowDown className="text-xs" />
                    {change}%
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 text-gray-600 font-bold">
                    <FaMinus className="text-xs" />
                    {change}%
                </span>
            );
        }
    };

    if (loading) {
        return (
            <div className="w-full bg-white shadow-lg rounded-xl border border-gray-200">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <FaSpinner className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
                            <span className="text-gray-700 text-lg">Đang tải dữ liệu thống kê...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white shadow-lg rounded-xl border border-gray-200">
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Thống kê và so sánh</h1>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <FaExclamationCircle className="text-red-600" />
                            </div>
                            <div className="text-red-700">{error}</div>
                        </div>
                    </div>
                )}

                {/* View Mode Tabs */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 mb-6">
                    <div className="grid grid-cols-3 gap-2">
                        {viewModes.map((mode) => {
                            const IconComponent = mode.icon;
                            return (
                                <button
                                    key={mode.key}
                                    onClick={() => setViewMode(mode.key)}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                                        viewMode === mode.key
                                            ? "bg-blue-500 text-white shadow-md"
                                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                                    }`}
                                    title={`Chuyển sang chế độ ${mode.label.toLowerCase()}`}
                                >
                                    <IconComponent className="text-sm" />
                                    <span className="hidden sm:inline">{mode.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Overview Mode */}
                {viewMode === "overview" && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {snapshots.slice(0, 1).map((snapshot) => (
                                <React.Fragment key={snapshot.snapshotId}>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FaUsers className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-blue-800">Tổng sinh viên</h3>
                                                <p className="text-sm text-blue-600">Năm {snapshot.yearName}</p>
                                            </div>
                                        </div>
                                        <p className="text-3xl font-bold text-blue-600">{snapshot.totalStudents}</p>
                                    </div>
                                    
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <FaClipboardList className="text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-green-800">Tổng nguyện vọng</h3>
                                                <p className="text-sm text-green-600">
                                                    TB: {snapshot.totalStudents > 0 ? (snapshot.totalWishes / snapshot.totalStudents).toFixed(1) : 0} NV/SV
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-3xl font-bold text-green-600">{snapshot.totalWishes}</p>
                                    </div>
                                    
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <FaGraduationCap className="text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-purple-800">Tổng ngành</h3>
                                                <p className="text-sm text-purple-600">Đang tuyển sinh</p>
                                            </div>
                                        </div>
                                        <p className="text-3xl font-bold text-purple-600">{snapshot.totalMajors}</p>
                                    </div>
                                    
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <FaChartLine className="text-orange-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-orange-800">Tỷ lệ trúng tuyển</h3>
                                                <p className="text-sm text-orange-600">
                                                    {snapshot.acceptedWishes}/{snapshot.totalWishes}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-3xl font-bold text-orange-600">
                                            {snapshot.totalWishes > 0 ? ((snapshot.acceptedWishes / snapshot.totalStudents) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Yearly Trend */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FaChartLine className="text-blue-600 text-sm" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Xu hướng theo năm</h3>
                                </div>
                                {snapshots.length > 0 ? (
                                    <Bar data={getOverviewChartData()} options={chartOptions} />
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <FaInfoCircle className="mx-auto mb-2" />
                                        <p>Chưa có dữ liệu để hiển thị</p>
                                    </div>
                                )}
                            </div>

                            {/* Status Distribution */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FaChartPie className="text-green-600 text-sm" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Phân bố trạng thái</h3>
                                </div>
                                {getStatusDistributionData() ? (
                                    <Pie
                                        data={getStatusDistributionData()}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: { position: "bottom" },
                                            },
                                        }}
                                    />
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <FaInfoCircle className="mx-auto mb-2" />
                                        <p>Chưa có dữ liệu để hiển thị</p>
                                    </div>
                                )}
                            </div>

                            {/* Top Majors */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 lg:col-span-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <FaGraduationCap className="text-purple-600 text-sm" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Top 10 ngành được đăng ký nhiều nhất</h3>
                                </div>
                                {getTopMajorsData() ? (
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
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <FaInfoCircle className="mx-auto mb-2" />
                                        <p>Chưa có dữ liệu để hiển thị</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Comparison Mode */}
                {viewMode === "comparison" && (
                    <div className="space-y-6">
                        {/* Snapshot Selection */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FaExchangeAlt className="text-blue-600 text-sm" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Chọn snapshots để so sánh</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                {snapshots.map((snapshot) => (
                                    <label
                                        key={snapshot.snapshotId}
                                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
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
                                            className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FaCalendarAlt className="text-blue-600 text-xs" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{snapshot.yearName}</div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(snapshot.createdAt).toLocaleDateString("vi-VN")}
                                                </div>
                                                <div className="text-xs text-blue-600">
                                                    {snapshot.totalStudents} SV • {snapshot.totalWishes} NV
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <button
                                onClick={handleCompareSnapshots}
                                disabled={selectedSnapshots.length < 2}
                                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                title="So sánh các snapshots đã chọn"
                            >
                                <FaExchangeAlt className="text-sm" />
                                So sánh ({selectedSnapshots.length} snapshots)
                            </button>
                        </div>

                        {/* Comparison Results */}
                        {comparisonData && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Basic Comparison */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <FaChartBar className="text-green-600 text-sm" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800">So sánh cơ bản</h3>
                                    </div>
                                    
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-300">
                                                    <th className="text-left py-3 font-medium text-gray-700">Năm</th>
                                                    <th className="text-right py-3 font-medium text-gray-700">Sinh viên</th>
                                                    <th className="text-right py-3 font-medium text-gray-700">Nguyện vọng</th>
                                                    <th className="text-right py-3 font-medium text-gray-700">Tỷ lệ TT</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(comparisonData.basicComparison || []).map((item, index) => (
                                                    <tr key={index} className="border-b border-gray-200">
                                                        <td className="py-3 font-medium text-gray-900">{item.yearName}</td>
                                                        <td className="text-right py-3 text-gray-700">
                                                            {item.totalStudents.toLocaleString()}
                                                        </td>
                                                        <td className="text-right py-3 text-gray-700">
                                                            {item.totalWishes.toLocaleString()}
                                                        </td>
                                                        <td className="text-right py-3 text-gray-700">{item.acceptanceRate}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Growth Comparison */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <FaChartLine className="text-purple-600 text-sm" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800">Tăng trưởng</h3>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {(comparisonData.growthAnalysis || []).map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg"
                                            >
                                                <span className="font-medium text-gray-700">{item.metric}</span>
                                                <GrowthIndicator change={item.change} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Detailed Mode */}
                {viewMode === "detailed" && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FaClipboardList className="text-purple-600 text-sm" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Chi tiết tất cả snapshots</h3>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-300 bg-gray-100">
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Năm</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Loại</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700">Sinh viên</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700">Nguyện vọng</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700">Ngành</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700">Trúng tuyển</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Thời gian</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {snapshots.map((snapshot) => (
                                            <tr key={snapshot.snapshotId} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 font-medium text-gray-900">{snapshot.yearName}</td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                                                <td className="text-right py-3 px-4 text-gray-700">
                                                    {snapshot.totalStudents.toLocaleString()}
                                                </td>
                                                <td className="text-right py-3 px-4 text-gray-700">
                                                    {snapshot.totalWishes.toLocaleString()}
                                                </td>
                                                <td className="text-right py-3 px-4 text-gray-700">{snapshot.totalMajors}</td>
                                                <td className="text-right py-3 px-4">
                                                    <span className="text-green-600 font-medium">
                                                        {snapshot.acceptedWishes} (
                                                        {snapshot.totalWishes > 0
                                                            ? ((snapshot.acceptedWishes / snapshot.totalWishes) * 100).toFixed(1)
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
        </div>
    );
};

export default StatisticsPage;
