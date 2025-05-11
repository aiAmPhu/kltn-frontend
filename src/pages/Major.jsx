import React from "react";

const majors = [
    {
        code: "7480201",
        name: "Công nghệ thông tin",
        subjects: ["A00", "A01", "D01"],
    },
    {
        code: "7510301",
        name: "Công nghệ kỹ thuật điện - điện tử",
        subjects: ["A00", "A01"],
    },
    {
        code: "7510205",
        name: "Công nghệ kỹ thuật ô tô",
        subjects: ["A00", "A01", "D01"],
    },
    {
        code: "7520201",
        name: "Kỹ thuật điện",
        subjects: ["A00", "A01"],
    },
    {
        code: "7340101",
        name: "Quản trị kinh doanh",
        subjects: ["A00", "A01", "D01"],
    },
];

function Majors() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-10 mt-12">
            <h1 className="text-2xl font-bold mb-6 text-blue-700">Danh sách ngành tuyển sinh</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded shadow-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                            <th className="px-4 py-3 border-b">Mã ngành</th>
                            <th className="px-4 py-3 border-b">Tên ngành</th>
                            <th className="px-4 py-3 border-b">Tổ hợp xét tuyển</th>
                        </tr>
                    </thead>
                    <tbody>
                        {majors.map((major) => (
                            <tr key={major.code} className="hover:bg-gray-50 text-sm">
                                <td className="px-4 py-3 border-b">{major.code}</td>
                                <td className="px-4 py-3 border-b">{major.name}</td>
                                <td className="px-4 py-3 border-b">{major.subjects.join(", ")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Majors;
