import React from "react"; 
import AdmissionYearList from "./AdmissionYearList";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

const AdmissionYearListPage = () => {
    // Set document title
    useDocumentTitle("Quản lý năm tuyển sinh");

    return (
        <div>
            <AdmissionYearList />
        </div>
    );
};

export default AdmissionYearListPage; 