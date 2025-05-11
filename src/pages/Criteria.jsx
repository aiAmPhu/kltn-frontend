import React from "react";
const criterias = [
    {
        code: "01",
        name: "Xét điểm thi tốt nghiệp THPT",
        note: "Dựa theo điểm 3 môn của kỳ thi THPT",
    },
    {
        code: "02",
        name: "Xét học bạ lớp 12",
        note: "Dựa theo tổ hợp môn trong học bạ lớp 12",
    },
    {
        code: "03",
        name: "Xét tuyển thẳng",
        note: "Theo quy chế của Bộ GD&ĐT",
    },
    {
        code: "04",
        name: "Ưu tiên xét tuyển theo quy định HCMUTE",
        note: "Áp dụng cho học sinh có giải, học sinh giỏi,...",
    },
];

function Criteria() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-10 mt-12">
            <h1 className="text-2xl font-bold mb-6 text-blue-700">Các diện xét tuyển</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded shadow-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                            <th className="px-4 py-3 border-b">Mã diện</th>
                            <th className="px-4 py-3 border-b">Tên diện xét tuyển</th>
                            <th className="px-4 py-3 border-b">Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {criterias.map((method) => (
                            <tr key={method.code} className="hover:bg-gray-50 text-sm">
                                <td className="px-4 py-3 border-b">{method.code}</td>
                                <td className="px-4 py-3 border-b">{method.name}</td>
                                <td className="px-4 py-3 border-b">{method.note}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Criteria;
