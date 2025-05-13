import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const location = useLocation();
    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setUser(null);
                return;
            }

            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/jwt/verify`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.status === 200) {
                    console.log("User trả về từ API:", res.data.user);
                    setUser(res.data.user); // ✅ Lấy user từ backend
                }
            } catch (err) {
                console.warn("Token không hợp lệ hoặc hết hạn", err);
                localStorage.removeItem("token");
                setUser(null);
            }
        };
        checkToken();
        // Optional: thêm event listener để tự recheck nếu token bị xóa
        window.addEventListener("storage", checkToken);
        return () => window.removeEventListener("storage", checkToken);
    }, [location.pathname]); // Chỉ chạy khi pathname thay đổi

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };
    return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
