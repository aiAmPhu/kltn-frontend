import React, { useState, useEffect } from "react";
import axios from "axios";
import AdmissionMajorList from "./AdmissionMajorList";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdmissionMajorListPage = () => {
    const [majors, setMajors] = useState([]);

    // Set document title
    useDocumentTitle("Quản lý ngành xét tuyển");

    useEffect(() => {
        const fetchMajors = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Vui lòng đăng nhập");
                const response = await axios.get(`${API_BASE_URL}/adms/getall`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMajors(response.data);
            } catch (error) {
                toast.error("Không thể tải danh sách ngành xét tuyển. Vui lòng thử lại sau!");
                console.error("Error fetching majors:", error);
            }
        };

        fetchMajors();
    }, []);

    return (
        <div>
            <AdmissionMajorList majors={majors} setMajors={setMajors} />
        </div>
    );
};

export default AdmissionMajorListPage; 