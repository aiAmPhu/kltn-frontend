import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    FaUser,
    FaCalendarAlt,
    FaVenusMars,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaIdCard,
    FaBuilding,
    FaHome,
    FaRoad,
    FaCheck,
} from "react-icons/fa";

const AdmissionInformation = () => {
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
    const tokenEmail = token ? JSON.parse(atob(token.split(".")[1])).email : null;
    const [errors, setErrors] = useState({});
    const queryClient = useQueryClient();

    const { data: admissionData, isLoading: isLoadingData } = useQuery({
        queryKey: ['admissionInfo', userId],
        queryFn: async () => {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adis/getAdi/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        },
        enabled: !!userId && !!token,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

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

    // Update form data when admission data is loaded
    useEffect(() => {
        if (admissionData) {
            setFormData({
                firstName: admissionData.firstName ?? "",
                lastName: admissionData.lastName ?? "",
                birthDate: formatDate(admissionData.birthDate) ?? "",
                gender: admissionData.gender ?? "Nam",
                birthPlace: admissionData.birthPlace ?? "",
                phone: admissionData.phone ?? "",
                email: admissionData.email || tokenEmail,
                parentEmail: admissionData.parentEmail ?? "",
                idNumber: admissionData.idNumber ?? "",
                idIssueDate: formatDate(admissionData.idIssueDate) ?? "",
                idIssuePlace: admissionData.idIssuePlace ?? "",
                province: admissionData.province ?? "",
                district: admissionData.district ?? "",
                commune: admissionData.commune ?? "",
                houseNumber: admissionData.houseNumber ?? "",
                streetName: admissionData.streetName ?? "",
                address: admissionData.address ?? "",
                status: admissionData.status ?? "",
            });
        }
    }, [admissionData, tokenEmail]);

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            const res = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/adis/update/${userId}`,
                data,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admissionInfo', userId]);
            toast.success("Cập nhật thông tin thành công!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        },
        onError: () => {
            toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        },
    });

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

    const validateForm = () => {
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
                case "gender":
                    if (!value || !["Nam", "Nữ"].includes(value)) {
                        newErrors.gender = "Vui lòng chọn giới tính.";
                    }
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
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            updateMutation.mutate(formData);
        } else {
            toast.error("Vui lòng kiểm tra lại thông tin!", {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
    };

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg">Đang tải thông tin...</span>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6">
            <section className="mb-8">
                <h1 className="text-3xl font-bold text-center text-blue-600 flex-grow mb-6">Thông tin xét tuyển</h1>

                <form className="bg-white shadow-md rounded-lg p-6 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaUser className="text-blue-500" />
                                Họ và Họ đệm
                            </label>
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
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaUser className="text-blue-500" />
                                Tên
                            </label>
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
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaCalendarAlt className="text-blue-500" />
                                Ngày sinh
                            </label>
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
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaVenusMars className="text-blue-500" />
                                Giới tính
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
                        </div>
                        <div>
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-blue-500" />
                                Nơi sinh
                            </label>
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
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaPhone className="text-blue-500" />
                                Số điện thoại
                            </label>
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
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaEnvelope className="text-blue-500" />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                        <div>
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaEnvelope className="text-green-500" />
                                Email phụ huynh
                            </label>
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
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaIdCard className="text-blue-500" />
                                CMND/CCCD
                            </label>
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
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaCalendarAlt className="text-blue-500" />
                                Ngày cấp CMND/CCCD
                            </label>
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

                        <div className="md:col-span-2">
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaBuilding className="text-blue-500" />
                                Nơi cấp CMND/CCCD
                            </label>
                            <select
                                name="idIssuePlace"
                                value={formData.idIssuePlace}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="" disabled>
                                    Nhập nơi cấp
                                </option>
                                <option>CỤC TRƯỞNG CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI</option>
                                <option>BỘ CÔNG AN</option>
                            </select>
                            {errors.idIssuePlace && <p className="text-red-500 text-sm">{errors.idIssuePlace}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-red-500" />
                                Tỉnh (Thành phố)
                            </label>
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
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-orange-500" />
                                Huyện (Quận)
                            </label>
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
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-green-500" />
                                Xã (Phường)
                            </label>
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
                        <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                            <FaHome className="text-purple-500" />
                            Địa chỉ báo tin
                        </label>
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
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaHome className="text-blue-500" />
                                Số nhà
                            </label>
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
                            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <FaRoad className="text-gray-500" />
                                Tên đường (thôn, xóm, ấp)
                            </label>
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
                        disabled={updateMutation.isLoading}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {updateMutation.isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <FaCheck />
                                Cập nhật
                            </>
                        )}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default AdmissionInformation;
