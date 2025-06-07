import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

function WishRegistration() {
    const [criteriaList, setCriteriaList] = useState([]);
    const [blockList, setBlockList] = useState([]);
    const [majorList, setMajorList] = useState([]);
    const [userWishes, setUserWishes] = useState([]);
    const [acceptedWishes, setAcceptedWishes] = useState([]);
    const [availableBlocks, setAvailableBlocks] = useState([]);
    const [selected, setSelected] = useState({
        criteriaId: "",
        admissionBlockId: "",
        majorId: "",
    });

    const location = useLocation();
    const selectedMajor = location.state?.selectedMajor;
    
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
    const userRole = token ? JSON.parse(atob(token.split(".")[1])).role : null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/wish/form-data`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("Dữ liệu nguyện vọng:", response.data.data);
                const { criteria, majors, blocks, userWishes } = response.data.data;
                // console.log("Criteria:", criteria);
                // console.log("Majors:", majors);
                // console.log("Blocks:", blocks);
                // console.log("User Wishes:", fo);
                setCriteriaList(criteria);
                setBlockList(blocks);
                setMajorList(majors);
                setUserWishes(userWishes);
                
                // Set selected major if passed from HomePage
                if (selectedMajor) {
                    setSelected(prev => ({
                        ...prev,
                        majorId: selectedMajor.majorId
                    }));
                }
                
                // Fetch accepted wishes if user is admin
                if (userRole === "admin") {
                    try {
                        const acceptedRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/wish/getAccepted`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        setAcceptedWishes(acceptedRes.data);
                    } catch (error) {
                        console.error("Lỗi khi tải danh sách nguyện vọng đã chấp nhận:", error);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            }
        };
        fetchData();
    }, [userId, userRole]);

    // Handle major selection from HomePage
    useEffect(() => {
        if (selectedMajor && blockList.length > 0) {
            handleMajorSelectionFromHome(selectedMajor.majorId);
        }
    }, [selectedMajor, blockList]);

    const handleSave = async () => {
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/wish/add`,
                {
                    uId: userId, // đổi từ userId → uId
                    criteriaId: selected.criteriaId,
                    admissionBlockId: selected.admissionBlockId,
                    majorId: selected.majorId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success("Lưu nguyện vọng thành công!");
            setUserWishes((prev) => [...prev, res.data]);
        } catch (err) {
            toast.error(err.response?.data?.message);
            console.error(err);
        }
    };

    const handleMajorSelectionFromHome = async (majorId) => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adms/getCombination/${majorId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const combinationIds = res.data.majorCombination;
            // Lọc danh sách khối dựa trên combinationIds
            const filtered = blockList.filter((block) => combinationIds.includes(block.admissionBlockId));
            setAvailableBlocks(filtered);
        } catch (error) {
            console.error("Lỗi khi lấy tổ hợp khối:", error);
            setAvailableBlocks([]);
        }
    };

    const handleMajorChange = async (e) => {
        const majorId = e.target.value;
        setSelected({ ...selected, majorId, admissionBlockId: "" });
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adms/getCombination/${majorId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const combinationIds = res.data.majorCombination;
            // Lọc danh sách khối dựa trên combinationIds
            const filtered = blockList.filter((block) => combinationIds.includes(block.admissionBlockId));
            setAvailableBlocks(filtered);
        } catch (error) {
            console.error("Lỗi khi lấy tổ hợp khối:", error);
            setAvailableBlocks([]);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 mt-12">
            <h1 className="text-3xl font-bold mb-8 text-blue-700 border-l-8 border-blue-500 pl-4 bg-blue-50 py-2">
                ĐĂNG KÝ NGUYỆN VỌNG XÉT TUYỂN
            </h1>

            {userRole === "admin" && acceptedWishes.length > 0 && (
                <div className="mb-8 bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
                    <h2 className="text-xl font-bold text-green-800 mb-4">
                        Nguyện vọng đã được chấp nhận
                    </h2>
                    <div className="overflow-x-auto rounded-lg border border-green-200">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr className="bg-green-100">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-green-800">Người dùng</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-green-800">Ngành</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-green-800">Diện xét tuyển</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-green-800">Khối xét tuyển</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-green-100">
                                {acceptedWishes.map((wish, index) => (
                                    <tr key={index} className="hover:bg-green-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-700">{wish.userName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{wish.majorId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{wish.criteriaId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{wish.admissionBlockId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-8">
                {/* Left side - Registered Wishes */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Nguyện vọng đã đăng ký
                    </h2>
                    <div className="space-y-3">
                        {userWishes.length > 0 ? (
                            userWishes.map((wish, index) => (
                                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold mr-3">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700">
                                            Ngành: <span className="font-medium">{wish.majorId}</span> | 
                                            Diện: <span className="font-medium">{wish.criteriaId}</span> | 
                                            Khối: <span className="font-medium">{wish.admissionBlockId}</span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">Chưa có nguyện vọng nào được đăng ký</p>
                        )}
                    </div>
                </div>

                {/* Right side - New Wish Registration */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Đăng ký nguyện vọng mới
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn ngành</label>
                            <select
                                value={selected.majorId}
                                onChange={handleMajorChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">-- Chọn ngành --</option>
                                {majorList.map((m) => (
                                    <option key={m.majorId} value={m.majorId}>
                                        {m.majorName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn diện xét tuyển</label>
                            <select
                                value={selected.criteriaId}
                                onChange={(e) => setSelected({ ...selected, criteriaId: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">-- Chọn diện --</option>
                                {criteriaList.map((c) => (
                                    <option key={c.criteriaId} value={c.criteriaId}>
                                        {c.criteriaName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn khối xét tuyển</label>
                            <select
                                value={selected.admissionBlockId}
                                onChange={(e) => setSelected({ ...selected, admissionBlockId: e.target.value })}
                                disabled={!selected.majorId}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">-- Chọn khối --</option>
                                {availableBlocks.map((b) => (
                                    <option key={b.admissionBlockId} value={b.admissionBlockId}>
                                        {b.admissionBlockId} - {b.admissionBlockName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={!selected.criteriaId || !selected.admissionBlockId || !selected.majorId}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            Lưu nguyện vọng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WishRegistration;
