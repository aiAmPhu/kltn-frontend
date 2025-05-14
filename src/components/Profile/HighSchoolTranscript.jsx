import { useState, useRef, useEffect } from "react";
import axios from "axios";

const HighSchoolTranscript = () => {
    const token = localStorage.getItem("token");
    const tokenUser = token ? JSON.parse(atob(token.split(".")[1])) : null;
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [grades, setGrades] = useState({});
    const [errors, setErrors] = useState({});
    const inputsRef = useRef([]);
    const subjects = [
        "Toán",
        "Vật lý",
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
        { label: "Lớp 10", color: "bg-green-100", fields: ["học kỳ 1", "học kỳ 2"] },
        { label: "Lớp 11", color: "bg-blue-100", fields: ["học kỳ 1", "học kỳ 2"] },
        { label: "Lớp 12", color: "bg-red-100", fields: ["học kỳ 1"] },
    ];

    // Sử dụng useEffect để lấy dữ liệu từ API
    useEffect(() => {
        const fetchTranscript = async () => {
            try {
                if (tokenUser?.email) {
                    // Gọi API lấy danh sách học bạ
                    const response = await axios.get("http://localhost:8080/api/transcripts/getAll");
                    const transcripts = response.data; // Giả định API trả về mảng transcripts

                    // Tìm học bạ theo email
                    //const userTranscript = transcripts.find((item) => item.email === tokenUser.email);
                    const userTranscript = transcripts.data.find((item) => item.email === tokenUser.email);
                    setUser(userTranscript);

                    if (userTranscript) {
                        // Đổ dữ liệu học bạ vào state grades
                        const initialGrades = {};

                        userTranscript.subjects.forEach((subject, subjectIndex) => {
                            initialGrades[subjectIndex] = {};
                            subject.scores.forEach((score) => {
                                const yearIndex = years.findIndex((y) => y.label === score.year);
                                const semesterField = score.semester;

                                if (!initialGrades[subjectIndex][yearIndex]) {
                                    initialGrades[subjectIndex][yearIndex] = {};
                                }

                                initialGrades[subjectIndex][yearIndex][semesterField] = score.score;
                            });
                        });
                        setIsEditing(true);
                        setGrades(initialGrades);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy học bạ:", error);
            }
        };

        fetchTranscript();
    }, [tokenUser.email]);

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

    const calculateAverage5Semesters = (subjectIndex) => {
        if (!grades) return "0.0";

        let totalScore = 0;
        let count = 0;

        years.forEach((year, yearIndex) => {
            year.fields.forEach((field) => {
                const score = grades[subjectIndex]?.[yearIndex]?.[field] || 0;
                totalScore += score;
                count++;
            });
        });

        return count > 0 ? (totalScore / count).toFixed(2) : "0.0";
    };

    const handleSaveTranscript = async (e) => {
        e.preventDefault();
        // Kiểm tra nếu tất cả trường dữ liệu hợp lệ
        if (isEditing) {
            // Logic cho "Cập nhật" khi tất cả trường có dữ liệu
            updateInformation();
        } else {
            // Logic cho "Gửi thông tin" khi có trường thiếu
            submitInformation();
        }
    };
    const submitInformation = async () => {
        try {
            let isValid = true;
            // Chuẩn bị dữ liệu gửi lên API
            const data = {
                email: tokenUser.email, // Lấy email từ tokenUser
                subjects: subjects.map((subject, subjectIndex) => {
                    // Tính điểm trung bình cho từng môn học
                    let totalScore = 0;
                    let count = 0;

                    years.forEach((year, yearIndex) => {
                        year.fields.forEach((field) => {
                            const score = grades[subjectIndex]?.[yearIndex]?.[field] || 0;
                            if (score === 0) {
                                isValid = false; // Đánh dấu là không hợp lệ
                            }
                            totalScore += score;
                            count++;
                        });
                    });

                    const averageScore = count > 0 ? (totalScore / count).toFixed(2) : "0.0";

                    // Chuẩn bị dữ liệu từng môn học
                    return {
                        subject,
                        averageScore, // Thêm điểm trung bình vào subject
                        scores: years.flatMap((year, yearIndex) =>
                            year.fields.map((field) => ({
                                year: year.label,
                                semester: field,
                                score: grades[subjectIndex]?.[yearIndex]?.[field] || 0,
                            }))
                        ),
                    };
                }),
            };
            if (!isValid) {
                alert("Fill total info");
                return; // Dừng thực hiện nếu có trường không hợp lệ
            }
            console.log("Data to send:", data);

            // Gửi dữ liệu lên API
            const response = await axios.post("http://localhost:8080/api/transcripts/add", data);
            alert("Lưu học bạ thành công!");
            console.log("Response:", response.data);
        } catch (error) {
            console.error("Lỗi khi lưu học bạ:", error);
            alert("Có lỗi xảy ra khi lưu học bạ.");
        }
    };
    const updateInformation = async () => {
        try {
            let isValid = true;
            // Chuẩn bị dữ liệu gửi lên API
            const data = {
                email: tokenUser.email, // Lấy email từ tokenUser
                subjects: subjects.map((subject, subjectIndex) => {
                    // Tính điểm trung bình cho từng môn học
                    let totalScore = 0;
                    let count = 0;

                    years.forEach((year, yearIndex) => {
                        year.fields.forEach((field) => {
                            const score = grades[subjectIndex]?.[yearIndex]?.[field] || 0;
                            if (score === 0) {
                                isValid = false; // Đánh dấu là không hợp lệ
                            }
                            totalScore += score;
                            count++;
                        });
                    });

                    const averageScore = count > 0 ? (totalScore / count).toFixed(2) : "0.0";

                    // Chuẩn bị dữ liệu từng môn học
                    return {
                        subject,
                        averageScore, // Thêm điểm trung bình vào subject
                        scores: years.flatMap((year, yearIndex) =>
                            year.fields.map((field) => ({
                                year: year.label,
                                semester: field,
                                score: grades[subjectIndex]?.[yearIndex]?.[field] || 0,
                            }))
                        ),
                    };
                }),
            };
            if (!isValid) {
                alert("Fill total info");
                return; // Dừng thực hiện nếu có trường không hợp lệ
            }
            console.log("Data to send:", data);

            // Gửi dữ liệu lên API
            const response = await axios.put("http://localhost:8080/api/transcripts/update", data);
            alert("Cập nhật học bạ thành công!");
            console.log("Response:", response.data);
        } catch (error) {
            console.error("Lỗi khi cập nhật học bạ:", error);
            alert("Có lỗi xảy ra khi lưu học bạ.");
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
                                    {field}
                                </th>
                            ))
                        )}
                        <th className="border border-gray-300 p-2 bg-yellow-100">TB 5 Học kỳ</th>
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
                                            value={grades?.[subjectIndex]?.[yearIndex]?.[field] ?? ""}
                                            onChange={(e) =>
                                                handleInputChange(subjectIndex, yearIndex, field, e.target.value)
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
                            <td className="border border-gray-300 p-2 text-center font-bold">
                                {calculateAverage5Semesters(subjectIndex)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 text-right">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={handleSaveTranscript}
                >
                    {isEditing ? "Cập nhật" : "Lưu thông tin học bạ"}
                </button>
            </div>
        </div>
    );
};

export default HighSchoolTranscript;