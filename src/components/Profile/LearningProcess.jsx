import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSchool, FaMapMarkerAlt, FaCity, FaCalendarAlt, FaFlag } from "react-icons/fa";

const LearningProcess = () => {
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
    const [formData, setFormData] = useState({
        grade10_province: "",
        grade10_district: "",
        grade10_school: "",
        grade11_province: "",
        grade11_district: "",
        grade11_school: "",
        grade12_province: "",
        grade12_district: "",
        grade12_school: "",
        graduationYear: "",
        region: "",
        priorityGroup: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const priorityGroupOptions = [
        { value: "OBJ001", label: "Ưu tiên khu vực miền núi" },
        { value: "OBJ002", label: "Không ưu tiên" },
    ];

    const regionOptions = [
        { value: "R001", label: "Miền Bắc" },
        { value: "R002", label: "Khu vực 1" },
        { value: "R003", label: "Khu vực 2" },
        { value: "R004", label: "Khu vực 2-NT" },
        { value: "R005", label: "Khu vực 3" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/learning/getLPByE/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data.data) {
                    const priorityGroupId = priorityGroupOptions.find(
                        (option) => option.label === response.data.data.priorityGroup
                    )?.value;
                    const regionId = regionOptions.find((option) => option.label === response.data.data.region)?.value;
                    setFormData({
                        grade10_province: response.data.data.grade10_province ?? "",
                        grade10_district: response.data.data.grade10_district ?? "",
                        grade10_school: response.data.data.grade10_school ?? "",
                        grade11_province: response.data.data.grade11_province ?? "",
                        grade11_district: response.data.data.grade11_district ?? "",
                        grade11_school: response.data.data.grade11_school ?? "",
                        grade12_province: response.data.data.grade12_province ?? "",
                        grade12_district: response.data.data.grade11_district ?? "",
                        grade12_school: response.data.data.grade12_school ?? "",
                        graduationYear: response.data.data.graduationYear ?? "",
                        priorityGroup: priorityGroupId ?? "",
                        region: regionId ?? "",
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [userId]);

    const validateForm = () => {
        const newErrors = {};
        ["grade10", "grade11", "grade12"].forEach((grade) => {
            ["province", "district", "school"].forEach((field) => {
                const key = `${grade}_${field}`;
                if (!formData[key]) {
                    newErrors[key] = `Vui lòng chọn ${
                        field === "province" ? "Tỉnh/Thành phố" : field === "district" ? "Huyện/Quận" : "Trường THPT"
                    }.`;
                }
            });
        });
        if (!formData.priorityGroup) {
            newErrors.priorityGroup = "Vui lòng chọn Đối Tượng Ưu Tiên.";
        }
        if (!formData.region) {
            newErrors.region = "Vui lòng chọn Khu Vực Ưu Tiên.";
        }
        if (!formData.graduationYear) {
            newErrors.graduationYear = "Vui lòng chọn Năm Tốt Nghiệp.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const updateLearningProcess = async () => {
        try {
            setIsLoading(true);
            await axios.put(`${process.env.REACT_APP_API_BASE_URL}/learning/update/${userId}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Cập nhật thông tin thành công!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return true;
        } catch (error) {
            console.error("Error updating learning process:", error);
            toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin!", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }
        await updateLearningProcess();
    };

    const renderGradeInputs = (grade) => (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Lớp {grade}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="font-medium mb-1 text-gray-700 flex items-center gap-2">
                        <FaCity className="text-blue-500" /> Tỉnh/Thành phố
                    </label>
                    <input
                        type="text"
                        value={formData[`grade${grade}_province`] || ""}
                        onChange={(e) => setFormData({ ...formData, [`grade${grade}_province`]: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Nhập Tỉnh/Thành phố"
                    />
                    {errors[`grade${grade}_province`] && (
                        <p className="text-red-500 text-sm">{errors[`grade${grade}_province`]}</p>
                    )}
                </div>

                <div>
                    <label className="font-medium mb-1 text-gray-700 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-blue-500" /> Huyện/Quận
                    </label>
                    <input
                        type="text"
                        value={formData[`grade${grade}_district`] || ""}
                        onChange={(e) => setFormData({ ...formData, [`grade${grade}_district`]: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Nhập Huyện/Quận"
                    />
                    {errors[`grade${grade}_district`] && (
                        <p className="text-red-500 text-sm">{errors[`grade${grade}_district`]}</p>
                    )}
                </div>

                <div>
                    <label className="font-medium mb-1 text-gray-700 flex items-center gap-2">
                        <FaSchool className="text-blue-500" /> Trường THPT
                    </label>
                    <input
                        type="text"
                        value={formData[`grade${grade}_school`] || ""}
                        onChange={(e) => setFormData({ ...formData, [`grade${grade}_school`]: e.target.value })}
                        disabled={!formData[`grade${grade}_district`]}
                        className={`w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                            !formData[`grade${grade}_district`]
                                ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                : "border-gray-300"
                        }`}
                        placeholder="Nhập trường THPT"
                    />
                    {errors[`grade${grade}_school`] && (
                        <p className="text-red-500 text-sm">{errors[`grade${grade}_school`]}</p>
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
                    {["10", "11", "12"].map((grade) => (
                        <React.Fragment key={grade}>{renderGradeInputs(grade)}</React.Fragment>
                    ))}

                    <div className="mb-6">
                        <label className="font-medium mb-1 text-gray-700 flex items-center gap-2">
                            <FaFlag className="text-blue-500" /> Đối Tượng Ưu Tiên
                        </label>
                        <select
                            value={formData.priorityGroup}
                            onChange={(e) => setFormData({ ...formData, priorityGroup: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">Chọn đối tượng ưu tiên</option>
                            {/* <option value="OBJ001">Nhóm 1</option>
                            <option value="OBJ002">Nhóm 2</option> */}
                            {priorityGroupOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.priorityGroup && <p className="text-red-500 text-sm">{errors.priorityGroup}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="font-medium mb-1 text-gray-700 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-blue-500" /> Khu vực ưu tiên
                        </label>
                        <select
                            value={formData.region}
                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">Chọn khu vực ưu tiên</option>
                            {/* <option value="R001">Khu vực 1</option>
                            <option value="R002">Khu vực 2</option>
                            <option value="R003">Khu vực 3</option>
                            <option value="R004">Khu vực 4</option>
                            <option value="R005">Khu vực 5</option> */}
                            {regionOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="font-medium mb-1 text-gray-700 flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-500" /> Năm tốt nghiệp
                        </label>
                        <input
                            type="number"
                            value={formData.graduationYear}
                            onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Năm tốt nghiệp"
                        />
                        {errors.graduationYear && <p className="text-red-500 text-sm">{errors.graduationYear}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition duration-200 disabled:opacity-50"
                    >
                        {isLoading ? "Đang xử lý..." : "Cập nhật"}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default LearningProcess;
