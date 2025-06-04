import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (token) {
                try {
                    // Lưu token vào localStorage
                    localStorage.setItem('token', token);

                    // Decode token để lấy thông tin user
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const userData = JSON.parse(jsonPayload);
                    setUser(userData);

                    toast.success('Đăng nhập thành công!');

                    // Chuyển hướng dựa vào role
                    if (userData.role === 'admin') {
                        navigate('/admin');
                    } else if (userData.role === 'reviewer') {
                        navigate('/reviewer');
                    } else {
                        navigate('/');
                    }
                } catch (error) {
                    console.error('Error handling Google callback:', error);
                    toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
                    navigate('/login');
                }
            } else {
                toast.error('Không tìm thấy token xác thực.');
                navigate('/login');
            }
        };

        handleCallback();
    }, [location, navigate, setUser]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Đang xử lý đăng nhập...</h2>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        </div>
    );
};

export default GoogleCallback; 