import React, { useState, useEffect } from "react";
import axios from "axios";
import AdmissionBlockList from "./AdmissionBlockList";

const AdmissionBlockListPage = () => {
    const [admissionBlocks, setAdmissionBlocks] = useState([]);

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
        <div>
            <AdmissionBlockList admissionBlocks={admissionBlocks} setAdmissionBlocks={setAdmissionBlocks} />
        </div>
    );
};

export default AdmissionBlockListPage;
