import React, { useState, useEffect } from "react"; 
import axios from "axios";
import AdmissionRegionList from "./AdmissionRegionList";

const AdmissionRegionListPage = () => {
    const [regions, setRegions] = useState([]);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/adrs/getall`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setRegions(response.data);
            } catch (error) {
                console.error("Error fetching admission regions", error);
            }
        };

        fetchRegions();
    }, []);

    return (
        <div>
            <AdmissionRegionList regions={regions} setRegions={setRegions} />
        </div>
    );
};

export default AdmissionRegionListPage; 