import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const HighSchoolTranscript = () => {
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
    const [grades, setGrades] = useState({});
    const [errors, setErrors] = useState({});
    const inputsRef = useRef([]);
    const subjects = [
        "Toán",
        "Vật Lý",
        "Hóa học",
        "Sinh học",
        "Tin học",
        "Ngữ văn",
        "Lịch sử",
        "Địa lý",
        "Tiếng Anh",
        "Giáo dục Công dân",
        "Công nghệ",
        "Giáo dục Quốc phòng An Ninh",
    ];

    const years = [
        {
            label: "Lớp 10",
            year: "grade10", // dùng để match với `Score.year`
            color: "bg-green-100",
            fields: [
                { label: "Học kỳ 1", key: "score1" },
                { label: "Học kỳ 2", key: "score2" },
            ],
        },
        {
            label: "Lớp 11",
            year: "grade11",
            color: "bg-blue-100",
            fields: [
                { label: "Học kỳ 1", key: "score1" },
                { label: "Học kỳ 2", key: "score2" },
            ],
        },
        {
            label: "Lớp 12",
            year: "grade12",
            color: "bg-red-100",
            fields: [
                { label: "Học kỳ 1", key: "score1" }, // chỉ có 1 học kỳ
            ],
        },
    ];

    // Sử dụng useEffect để lấy dữ liệu từ API
    useEffect(() => {
        const fetchTranscript = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/transcripts/getTranscriptByE/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const apiScores = response.data.data?.scores || [];
                const initialGrades = {};
                // Lấy ra tất cả các môn từ API (sẽ có nhiều entry cho cùng môn)
                const uniqueSubjects = [...new Set(apiScores.map((item) => item.subject.trim()))];
                uniqueSubjects.forEach((subject, subjectIndex) => {
                    initialGrades[subjectIndex] = {};
                    years.forEach((year, yearIndex) => {
                        const yearLabel = year.label;
                        const scoresForYear = apiScores.find(
                            (item) => item.subject.trim() === subject && item.year === yearLabel
                        );
                        if (scoresForYear) {
                            initialGrades[subjectIndex][yearIndex] = {};

                            year.fields.forEach((field) => {
                                initialGrades[subjectIndex][yearIndex][field.key] = scoresForYear[field.key] ?? "";
                            });
                        }
                    });
                });
                setGrades(initialGrades);
            } catch (error) {
                console.error("Lỗi khi lấy học bạ:", error);
            }
        };
        fetchTranscript();
    }, [userId]);

    const handleInputChange = (subjectIndex, yearIndex, field, value) => {
        const newGrades = grades ? { ...grades } : {};
        const newErrors = errors ? { ...errors } : {};
        if (value < 0 || value > 10) {
            newErrors[`${subjectIndex}-${yearIndex}-${field}`] = "Điểm phải từ 0 đến 10";
        } else {
            delete newErrors[`${subjectIndex}-${yearIndex}-${field}`];
        }
        if (!newGrades[subjectIndex]) newGrades[subjectIndex] = {};
        if (!newGrades[subjectIndex][yearIndex]) newGrades[subjectIndex][yearIndex] = {};
        newGrades[subjectIndex][yearIndex][field] = parseFloat(value) || "";
        setGrades(newGrades);
        setErrors(newErrors);
    };

    const handleKeyPress = (e, index) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (index + 1 < inputsRef.current.length) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };

    const handleSaveTranscript = async (e) => {
        e.preventDefault();
        updateInformation();
    };

    const updateInformation = async () => {
        try {
            let isValid = true;
            const scores = {};
            subjects.forEach((subject, subjectIndex) => {
                const subjectScores = [];
                years.forEach((year, yearIndex) => {
                    year.fields.forEach((field) => {
                        const score = grades?.[subjectIndex]?.[yearIndex]?.[field.key];
                        if (score === undefined || score === "" || isNaN(score)) {
                            isValid = false;
                        }
                        subjectScores.push({
                            year: year.label,
                            semester: field.label,
                            score: parseFloat(score) || 0,
                        });
                    });
                });
                scores[subject] = subjectScores;
            });
            if (!isValid) {
                toast.error("Vui lòng nhập đầy đủ và hợp lệ tất cả điểm!");
                return;
            }
            const data = { scores };
            await axios.put(`${process.env.REACT_APP_API_BASE_URL}/transcripts/update/${userId}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Cập nhật học bạ thành công!");
        } catch (error) {
            console.error("Lỗi khi cập nhật học bạ:", error.response?.data.message || error.message);
            toast.error("Có lỗi xảy ra khi lưu học bạ.");
        }
    };

    return (
        <div className="p-6">
            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2">STT</th>
                        <th className="border border-gray-300 p-2">Môn học</th>
                        {years.map((year, yearIndex) =>
                            year.fields.map((field, fieldIndex) => (
                                <th
                                    key={`${yearIndex}-${fieldIndex}`}
                                    className={`border border-gray-300 p-2 ${year.color}`}
                                >
                                    {year.label}
                                    <br />
                                    {field.label}
                                </th>
                            ))
                        )}
                    </tr>
                </thead>
                <tbody>
                    {subjects.map((subject, subjectIndex) => (
                        <tr key={subjectIndex}>
                            <td className="border border-gray-300 p-2 text-center">{subjectIndex + 1}</td>
                            <td className="border border-gray-300 p-2">{subject}</td>
                            {years.map((year, yearIndex) =>
                                year.fields.map((field, fieldIndex) => (
                                    <td
                                        key={`${subjectIndex}-${yearIndex}-${fieldIndex}`}
                                        className="border border-gray-300 p-2 text-center"
                                    >
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full border border-gray-300 rounded p-1 text-center"
                                            value={grades?.[subjectIndex]?.[yearIndex]?.[field.key] ?? ""}
                                            onChange={(e) =>
                                                handleInputChange(subjectIndex, yearIndex, field.key, e.target.value)
                                            }
                                            ref={(el) => inputsRef.current.push(el)}
                                            onKeyDown={(e) =>
                                                handleKeyPress(
                                                    e,
                                                    inputsRef.current.indexOf(
                                                        inputsRef.current.find((ref) => ref === e.target)
                                                    )
                                                )
                                            }
                                        />
                                        {errors?.[`${subjectIndex}-${yearIndex}-${field}`] && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors[`${subjectIndex}-${yearIndex}-${field}`]}
                                            </div>
                                        )}
                                    </td>
                                ))
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 text-right">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={handleSaveTranscript}
                >
                    Cập nhật
                </button>
            </div>
        </div>
    );
};

export default HighSchoolTranscript;
