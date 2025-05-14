import { useState, useEffect } from "react";
import axios from "axios";

const LearningProcess = () => {
    const token = localStorage.getItem("token");
    const tokenUser = token ? JSON.parse(atob(token.split(".")[1])) : null;
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState({});
    const [user, setUser] = useState({});
    const [schools, setSchools] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        grade10: { province: "", district: "", school: "" },
        grade11: { province: "", district: "", school: "" },
        grade12: { province: "", district: "", school: "" },
        graduationYear: "",
        email: tokenUser.email,
        priorityGroup: "",
    });
    const [errors, setErrors] = useState({
        grade10: {},
        grade11: {},
        grade12: {},
        graduationYear: "",
        priorityGroup: "",
    });

    // Fetch provinces on initial render
    useEffect(() => {
        let isFetched = false;
        if (!token || tokenUser?.role !== "user") {
            // If no token or role is not admin, redirect to login
            window.location.href = "/404";
        }

        const fetchData = async () => {
            try {
                // Gọi API để lấy danh sách thông tin từ cơ sở dữ liệu
                const response = await axios.get("http://localhost:8080/api/learning/getAll");

                // Tìm kiếm thông tin dựa trên tokenUser.email
                const userLP = response.data.data.find((item) => item.email === tokenUser.email);
                setUser(userLP);
                //const userAdInfo = response.data.items?.find((item) => item.email === tokenUser.email);

                if (!isFetched && userLP) {
                    // Nếu tìm thấy, cập nhật formData
                    setFormData({
                        grade10: userLP.grade10,
                        grade11: userLP.grade11,
                        grade12: userLP.grade12,
                        graduationYear: userLP.graduationYear,
                        priorityGroup: userLP.priorityGroup,
                        email: userLP.email,
                    });
                    setIsEditing(true);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
        return () => {
            isFetched = true; // Hủy bỏ nếu component bị unmount
        };
    }, [tokenUser.email]);
    const handleInputChange = (event, grade, field) => {
        const value = event.target.value;
        setFormData((prev) => ({
            ...prev,
            [grade]: {
                ...prev[grade],
                [field]: value,
            },
        }));
    };

    // Validate form data
    const validateForm = () => {
        const newErrors = { grade10: {}, grade11: {}, grade12: {}, graduationYear: "", priorityGroup: "" };

        ["grade10", "grade11", "grade12"].forEach((grade) => {
            if (!formData[grade].province) {
                newErrors[grade].province = "Vui lòng chọn Tỉnh/Thành phố.";
            }
            if (!formData[grade].district) {
                newErrors[grade].district = "Vui lòng chọn Huyện/Quận.";
            }
            if (!formData[grade].school) {
                newErrors[grade].school = "Vui lòng chọn Trường THPT.";
            }
        });

        if (!formData.priorityGroup) {
            newErrors.priorityGroup = "Vui lòng chọn Đối Tượng Ưu Tiên.";
        }

        setErrors(newErrors);
        return Object.values(newErrors).every((gradeErrors) =>
            typeof gradeErrors === "object" ? Object.keys(gradeErrors).length === 0 : !gradeErrors
        );
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Ngăn không cho trang bị load lại
        if (validateForm()) {
            if (isEditing) {
                updateInformation();
            } else {
                submitInformation();
            }
        } else {
            alert("Vui lòng kiểm tra lại thông tin nhập!");
        }
    };
    const submitInformation = async () => {
        if (validateForm()) {
            try {
                console.log(formData);
                // Make a POST request with the form data
                await axios.post("http://localhost:8080/api/learning/add", formData);

                // Notify the user of success
                alert("Data added successfully!");

                // Reset the editing state or perform any other necessary actions
                setIsEditing(false); // Assuming `setIsEditing` is a state function in your component
            } catch (error) {
                // Handle and log the error, provide feedback to the user
                console.error("Error while submitting data:", error.message);
                alert(error.message || "Failed to add data. Please try again.");
            }
        } else {
            alert("Vui lòng kiểm tra lại thông tin nhập!");
        }
    };
    const updateInformation = async () => {
        // Kiểm tra nếu không có lỗi
        try {
            if (user) {
                // Gửi yêu cầu cập nhật
                const updateResponse = await axios.put(
                    `http://localhost:8080/api/learning/update/${user._id}`,
                    formData
                );
                // Thông báo thành công
                alert(updateResponse.data.message || "Data updated successfully!");
            } else {
                alert("No data available.");
            }
        } catch (error) {
            console.error("Error while submitting data:", error.response?.data?.message || error.message);
            alert("Failed to update data. Please try again.");
        }
    };
    // Render inputs for each grade
    const renderGradeInputs = (grade) => (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Lớp {grade}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tỉnh/Thành phố */}
                <div>
                    <label className="block font-medium mb-1 text-gray-700">Tỉnh/Thành phố</label>
                    <input
                        type="text"
                        value={formData[`grade${grade}`]?.province || ""}
                        onChange={(e) => handleInputChange(e, `grade${grade}`, "province")}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Nhập Tỉnh/Thành phố"
                    />
                    {errors[`grade${grade}`]?.province && (
                        <p className="text-red-500 text-sm">{errors[`grade${grade}`].province}</p>
                    )}
                </div>

                {/* Huyện/Quận */}
                <div>
                    <label className="block font-medium mb-1 text-gray-700">Huyện/Quận</label>
                    <input
                        type="text"
                        value={formData[`grade${grade}`].district}
                        onChange={(e) => handleInputChange(e, `grade${grade}`, "district")}
                        //onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Nhập Huyện/Quận"
                    />
                    {errors[`grade${grade}`]?.district && (
                        <p className="text-red-500 text-sm">{errors[`grade${grade}`].district}</p>
                    )}
                </div>

                {/* Trường THPT */}
                <div>
                    <label className="block font-medium mb-1 text-gray-700">Trường THPT</label>
                    <input
                        type="text"
                        value={formData[`grade${grade}`].school}
                        onChange={(e) => handleInputChange(e, `grade${grade}`, "school")}
                        //onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                        disabled={!formData[`grade${grade}`].district}
                        className={`w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                            !formData[`grade${grade}`].district
                                ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                : "border-gray-300"
                        }`}
                        placeholder="Nhập trường THPT"
                    />
                    {errors[`grade${grade}`]?.school && (
                        <p className="text-red-500 text-sm">{errors[`grade${grade}`].school}</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 p-6">
            <section className="mb-8">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Quá Trình Học Tập Của Thí Sinh</h1>
                <div className="p-8 bg-white rounded-lg shadow-xl max-w-4xl mx-auto">
                    {["10", "11", "12"].map((grade) => renderGradeInputs(grade))}

                    <div className="mb-6">
                        <label className="block font-medium mb-1 text-gray-700">Đối Tượng Ưu Tiên</label>
                        <select
                            value={formData.priorityGroup}
                            onChange={(e) => setFormData({ ...formData, priorityGroup: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">Chọn đối tượng ưu tiên</option>
                            <option value="DT1">Nhóm 1</option>
                            <option value="DT2">Nhóm 2</option>
                            <option value="DT3">Nhóm 3</option>
                            <option value="DT4">Nhóm 4</option>
                            <option value="DT5">Nhóm 5</option>
                            <option value="DT6">Nhóm 6</option>
                            <option value="DT7">Nhóm 7</option>
                        </select>
                        {errors.priorityGroup && <p className="text-red-500 text-sm">{errors.priorityGroup}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block font-medium mb-1 text-gray-700">Năm tốt ngiệp</label>
                        <input
                            type="number"
                            value={formData.graduationYear}
                            onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Năm tốt nghiệp"
                        />
                        {errors.priorityReason && <p className="text-red-500 text-sm">{errors.priorityReason}</p>}
                    </div>
                    <button
                        type="button"
                        className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition duration-200"
                        onClick={handleSubmit}
                    >
                        {isEditing ? "Cập nhật" : "Gửi thông tin"}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default LearningProcess;