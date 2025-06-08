import React, { useState, useEffect } from "react";
import axios from "axios";
import AdmissionObjectList from "./AdmissionObjectList";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { toast } from "react-toastify";

const AdmissionObjectListPage = () => {
    const [objects, setObjects] = useState([]);

    // Set document title
    useDocumentTitle("Quản lý đối tượng ưu tiên");

    useEffect(() => {
        const fetchObjects = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Vui lòng đăng nhập");
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/ados/getall`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setObjects(response.data);
            } catch (error) {
                toast.error("Không thể tải danh sách đối tượng ưu tiên. Vui lòng thử lại sau!");
                console.error("Error fetching admission objects", error);
            }
        };

        fetchObjects();
    }, []);

    return (
        <div>
            <AdmissionObjectList objects={objects} setObjects={setObjects} />
        </div>
    );
};

export default AdmissionObjectListPage; 