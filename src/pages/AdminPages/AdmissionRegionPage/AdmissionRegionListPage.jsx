import React, { useState, useEffect } from "react"; 
import axios from "axios";
import AdmissionRegionList from "./AdmissionRegionList";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { toast } from "react-toastify";

const AdmissionRegionListPage = () => {
    const [regions, setRegions] = useState([]);

    // Set document title
    useDocumentTitle("Quản lý khu vực ưu tiên");

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Vui lòng đăng nhập");

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
                toast.error("Không thể tải danh sách khu vực ưu tiên. Vui lòng thử lại sau!");
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