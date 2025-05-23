import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes } from "react-icons/fa";

const AdmissionInformation = () => {
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
    const tokenEmail = token ? JSON.parse(atob(token.split(".")[1])).email : null;
    const [user, setUser] = useState({});
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [hasData, setHasData] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        birthDate: "",
        gender: "Nam",
        birthPlace: "",
        phone: "",
        email: tokenEmail,
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adis/getAdi/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data) {
                    setUser(res.data);
                    setFormData({
                        firstName: res.data.firstName ?? "",
                        lastName: res.data.lastName ?? "",
                        birthDate: formatDate(res.data.birthDate) ?? "",
                        gender: res.data.gender ?? "",
                        birthPlace: res.data.birthPlace ?? "",
                        phone: res.data.phone ?? "",
                        email: res.data.email || tokenEmail,
                        parentEmail: res.data.parentEmail ?? "",
                        idNumber: res.data.idNumber ?? "",
                        idIssueDate: formatDate(res.data.idIssueDate) ?? "",
                        idIssuePlace: res.data.idIssuePlace ?? "",
                        province: res.data.province ?? "",
                        district: res.data.district ?? "",
                        commune: res.data.commune ?? "",
                        houseNumber: res.data.houseNumber ?? "",
                        streetName: res.data.streetName ?? "",
                        address: res.data.address ?? "",
                        status: res.data.status ?? "",
                    });
                    setHasData(true);
                } else {
                    setHasData(false);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setHasData(false);
            }
        };
        fetchData();
    }, [token, userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const form = e.target.form;
            const index = Array.prototype.indexOf.call(form, e.target);
            if (index < form.elements.length - 1) {
                form.elements[index + 1]?.focus();
            } else {
                e.target.blur();
            }
        }
    };

    const addInformation = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/adis/add`,
                {
                    userId,
                    ...formData
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setMessage({ type: 'success', text: 'Lưu thông tin thành công!' });
            setHasData(true);
            return true;
        } catch (error) {
            console.error("Error adding information:", error);
            setMessage({ type: 'error', text: 'Lưu thông tin thất bại. Vui lòng thử lại.' });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateInformation = async () => {
        let newErrors = {};
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

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setMessage({ type: 'error', text: 'Vui lòng kiểm tra lại thông tin!' });
            return false;
        }

        try {
            setIsLoading(true);
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/adis/update/${userId}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
            return true;
        } catch (error) {
            console.error("Error updating information:", error);
            setMessage({ type: 'error', text: 'Cập nhật thông tin thất bại. Vui lòng thử lại.' });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!hasData) {
            await addInformation();
        } else {
            await updateInformation();
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toISOString().split("T")[0];
    };

    return (
        <div className="flex-1 p-6">
            <section className="mb-8">
                <h1 className="text-3xl font-bold text-center text-blue-600 flex-grow">Thông tin xét tuyển</h1>

                {message.text && (
                    <div className={`w-full max-w-4xl mx-auto mb-6 p-4 rounded-lg ${
                        message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        <div className="flex items-center gap-2">
                            {message.type === 'success' ? <FaCheck /> : <FaTimes />}
                            <span>{message.text}</span>
                        </div>
                    </div>
                )}

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
                        disabled={isLoading}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition duration-200 disabled:opacity-50"
                    >
                        {isLoading ? 'Đang xử lý...' : hasData ? 'Cập nhật' : 'Lưu'}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default AdmissionInformation;
