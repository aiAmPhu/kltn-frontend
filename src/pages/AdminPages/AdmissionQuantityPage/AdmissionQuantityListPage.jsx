import React, { useState, useEffect } from "react"; 
import axios from "axios";
import AdmissionQuantityList from "./AdmissionQuantityList";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { toast } from "react-toastify";

const AdmissionQuantityListPage = () => {
    const [quantities, setQuantities] = useState([]);

    // Set document title
    useDocumentTitle("Quản lý chỉ tiêu tuyển sinh");

    useEffect(() => {
        const fetchQuantities = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Vui lòng đăng nhập");

                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/adqs/getall`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setQuantities(response.data);
            } catch (error) {
                toast.error("Không thể tải danh sách chỉ tiêu tuyển sinh. Vui lòng thử lại sau!");
                console.error("Error fetching quantities", error);
            }
        };

        fetchQuantities();
    }, []);

    return (
        <div>
            <AdmissionQuantityList quantities={quantities} setQuantities={setQuantities} />
        </div>
    );
};

export default AdmissionQuantityListPage; 