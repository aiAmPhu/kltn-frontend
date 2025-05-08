import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const location = useLocation();
    const hasShownToast = useRef(false); // flag ngăn toast spam
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                if (!hasShownToast.current) {
                    toast.error("Bạn chưa đăng nhập!");
                    hasShownToast.current = true;
                }
                return setAuthorized(false);
            }
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/jwt/verify`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const userRole = res.data.role;
                if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
                    if (!hasShownToast.current) {
                        toast.error("Bạn không có quyền truy cập chức năng này!");
                        hasShownToast.current = true;
                    }
                    return setAuthorized(false);
                }
                setAuthorized(true);
            } catch (err) {
                const msg = err?.response?.data?.message || "Có lỗi xảy ra";
                if (!hasShownToast.current) {
                    if (msg === "Token đã hết hạn") {
                        toast.error("Phiên đăng nhập đã hết hạn!");
                    } else if (msg === "Token đã bị vô hiệu hóa") {
                        toast.error("Token đã không còn hiệu lực, mời đăng nhập lại!");
                    } else {
                        toast.error("Token không hợp lệ!");
                    }
                    hasShownToast.current = true;
                }
                localStorage.removeItem("token");
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);
    if (loading) return null; // hoặc spinner
    return authorized ? children : <Navigate to="/" state={{ from: location }} replace />;
};

export default ProtectedRoute;
