import React, { useState, useEffect } from "react"; 
import axios from "axios";
import AdmissionQuantityList from "./AdmissionQuantityList";

const AdmissionQuantityListPage = () => {
    const [quantities, setQuantities] = useState([]);

    useEffect(() => {
        const fetchQuantities = async () => {
            try {
                const token = localStorage.getItem("token");

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