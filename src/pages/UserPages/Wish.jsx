import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
        <div className="max-w-3xl mx-auto py-10 px-4 mt-12">
            <h1 className="text-3xl font-bold mb-8 text-blue-700 border-l-8 border-blue-500 pl-4 bg-blue-50 py-2">
                ĐĂNG KÝ NGUYỆN VỌNG XÉT TUYỂN
            </h1>

            {userRole === "admin" && acceptedWishes.length > 0 && (
                <div className="mb-8 bg-green-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-green-800 mb-2">Nguyện vọng đã được chấp nhận</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr className="bg-green-100">
                                    <th className="px-4 py-2 text-left">Người dùng</th>
                                    <th className="px-4 py-2 text-left">Ngành</th>
                                    <th className="px-4 py-2 text-left">Diện xét tuyển</th>
                                    <th className="px-4 py-2 text-left">Khối xét tuyển</th>
                                </tr>
                            </thead>
                            <tbody>
                                {acceptedWishes.map((wish, index) => (
                                    <tr key={index} className="border-b hover:bg-green-50">
                                        <td className="px-4 py-2">{wish.userName}</td>
                                        <td className="px-4 py-2">{wish.majorId}</td>
                                        <td className="px-4 py-2">{wish.criteriaId}</td>
                                        <td className="px-4 py-2">{wish.admissionBlockId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {userWishes.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Nguyện vọng đã đăng ký</h2>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                        {userWishes.map((wish, index) => (
                            <li key={index}>
                                Nguyện vọng {index + 1}: {wish.majorId} - {wish.criteriaId} - {wish.admissionBlockId}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-5">
                <div>
                    <label className="block font-medium mb-1">Chọn ngành</label>
                    <select
                        value={selected.majorId}
                        onChange={handleMajorChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
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
                    <label className="block font-medium mb-1">Chọn diện xét tuyển</label>
                    <select
                        value={selected.criteriaId}
                        onChange={(e) => setSelected({ ...selected, criteriaId: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2"
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
                    <label className="block font-medium mb-1">Chọn khối xét tuyển</label>
                    <select
                        value={selected.admissionBlockId}
                        onChange={(e) => setSelected({ ...selected, admissionBlockId: e.target.value })}
                        disabled={!selected.majorId} // disable nếu chưa chọn ngành
                        className="w-full border border-gray-300 rounded px-3 py-2"
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
                    className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    Lưu nguyện vọng
                </button>
            </div>
        </div>
    );
}

export default WishRegistration;
