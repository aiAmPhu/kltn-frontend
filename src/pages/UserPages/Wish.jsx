import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

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
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingWishes, setIsLoadingWishes] = useState(false);
    const [profileStatus, setProfileStatus] = useState("waiting"); // waiting, accepted, rejected
    const [isCheckingProfile, setIsCheckingProfile] = useState(true); // loading state cho việc kiểm tra profile
    const [showProfileModal, setShowProfileModal] = useState(false); // hiển thị modal thông báo profile

    const location = useLocation();
    const navigate = useNavigate();
    const selectedMajor = location.state?.selectedMajor;
    
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
    const userRole = token ? JSON.parse(atob(token.split(".")[1])).role : null;
    
    // Set document title
    useDocumentTitle("Đăng ký nguyện vọng");

    // Tách riêng function để fetch user wishes
    const fetchUserWishes = async () => {
        setIsLoadingWishes(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/wish/form-data`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const { userWishes } = response.data.data;
            setUserWishes(userWishes);
        } catch (error) {
            console.error("Lỗi khi tải nguyện vọng người dùng:", error);
        } finally {
            setIsLoadingWishes(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Kiểm tra profile status trước tiên
                try {
                    const profileRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adis/getBasicInfo/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const status = profileRes.data.data?.status || "waiting";
                    setProfileStatus(status);
                    
                    // Kiểm tra quyền truy cập trang - hiển thị modal nếu profile chưa được duyệt
                    if (status !== "accepted") {
                        setShowProfileModal(true);
                        setIsCheckingProfile(false);
                        return;
                    }
                } catch (error) {
                    console.error("Lỗi khi tải trạng thái profile:", error);
                    toast.error("Không thể kiểm tra trạng thái hồ sơ. Vui lòng thử lại sau.");
                    setIsCheckingProfile(false);
                    return;
                }

                // Nếu profile đã được duyệt, tiếp tục fetch wish form data
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/wish/form-data`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("Dữ liệu nguyện vọng:", response.data.data);
                const { criteria, majors, blocks, userWishes } = response.data.data;
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
                toast.error("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setIsCheckingProfile(false);
            }
        };
        fetchData();
    }, [userId, userRole, navigate]);

    // Handle major selection from HomePage
    useEffect(() => {
        if (selectedMajor && blockList.length > 0) {
            handleMajorSelectionFromHome(selectedMajor.majorId);
        }
    }, [selectedMajor, blockList]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.post(
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
            
            // Reset form
            setSelected({
                criteriaId: "",
                admissionBlockId: "",
                majorId: "",
            });
            setAvailableBlocks([]);
            
            // Refetch user wishes để cập nhật danh sách ngay lập tức
            await fetchUserWishes();
        } catch (err) {
            toast.error(err.response?.data?.message);
        } finally {
            setIsSaving(false);
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
            setAvailableBlocks([]);
        }
    };

    // Handle đóng modal và chuyển đến profile
    const handleGoToProfile = () => {
        setShowProfileModal(false);
        navigate("/profile");
    };

    const handleCloseModal = () => {
        setShowProfileModal(false);
        navigate("/"); // Quay về trang chủ
    };

    // Modal thông báo profile chưa được duyệt
    const ProfileModal = () => (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Thông báo
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Bạn cần cập nhật thông tin đầy đủ hoặc chờ hồ sơ được duyệt
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Đóng
                        </button>
                        <button
                            onClick={handleGoToProfile}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Đến trang Hồ sơ của tôi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Hiển thị modal nếu profile chưa được duyệt
    if (showProfileModal) {
        return <ProfileModal />;
    }

    // Hiển thị loading screen khi đang kiểm tra profile
    if (isCheckingProfile) {
        return (
            <div className="max-w-7xl mx-auto py-10 px-4 mt-12">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-lg text-gray-600">Đang kiểm tra quyền truy cập...</p>
                    </div>
                </div>
            </div>
        );
    }

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
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            Nguyện vọng đã đăng ký
                        </h2>
                        <button
                            onClick={fetchUserWishes}
                            disabled={isLoadingWishes}
                            className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                            title="Làm mới danh sách"
                        >
                            <svg className={`w-5 h-5 ${isLoadingWishes ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                        {isLoadingWishes ? (
                            <div className="flex items-center justify-center py-8">
                                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="ml-2 text-gray-600">Đang tải nguyện vọng...</span>
                            </div>
                        ) : userWishes.length > 0 ? (
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
                            disabled={!selected.criteriaId || !selected.admissionBlockId || !selected.majorId || isSaving}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isSaving ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang lưu...
                                </div>
                            ) : (
                                "Lưu nguyện vọng"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WishRegistration;
