import React, { useState, useEffect } from "react";
import axios from "axios";
import AdmissionMajorList from "./AdmissionMajorList";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdmissionMajorListPage = () => {
    const [majors, setMajors] = useState([]);

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
                console.error("Error fetching majors:", error);
            }
        };

        fetchMajors();
    }, []);

    return <AdmissionMajorList majors={majors} setMajors={setMajors} />;
};

export default AdmissionMajorListPage; 