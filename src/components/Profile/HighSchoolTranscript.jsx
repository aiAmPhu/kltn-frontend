// Component được cập nhật với button Random
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; 

// Hàm random điểm từ 7.1 đến 9.8 với bước nhảy 0.1
const generateRandomScore = () => {
    const min = 7.1;
    const max = 9.8;
    const step = 0.1;
    
    // Tạo mảng các giá trị có thể có
    const possibleValues = [];
    for (let i = min; i <= max; i += step) {
        possibleValues.push(Math.round(i * 10) / 10); // Làm tròn để tránh lỗi floating point
    }
    
    // Chọn ngẫu nhiên một giá trị
    const randomIndex = Math.floor(Math.random() * possibleValues.length);
    return possibleValues[randomIndex];
};

// Hàm random tất cả điểm trong bảng
const randomizeAllScores = (subjects, years, setGrades) => {
    const newGrades = {};
    
    subjects.forEach((subject, subjectIndex) => {
        newGrades[subjectIndex] = {};
        years.forEach((year, yearIndex) => {
            newGrades[subjectIndex][yearIndex] = {};
            year.fields.forEach((field) => {
                newGrades[subjectIndex][yearIndex][field.key] = generateRandomScore();
            });
        });
    });
    
    setGrades(newGrades);
};



const HighSchoolTranscript = () => {
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
    const [grades, setGrades] = useState({});
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
    const inputsRef = useRef([]);
    const queryClient = useQueryClient();

    const years = [
        {
            label: "Lớp 10",
            year: "grade10",
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
            fields: [{ label: "Học kỳ 1", key: "score1" }],
        },
    ];

    // Hàm random điểm
    const generateRandomScore = () => {
        const min = 7.1;
        const max = 9.8;
        const step = 0.1;
        
        const possibleValues = [];
        for (let i = min; i <= max; i += step) {
            possibleValues.push(Math.round(i * 10) / 10);
        }
        
        const randomIndex = Math.floor(Math.random() * possibleValues.length);
        return possibleValues[randomIndex];
    };

    // Hàm random tất cả điểm
    const handleRandomizeScores = () => {
        const newGrades = {};
        
        subjects.forEach((subject, subjectIndex) => {
            newGrades[subjectIndex] = {};
            years.forEach((year, yearIndex) => {
                newGrades[subjectIndex][yearIndex] = {};
                year.fields.forEach((field) => {
                    newGrades[subjectIndex][yearIndex][field.key] = generateRandomScore();
                });
            });
        });
        
        setGrades(newGrades);
        toast.success("Đã random tất cả điểm thành công!", {
            position: "top-right",
            autoClose: 2000,
        });
    };

    // Fetch subjects using React Query
    const { data: subjectsData, isLoading: isLoadingSubjectsData } = useQuery({
        queryKey: ['subjects'],
        queryFn: async () => {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/subjects`);
            if (response.data.success) {
                return response.data.data.map(subject => subject.subject);
            }
            throw new Error("Failed to fetch subjects");
        },
        onError: (error) => {
            console.error("Lỗi khi lấy danh sách môn học:", error);
            toast.error("Không thể tải danh sách môn học. Vui lòng thử lại.");
        }
    });

    // Update subjects when data is fetched
    useEffect(() => {
        if (subjectsData) {
            setSubjects(subjectsData);
        }
    }, [subjectsData]);

    // Fetch transcript using React Query
    const { data: transcriptData } = useQuery({
        queryKey: ['transcript', userId],
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/transcripts/getTranscriptByE/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        },
        enabled: !!userId && !!token && subjects.length > 0,
        staleTime: 5 * 60 * 1000,
    });

    // Update grades when transcript data is fetched
    useEffect(() => {
        if (transcriptData?.data?.scores) {
            const apiScores = transcriptData.data.scores;
            const initialGrades = {};
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
        }
    }, [transcriptData]);

    // Update mutation using React Query
    const updateMutation = useMutation({
        mutationFn: async (scores) => {
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/transcripts/update/${userId}`,
                { scores },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['transcript', userId]);
            toast.success("Cập nhật học bạ thành công!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        },
        onError: (error) => {
            console.error("Error updating transcript:", error);
            toast.error(error.message || "Cập nhật học bạ thất bại. Vui lòng thử lại.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const scores = {};
            subjects.forEach((subject, subjectIndex) => {
                const subjectScores = [];
                years.forEach((year, yearIndex) => {
                    year.fields.forEach((field) => {
                        const score = grades?.[subjectIndex]?.[yearIndex]?.[field.key];
                        if (score === undefined || score === "" || isNaN(score)) {
                            throw new Error("Vui lòng nhập đầy đủ và hợp lệ tất cả điểm!");
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
            updateMutation.mutate(scores);
        } catch (error) {
            toast.error(error.message || "Vui lòng kiểm tra lại thông tin!", {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    if (isLoadingSubjectsData) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Học bạ THPT</h1>
                <div className="flex justify-center items-center py-10">
                    <div className="text-lg text-gray-600">🔄 Đang tải danh sách môn học...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Học bạ THPT</h1>

            {/* Buttons */}
            <div className="mb-4 flex gap-2">
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                    onClick={handleRandomizeScores}
                    disabled={subjects.length === 0}
                >
                    🎲 Random
                </button>
            </div>

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
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? "Đang xử lý..." : "Cập nhật"}
                </button>
            </div>
        </div>
    );
};

export default HighSchoolTranscript;