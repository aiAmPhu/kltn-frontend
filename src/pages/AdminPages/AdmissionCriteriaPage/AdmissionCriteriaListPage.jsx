import React, { useState, useEffect } from "react"; 
import axios from "axios";
import AdmissionCriteriaList from "./AdmissionCriteriaList";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { toast } from "react-toastify";

const AdmissionCriteriaListPage = () => {
    const [criterias, setCriterias] = useState([]);

    // Set document title
    useDocumentTitle("Quản lý diện xét tuyển");

    useEffect(() => {
        const fetchCriterias = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/adcs/getall`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setCriterias(response.data);
            } catch (error) {
                toast.error("Không thể tải danh sách diện xét tuyển. Vui lòng thử lại sau!");
                console.error("Error fetching admission criteria", error);
            }
        };

        fetchCriterias();
    }, []);

    return (
        <div>
            <AdmissionCriteriaList criterias={criterias} setCriterias={setCriterias} />
        </div>
    );
};

export default AdmissionCriteriaListPage; 