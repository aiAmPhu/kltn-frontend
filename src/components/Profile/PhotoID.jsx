import { useState, useEffect } from "react";
import axios from "axios";

const PhotoID = () => {
    const token = localStorage.getItem("token");
    const tokenUser = token ? JSON.parse(atob(token.split(".")[1])) : null;
    const [personalPic, setPersonalPic] = useState(null);
    const [frontCCCD, setFrontCCCD] = useState(null);
    const [backCCCD, setBackCCCD] = useState(null);
    const [grade10Pic, setGrade10Pic] = useState(null);
    const [grade11Pic, setGrade11Pic] = useState(null);
    const [grade12Pic, setGrade12Pic] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        let isFetched = false;
        if (!token || tokenUser?.role !== "user") {
            // If no token or role is not admin, redirect to login
            window.location.href = "/404";
        }

        const fetchData = async () => {
            try {
                // Gọi API để lấy danh sách thông tin từ cơ sở dữ liệu
                const response = await axios.get("http://localhost:8080/api/photo/getAll");

                // Tìm kiếm thông tin dựa trên tokenUser.email
                const userPhoto = response.data.data.find((item) => item.email === tokenUser.email);
                setUser(userPhoto);
                //const userAdInfo = response.data.items?.find((item) => item.email === tokenUser.email);

                if (!isFetched && userPhoto) {
                    // Nếu tìm thấy, cập nhật formData
                    setPersonalPic(userPhoto.personalPic);
                    setFrontCCCD(userPhoto.frontCCCD);
                    setBackCCCD(userPhoto.backCCCD);
                    setGrade10Pic(userPhoto.grade10Pic);
                    setGrade11Pic(userPhoto.grade11Pic);
                    setGrade12Pic(userPhoto.grade12Pic);
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
    const handleUpload = async (fieldName, file, setFileUrl) => {
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await axios.post("http://localhost:8080/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setFileUrl(res.data.imageUrl); // Cập nhật URL ảnh trả về từ server
            console.log(`${fieldName} uploaded successfully:`, res.data.imageUrl);
        } catch (err) {
            console.error(`Error uploading ${fieldName}:`, err);
        }
    };
    const handleSubmit = async () => {
        if (isEditing) {
            updateInformation();
        } else {
            submitInformation();
        }
    };
    const submitInformation = async () => {
        const data = {
            personalPic,
            frontCCCD,
            backCCCD,
            grade10Pic,
            grade11Pic,
            grade12Pic,
            email: tokenUser.email,
        };

        // Kiểm tra nếu có bất kỳ giá trị nào là null hoặc undefined
        const missingFields = Object.entries(data)
            .filter(([key, value]) => !value) // Lọc các trường có giá trị null, undefined hoặc falsey
            .map(([key]) => key); // Lấy tên các trường bị thiếu

        if (missingFields.length > 0) {
            alert(`Please upload the following images: ${missingFields.join(", ")}`);
            return;
        }

        console.log("All images uploaded:", data);
        try {
            // Make a POST request with the form data
            await axios.post("http://localhost:8080/api/photo/add", data);
            alert("Data added successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Error while submitting data:", error.message);
            alert(error.message || "Failed to add data. Please try again.");
        }
    };
    const updateInformation = async () => {
        try {
            if (user) {
                const data = {
                    personalPic,
                    frontCCCD,
                    backCCCD,
                    grade10Pic,
                    grade11Pic,
                    grade12Pic,
                    email: tokenUser.email,
                };
                // Gửi yêu cầu cập nhật
                const updateResponse = await axios.put(`http://localhost:8080/api/photo/update/${user._id}`, data);
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
    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-blue-600">Hồ sơ ảnh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                {[
                    { label: "Ảnh thẻ 3x4", file: personalPic, setFile: setPersonalPic },
                    { label: "Mặt trước CCCD", file: frontCCCD, setFile: setFrontCCCD },
                    { label: "Mặt sau CCCD", file: backCCCD, setFile: setBackCCCD },
                    { label: "Điểm học bạ lớp 10", file: grade10Pic, setFile: setGrade10Pic },
                    { label: "Điểm học bạ lớp 11", file: grade11Pic, setFile: setGrade11Pic },
                    { label: "Điểm học bạ lớp 12", file: grade12Pic, setFile: setGrade12Pic },
                ].map(({ label, file, setFile }, index) => (
                    <div key={index} className="p-4 bg-white shadow-md rounded-lg flex flex-col items-center gap-4">
                        <label className="font-semibold text-gray-700">{label}</label>
                        <div className="flex flex-col items-center gap-2 w-full">
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                accept="image/*"
                                className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <button
                                type="button"
                                onClick={() => handleUpload(label, file, setFile)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                            >
                                Tải lên
                            </button>
                        </div>
                        {file && (
                            <div className="mt-4">
                                <img src={file} alt={label} className="w-32 h-32 rounded-lg shadow-md object-cover" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-8">
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                >
                    {isEditing ? "Cập nhật" : "Lưu thông tin"}
                </button>
            </div>
        </div>
    );
};

export default PhotoID;