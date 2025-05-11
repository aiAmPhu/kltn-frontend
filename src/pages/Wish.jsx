import React, { useEffect, useState } from "react";
import axios from "axios";

function WishRegistration() {
    const [criteriaList, setCriteriaList] = useState([]);
    const [blockList, setBlockList] = useState([]);
    const [majorList, setMajorList] = useState([]);
    const [userWishes, setUserWishes] = useState([]);
    const [availableBlocks, setAvailableBlocks] = useState([]);
    const [selected, setSelected] = useState({
        criteriaId: "",
        admissionBlockId: "",
        majorId: "",
    });

    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;

    useEffect(() => {
        console.log("User ID:", userId);
        const fetchData = async () => {
            try {
                const [criteriaRes, blockRes, majorRes, wishRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/adcs/getAll`),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/adbs/getall`),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/adms/getAll`),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/wish/getAll/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);
                setCriteriaList(criteriaRes.data);
                setBlockList(blockRes.data);
                setMajorList(majorRes.data);
                setUserWishes(wishRes.data.wishes);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            }
        };
        fetchData();
    }, [userId]);

    const handleSave = async () => {
        try {
            console.log("Selected data:", selected);
            console.log("userId:", userId, "| type:", typeof userId);
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
            alert("Lưu nguyện vọng thành công!");
            setUserWishes((prev) => [...prev, res.data]);
        } catch (err) {
            alert("Lỗi khi lưu nguyện vọng!");
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
            <h1 className="text-2xl font-bold text-blue-700 mb-6">Đăng ký nguyện vọng xét tuyển</h1>

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
                                {m.majorCodeName} - {m.majorName}
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
