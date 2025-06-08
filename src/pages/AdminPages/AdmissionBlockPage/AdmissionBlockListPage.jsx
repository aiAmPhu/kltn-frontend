import React, { useState, useEffect } from "react";
import axios from "axios";
import AdmissionBlockList from "./AdmissionBlockList";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

const AdmissionBlockListPage = () => {
    const [admissionBlocks, setAdmissionBlocks] = useState([]);

    // Set document title
    useDocumentTitle("Quản lý khối xét tuyển");

    useEffect(() => {
        const fetchAdmissionBlocks = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/adbs/getall`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setAdmissionBlocks(response.data);
            } catch (error) {
                console.error("Error fetching admission blocks", error);
            }
        };

        fetchAdmissionBlocks();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <AdmissionBlockList admissionBlocks={admissionBlocks} setAdmissionBlocks={setAdmissionBlocks} />
            </div>
        </div>
    );
};

export default AdmissionBlockListPage;
