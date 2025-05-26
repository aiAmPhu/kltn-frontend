import { useState, useEffect } from "react";
import axios from "axios";
import { FaUpload, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    const [isLoading, setIsLoading] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/photo/getPhoto/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data.data) {
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
        if (!file) {
            toast.error("Vui lòng chọn file để tải lên", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: { marginTop: "60px" },
            });
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        try {
            setIsLoading((prev) => ({ ...prev, [fieldName]: true }));
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/upload/`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFileUrl(res.data.imageUrl);
            toast.success(`Tải lên ${fieldName} thành công!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: { marginTop: "60px" },
            });
            console.log(`${fieldName} uploaded successfully:`, res.data.imageUrl);
        } catch (err) {
            console.error(`Error uploading ${fieldName}:`, err);
            toast.error(`Tải lên ${fieldName} thất bại. Vui lòng thử lại.`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: { marginTop: "60px" },
            });
        } finally {
            setIsLoading((prev) => ({ ...prev, [fieldName]: false }));
        }
    };

    const updatePhotoID = async () => {
        try {
            setIsLoading((prev) => ({ ...prev, submit: true }));
            const updateData = {
                personalPic,
                birthCertificate,
                frontCCCD,
                backCCCD,
                grade10Pic,
                grade11Pic,
                grade12Pic,
            };
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/photo/update/${userId}`,
                updateData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success("Cập nhật hồ sơ ảnh thành công!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: { marginTop: "60px" },
            });
            return true;
        } catch (error) {
            console.error("Error updating photo ID:", error);
            toast.error("Cập nhật hồ sơ ảnh thất bại. Vui lòng thử lại.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: { marginTop: "60px" },
            });
            return false;
        } finally {
            setIsLoading((prev) => ({ ...prev, submit: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updatePhotoID();
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-blue-600">Hồ sơ ảnh</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                {[
                    { label: "Ảnh thẻ 3x4", file: personalPic, setFile: setPersonalPic, fieldName: "Ảnh thẻ 3x4" },
                    {
                        label: "Giấy khai sinh",
                        file: birthCertificate,
                        setFile: setBirthCertificate,
                        fieldName: "Giấy khai sinh",
                    },
                    { label: "Mặt trước CCCD", file: frontCCCD, setFile: setFrontCCCD, fieldName: "Mặt trước CCCD" },
                    { label: "Mặt sau CCCD", file: backCCCD, setFile: setBackCCCD, fieldName: "Mặt sau CCCD" },
                    {
                        label: "Điểm học bạ lớp 10",
                        file: grade10Pic,
                        setFile: setGrade10Pic,
                        fieldName: "Điểm học bạ lớp 10",
                    },
                    {
                        label: "Điểm học bạ lớp 11",
                        file: grade11Pic,
                        setFile: setGrade11Pic,
                        fieldName: "Điểm học bạ lớp 11",
                    },
                    {
                        label: "Điểm học bạ lớp 12",
                        file: grade12Pic,
                        setFile: setGrade12Pic,
                        fieldName: "Điểm học bạ lớp 12",
                    },
                ].map(({ label, file, setFile, fieldName }, index) => (
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
                                onClick={() => handleUpload(fieldName, file, setFile)}
                                disabled={isLoading[fieldName]}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                <FaUpload />
                                {isLoading[fieldName] ? "Đang tải..." : "Tải lên"}
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
                    disabled={isLoading.submit}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading.submit ? "Đang xử lý..." : "Cập nhật"}
                </button>
            </div>
        </div>
    );
};

export default PhotoID;
