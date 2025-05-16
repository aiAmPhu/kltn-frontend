import React, { useState, useEffect } from "react"; 
import axios from "axios";
import AdmissionYearList from "./AdmissionYearList";

const AdmissionYearListPage = () => {
    const [years, setYears] = useState([]);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/adys/getAll`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setYears(response.data.data || response.data);
            } catch (error) {
                console.error("Error fetching admission years", error);
            }
        };

        fetchYears();
    }, []);

    return (
        <div>
            <AdmissionYearList years={years} setYears={setYears} />
        </div>
    );
};

export default AdmissionYearListPage; 