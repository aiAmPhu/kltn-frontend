import { useState, useEffect } from "react";
import axios from "axios";

const PhotoID = () => {
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
    const [personalPic, setPersonalPic] = useState(null);
    const [birthCertificate, setBirthCertificate] = useState(null);
    const [frontCCCD, setFrontCCCD] = useState(null);
    const [backCCCD, setBackCCCD] = useState(null);
    const [grade10Pic, setGrade10Pic] = useState(null);
    const [grade11Pic, setGrade11Pic] = useState(null);
    const [grade12Pic, setGrade12Pic] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gọi API để lấy danh sách thông tin từ cơ sở dữ liệu
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/photo/getPhoto/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response) {
                    // Nếu tìm thấy, cập nhật formData
                    setPersonalPic(response.data.data.personalPic);
                    setBirthCertificate(response.data.data.birthCertificate);
                    setFrontCCCD(response.data.data.frontCCCD);
                    setBackCCCD(response.data.data.backCCCD);
                    setGrade10Pic(response.data.data.grade10Pic);
                    setGrade11Pic(response.data.data.grade11Pic);
                    setGrade12Pic(response.data.data.grade12Pic);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [token, userId]);
    const handleUpload = async (fieldName, file, setFileUrl) => {
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/upload/`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFileUrl(res.data.imageUrl); // Cập nhật URL ảnh trả về từ server
            console.log(`${fieldName} uploaded successfully:`, res.data.imageUrl);
        } catch (err) {
            console.error(`Error uploading ${fieldName}:`, err);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        updateInformation();
    };
    const updateInformation = async () => {
        console.log("Updating information...");
        console.log("Personal Pic:", personalPic);
        const updateData = {
            personalPic,
            birthCertificate,
            frontCCCD,
            backCCCD,
            grade10Pic,
            grade11Pic,
            grade12Pic,
        };
        try {
            if (userId) {
                // Gửi yêu cầu cập nhật
                const updateResponse = await axios.put(
                    `${process.env.REACT_APP_API_BASE_URL}/photo/update/${userId}`,
                    updateData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
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
    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-blue-600">Hồ sơ ảnh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                {[
                    { label: "Ảnh thẻ 3x4", file: personalPic, setFile: setPersonalPic },
                    { label: "Giấy khai sinh", file: birthCertificate, setFile: setBirthCertificate },
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
                                <img
                                    src={typeof file === "string" ? file : URL.createObjectURL(file)}
                                    alt={label}
                                    className="w-32 h-32 rounded-lg shadow-md object-cover"
                                />
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
                    Cập nhật
                </button>
            </div>
        </div>
    );
};

export default PhotoID;
