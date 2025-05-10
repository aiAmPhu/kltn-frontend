import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const [status, setStatus] = useState("checking"); // checking | unauthorized | forbidden | authorized
    const location = useLocation();
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setStatus("unauthorized"); // Chưa đăng nhập
                return;
            }
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/jwt/verify`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const userRole = res.data.user.role;
                if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
                    setStatus("forbidden"); // Không đúng role
                } else {
                    setStatus("authorized");
                }
            } catch (err) {
                localStorage.removeItem("token");
                setStatus("unauthorized"); // Hết hạn hoặc token sai
            }
        };
        checkAuth();
    }, [allowedRoles]);
    if (status === "checking") return null; // loading spinner nếu muốn
    if (status === "authorized") return children;
    // Gửi state để trang chủ đọc và show toast
    return (
        <Navigate
            to="/"
            replace
            state={{
                from: location,
                error: status, // unauthorized | forbidden
            }}
        />
    );
};

export default ProtectedRoute;
