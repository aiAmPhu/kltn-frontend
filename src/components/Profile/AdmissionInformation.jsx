import { useState, useEffect } from "react";
import axios from "axios";
const AdmissionInformation = () => {
    const token = localStorage.getItem("token");
    const tokenUser = token ? JSON.parse(atob(token.split(".")[1])) : null;
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        birthDate: "",
        gender: "Nam",
        birthPlace: "",
        phone: "",
        email: tokenUser.email,
        parentEmail: "",
        idNumber: "",
        idIssueDate: "",
        idIssuePlace: "",
        province: "",
        district: "",
        commune: "",
        houseNumber: "",
        streetName: "",
        status: "",
        address: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!token || tokenUser?.role !== "user") {
            // If no token or role is not admin, redirect to login
            window.location.href = "/404";
        }
        const fetchData = async () => {
            try {
                // Gọi API để lấy danh sách thông tin từ cơ sở dữ liệu
                const response = await axios.get("http://localhost:8080/api/adis/getAll");

                // Tìm kiếm thông tin dựa trên tokenUser.email
                const userAdInfo = response.data.data.find((item) => item.email === tokenUser.email);
                setUser(userAdInfo);
                //const userAdInfo = response.data.items?.find((item) => item.email === tokenUser.email);

                if (userAdInfo) {
                    // Nếu tìm thấy, cập nhật formData
                    setFormData({
                        firstName: userAdInfo.firstName,
                        lastName: userAdInfo.lastName,
                        birthDate: formatDate(userAdInfo.birthDate),
                        gender: userAdInfo.gender,
                        //birthPlace: userAdInfo.birthPlace,
                        birthPlace: userAdInfo.birthPlace,
                        phone: userAdInfo.phone,
                        email: userAdInfo.email || tokenUser.email,
                        parentEmail: userAdInfo.parentEmail,
                        idNumber: userAdInfo.idNumber,
                        idIssueDate: formatDate(userAdInfo.idIssueDate),
                        idIssuePlace: userAdInfo.idIssuePlace,
                        province: userAdInfo.province,
                        district: userAdInfo.district,
                        commune: userAdInfo.commune,
                        houseNumber: userAdInfo.houseNumber,
                        streetName: userAdInfo.streetName,
                        address: userAdInfo.address,
                        status: userAdInfo.status,
                    });
                    setIsEditing(true);
                } else {
                    // Nếu không tìm thấy, đặt formData là giá trị mặc định
                    setFormData({
                        firstName: "",
                        lastName: "",
                        birthDate: "",
                        gender: "Nam",
                        birthPlace: "",
                        phone: "",
                        email: tokenUser.email,
                        parentEmail: "",
                        idNumber: "",
                        idIssueDate: "",
                        idIssuePlace: "",
                        province: "",
                        district: "",
                        commune: "",
                        houseNumber: "",
                        streetName: "",
                        address: "",
                    });
                    setIsEditing(false);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                // Nếu xảy ra lỗi, đặt các giá trị là null
                setFormData({
                    firstName: "",
                    lastName: "",
                    birthDate: "",
                    gender: "Nam",
                    birthPlace: "",
                    phone: "",
                    email: tokenUser.email,
                    parentEmail: "",
                    idNumber: "",
                    idIssueDate: "",
                    idIssuePlace: "",
                    province: "",
                    district: "",
                    commune: "",
                    houseNumber: "",
                    streetName: "",
                    address: "",
                });
                setIsEditing(false);
            }
        };

        // Gọi hàm fetchData
        fetchData();
    }, [tokenUser.email]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Ngăn không gửi form
            const form = e.target.form;
            const index = Array.prototype.indexOf.call(form, e.target);
            if (index < form.elements.length - 1) {
                form.elements[index + 1]?.focus(); // Chuyển focus sang input kế tiếp
            } else {
                e.target.blur(); // Nếu ở trường cuối, bỏ focus (hoặc submit form)
            }
        }
    };
    const handleSubmit = async (e) => {
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
        let newErrors = {}; // Lưu các lỗi mới

        // Kiểm tra từng trường trong formData
        Object.keys(formData).forEach((field) => {
            const value = formData[field];
            switch (field) {
                case "firstName":
                    if (!value) newErrors.firstName = "Họ và Họ đệm là bắt buộc.";
                    break;
                case "lastName":
                    if (!value) newErrors.lastName = "Tên là bắt buộc.";
                    break;
                case "birthDate":
                    if (!value) newErrors.birthDate = "Ngày sinh là bắt buộc.";
                    break;
                case "address":
                    if (!value) newErrors.address = "Địa chỉ là bắt buộc.";
                    break;
                case "birthPlace":
                    if (!value) newErrors.birthPlace = "Nơi sinh là bắt buộc";
                    break;
                case "phone":
                    if (!value || !/^[0-9]{10}$/.test(value)) newErrors.phone = "Số điện thoại phải nhập đủ 10 số.";
                    break;
                // case "email":
                //     if (!value || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))
                //         newErrors.email = "Email không hợp lệ.";
                //     break;
                case "idNumber":
                    if (!value || !/^[0-9]{9,12}$/.test(value))
                        newErrors.idNumber = "CMND/CCCD phải là số từ 9 đến 12 ký tự.";
                    break;
                case "idIssueDate":
                    if (!value) newErrors.idIssueDate = "Ngày cấp CMND/CCCD là bắt buộc.";
                    break;
                case "idIssuePlace":
                    if (!value) newErrors.idIssuePlace = "Nơi cấp CMND/CCCD là bắt buộc.";
                    break;
                case "province":
                    if (!value) newErrors.province = "Tỉnh/Thành phố là bắt buộc.";
                    break;
                case "district":
                    if (!value) newErrors.district = "Huyện/Quận là bắt buộc.";
                    break;
                case "commune":
                    if (!value) newErrors.commune = "Xã/Phường là bắt buộc.";
                    break;
                case "houseNumber":
                    if (!value) newErrors.houseNumber = "Số nhà là bắt buộc.";
                    break;
                case "streetName":
                    if (!value) newErrors.streetName = "Tên đường là bắt buộc.";
                    break;
                default:
                    break;
            }
        });

        setErrors(newErrors); // Cập nhật các lỗi

        // Kiểm tra nếu không có lỗi
        if (Object.keys(newErrors).length === 0) {
            try {
                await axios.post("http://localhost:8080/api/adis/add", formData);

                alert("Data added successfully!");
                setIsEditing(false);
            } catch (error) {
                console.error("Error while submitting data:", error.message);
                alert(error.message || "Failed to add data. Please try again.");
            }
            // Tiến hành xử lý dữ liệu (gửi lên server hoặc tiếp tục logic khác)
        } else {
            console.log("Form có lỗi:", newErrors);
        }
    };
    const updateInformation = async () => {
        let newErrors = {}; // Lưu các lỗi mới

        // Kiểm tra từng trường trong formData
        Object.keys(formData).forEach((field) => {
            const value = formData[field];
            switch (field) {
                case "firstName":
                    if (!value) newErrors.firstName = "Họ và Họ đệm là bắt buộc.";
                    break;
                case "lastName":
                    if (!value) newErrors.lastName = "Tên là bắt buộc.";
                    break;
                case "birthDate":
                    if (!value) newErrors.birthDate = "Ngày sinh là bắt buộc.";
                    break;
                case "address":
                    if (!value) newErrors.address = "Địa chỉ là bắt buộc.";
                    break;
                case "birthPlace":
                    if (!value) newErrors.birthPlace = "Nơi sinh là bắt buộc";
                    break;
                case "phone":
                    if (!value || !/^[0-9]{10}$/.test(value)) newErrors.phone = "Số điện thoại phải nhập đủ 10 số.";
                    break;
                // case "email":
                //     if (!value || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))
                //         newErrors.email = "Email không hợp lệ.";
                //     break;
                case "idNumber":
                    if (!value || !/^[0-9]{9,12}$/.test(value))
                        newErrors.idNumber = "CMND/CCCD phải là số từ 9 đến 12 ký tự.";
                    break;
                case "idIssueDate":
                    if (!value) newErrors.idIssueDate = "Ngày cấp CMND/CCCD là bắt buộc.";
                    break;
                case "idIssuePlace":
                    if (!value) newErrors.idIssuePlace = "Nơi cấp CMND/CCCD là bắt buộc.";
                    break;
                case "province":
                    if (!value) newErrors.province = "Tỉnh/Thành phố là bắt buộc.";
                    break;
                case "district":
                    if (!value) newErrors.district = "Huyện/Quận là bắt buộc.";
                    break;
                case "commune":
                    if (!value) newErrors.commune = "Xã/Phường là bắt buộc.";
                    break;
                case "houseNumber":
                    if (!value) newErrors.houseNumber = "Số nhà là bắt buộc.";
                    break;
                case "streetName":
                    if (!value) newErrors.streetName = "Tên đường là bắt buộc.";
                    break;
                default:
                    break;
            }
        });

        setErrors(newErrors); // Cập nhật các lỗi

        // Kiểm tra nếu không có lỗi
        try {
            if (user) {
                // Gửi yêu cầu cập nhật
                const updateResponse = await axios.put(`http://localhost:8080/api/adis/update/${user._id}`, formData);
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
    const formatDate = (date) => {
        const d = new Date(date);
        return d.toISOString().split("T")[0]; // Lấy phần trước "T", tạo ra định dạng "YYYY-MM-DD"
    };
    const isFormValid = () => {
        // Kiểm tra xem tất cả giá trị trong formData có phải là chuỗi không rỗng
        return Object.values(formData).every((value) => value.trim() !== "");
    };
    return (
        <div className="flex-1 p-6">
            <section className="mb-8">
                <h1 className="text-3xl font-bold text-center text-blue-600 flex-grow">Thông tin xét tuyển</h1>

                <form className="bg-white shadow-md rounded-lg p-6 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Họ và Họ đệm</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập họ và họ đệm"
                            />
                            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Tên</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập tên"
                            />
                            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Ngày sinh</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Giới tính</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>Nam</option>
                                <option>Nữ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Nơi sinh</label>
                            <input
                                type="text"
                                name="birthPlace"
                                value={formData.birthPlace}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập nơi sinh"
                            />
                            {errors.birthPlace && <p className="text-red-500 text-sm">{errors.birthPlace}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập số điện thoại"
                            />
                            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                        </div>
                    </div>

                    {/* Additional form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                //onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                //placeholder="Nhập email"
                                disabled
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Email phụ huynh</label>
                            <input
                                type="email"
                                name="parentEmail"
                                value={formData.parentEmail}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập email phụ huynh"
                            />
                            {errors.parentEmail && <p className="text-red-500 text-sm">{errors.parentEmail}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">CMND/CCCD</label>
                            <input
                                type="text"
                                name="idNumber"
                                value={formData.idNumber}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập số CMND/CCCD"
                            />
                            {errors.idNumber && <p className="text-red-500 text-sm">{errors.idNumber}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Ngày cấp CMND/CCCD</label>
                            <input
                                type="date"
                                name="idIssueDate"
                                value={formData.idIssueDate}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.idIssueDate && <p className="text-red-500 text-sm">{errors.idIssueDate}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Nơi cấp CMND/CCCD</label>
                            <select
                                type="text"
                                name="idIssuePlace"
                                value={formData.idIssuePlace}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg  p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                //placeholder="Nhập nơi cấp"
                            >
                                <option value="" disabled>
                                    Nhập nơi cấp
                                </option>
                                <option>CỤC TRƯỞNG CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI</option>
                                <option>BỘ CÔNG AN</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Tỉnh (Thành phố)</label>
                            <input
                                type="text"
                                name="province"
                                value={formData.province}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập tỉnh/thành phố"
                            />
                            {errors.province && <p className="text-red-500 text-sm">{errors.province}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Huyện (Quận)</label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập huyện/quận"
                            />
                            {errors.district && <p className="text-red-500 text-sm">{errors.district}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Xã (Phường)</label>
                            <input
                                type="text"
                                name="commune"
                                value={formData.commune}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập xã/phường"
                            />
                            {errors.commune && <p className="text-red-500 text-sm">{errors.commune}</p>}
                        </div>
                    </div>

                    {/* Địa chỉ báo tin */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Địa chỉ báo tin</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập địa chỉ báo tin"
                        />
                        {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                    </div>

                    {/* Số nhà và Tên đường (thôn, xóm, ấp) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Số nhà</label>
                            <input
                                type="text"
                                name="houseNumber"
                                value={formData.houseNumber}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập số nhà"
                            />
                            {errors.houseNumber && <p className="text-red-500 text-sm">{errors.houseNumber}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Tên đường (thôn, xóm, ấp)</label>
                            <input
                                type="text"
                                name="streetName"
                                value={formData.streetName}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập tên đường (thôn, xóm, ấp)"
                            />
                            {errors.streetName && <p className="text-red-500 text-sm">{errors.streetName}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition duration-200"
                    >
                        {isEditing ? "Cập nhật" : "Gửi thông tin"}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default AdmissionInformation;