import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
function ChangePassword() {
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmNewPassword) {
            setMessage("Mật khẩu mới và xác nhận không khớp.");
            return;
        }
        try {
            const res = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/users/changePassword/${userId}`,
                {
                    oldPassword: form.oldPassword,
                    newPassword: form.newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success(res.data.message || "Đổi mật khẩu thành công");
            localStorage.removeItem("token"); // nếu bạn muốn user phải login lại
            navigate("/login");
        } catch (err) {
            console.error("Lỗi khi đổi mật khẩu:", err.response.data);
            setMessage(err.response?.data?.message || "Đổi mật khẩu thất bại.");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-24 p-6 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Đổi mật khẩu</h2>
            {message && <div className="mb-4 text-sm text-red-600">{message}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">Mật khẩu hiện tại</label>
                    <input
                        type="password"
                        name="oldPassword"
                        value={form.oldPassword}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Mật khẩu mới</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Xác nhận mật khẩu mới</label>
                    <input
                        type="password"
                        name="confirmNewPassword"
                        value={form.confirmNewPassword}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Đổi mật khẩu
                </button>
            </form>
        </div>
    );
}

export default ChangePassword;
