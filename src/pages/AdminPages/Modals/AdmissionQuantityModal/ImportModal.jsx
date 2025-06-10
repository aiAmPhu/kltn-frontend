import React, { useState } from "react";
import axios from "axios";
import { FaTimes, FaUpload, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaDownload, FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ImportModal = ({ onClose, onSuccess, majors, criteria }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [importResults, setImportResults] = useState(null);

    const downloadTemplate = () => {
        // Create template data
        const templateData = [
            {
                'Mã ngành': 'VD: CNTT',
                'Tên ngành': 'Công nghệ thông tin',
                'Mã diện xét tuyển': 'VD: XTD',
                'Tên diện xét tuyển': 'Xét tuyển thẳng',
                'Số lượng chỉ tiêu': 100
            },
            {
                'Mã ngành': '',
                'Tên ngành': '',
                'Mã diện xét tuyển': '',
                'Tên diện xét tuyển': '',
                'Số lượng chỉ tiêu': ''
            }
        ];

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(templateData);

        // Set column widths
        const colWidths = [
            { wch: 15 }, // Mã ngành
            { wch: 40 }, // Tên ngành
            { wch: 20 }, // Mã diện xét tuyển
            { wch: 30 }, // Tên diện xét tuyển
            { wch: 20 }  // Số lượng chỉ tiêu
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Template");

        // Save file
        XLSX.writeFile(wb, "Template_Chi_tieu_tuyen_sinh.xlsx");
        toast.success("Tải template thành công!");
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && 
                file.type !== "application/vnd.ms-excel") {
                toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
                return;
            }
            setSelectedFile(file);
            previewFile(file);
        }
    };

    const previewFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                // Take first 5 rows for preview
                setPreviewData(jsonData.slice(0, 5));
                validateData(jsonData);
            } catch (error) {
                toast.error("Lỗi khi đọc file Excel");
                console.error("Error reading file:", error);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const validateData = (data) => {
        const validationErrors = [];
        const requiredColumns = ['Mã ngành', 'Mã diện xét tuyển', 'Số lượng chỉ tiêu'];
        
        data.forEach((row, index) => {
            const rowErrors = [];
            
            // Check required fields
            requiredColumns.forEach(col => {
                if (!row[col] || row[col].toString().trim() === '') {
                    rowErrors.push(`Thiếu ${col}`);
                }
            });

            // Validate major ID exists
            if (row['Mã ngành'] && !majors.find(m => m.majorId === row['Mã ngành'].toString().trim())) {
                rowErrors.push(`Mã ngành không tồn tại: ${row['Mã ngành']}`);
            }

            // Validate criteria ID exists
            if (row['Mã diện xét tuyển'] && !criteria.find(c => c.criteriaId === row['Mã diện xét tuyển'].toString().trim())) {
                rowErrors.push(`Mã diện xét tuyển không tồn tại: ${row['Mã diện xét tuyển']}`);
            }

            // Validate quantity is a positive number
            const quantity = row['Số lượng chỉ tiêu'];
            if (quantity !== undefined && (isNaN(quantity) || quantity < 0)) {
                rowErrors.push(`Số lượng chỉ tiêu phải là số dương: ${quantity}`);
            }

            if (rowErrors.length > 0) {
                validationErrors.push({
                    row: index + 2, // +2 because Excel rows start from 1 and we have header
                    errors: rowErrors
                });
            }
        });

        setErrors(validationErrors);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            toast.error("Vui lòng chọn file Excel");
            return;
        }

        if (errors.length > 0) {
            toast.error("Vui lòng sửa các lỗi trước khi import");
            return;
        }

        setIsProcessing(true);
        
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    // Prepare data for API
                    const importData = jsonData
                        .filter(row => row['Mã ngành'] && row['Mã diện xét tuyển'] && row['Số lượng chỉ tiêu'])
                        .map(row => ({
                            majorId: row['Mã ngành'].toString().trim(),
                            criteriaId: row['Mã diện xét tuyển'].toString().trim(),
                            quantity: parseInt(row['Số lượng chỉ tiêu'])
                        }));

                    const token = localStorage.getItem("token");
                    const response = await axios.post(`${API_BASE_URL}/adqs/import`, {
                        data: importData
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    setImportResults(response.data);
                    toast.success("Import dữ liệu thành công!");
                    
                    // Call success callback after a short delay to show results
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);

                } catch (error) {
                    const errorMessage = error.response?.data?.message || "Lỗi khi import dữ liệu";
                    toast.error(errorMessage);
                    console.error("Import error:", error);
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        } catch (error) {
            toast.error("Lỗi khi xử lý file");
            console.error("File processing error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                            <FaUpload className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Import chỉ tiêu từ Excel
                        </h2>
                        <p className="text-sm text-gray-600">
                            Tải lên file Excel để import hàng loạt chỉ tiêu tuyển sinh
                        </p>
                    </div>
                </div>

                <div className="my-6">
                    {/* Template Download */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-blue-800 mb-1">
                                    Chưa có template?
                                </h3>
                                <p className="text-xs text-blue-600">
                                    Tải xuống file mẫu để đảm bảo định dạng đúng
                                </p>
                            </div>
                            <button
                                onClick={downloadTemplate}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                            >
                                <FaDownload className="w-4 h-4" />
                                Tải template
                            </button>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Chọn file Excel
                        </h3>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="text-center">
                                <FaFileExcel className="mx-auto h-12 w-12 text-green-400 mb-4" />
                                <label className="cursor-pointer">
                                    <span className="mt-2 block text-sm font-medium text-gray-900">
                                        Chọn file Excel để upload
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileSelect}
                                    />
                                    <span className="mt-1 block text-xs text-gray-500">
                                        Hỗ trợ file .xlsx và .xls
                                    </span>
                                </label>
                            </div>
                        </div>

                        {selectedFile && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <FaFileExcel className="text-green-500 text-xl" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Validation Errors */}
                    {errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FaExclamationTriangle className="text-red-500" />
                                <h4 className="text-sm font-medium text-red-800">
                                    Có {errors.length} lỗi cần sửa:
                                </h4>
                            </div>
                            <div className="max-h-40 overflow-y-auto">
                                {errors.map((error, index) => (
                                    <div key={index} className="text-xs text-red-700 mb-1">
                                        <strong>Dòng {error.row}:</strong> {error.errors.join(', ')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preview Data */}
                    {previewData.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Xem trước dữ liệu
                            </h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Mã ngành
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Tên ngành
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Mã diện
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Tên diện
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Chỉ tiêu
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {previewData.map((row, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {row['Mã ngành'] || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {row['Tên ngành'] || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {row['Mã diện xét tuyển'] || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {row['Tên diện xét tuyển'] || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {row['Số lượng chỉ tiêu'] || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Import Results */}
                    {importResults && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FaCheckCircle className="text-green-500" />
                                <h4 className="text-sm font-medium text-green-800">
                                    Import thành công!
                                </h4>
                            </div>
                            <div className="text-xs text-green-700">
                                <p>Thành công: {importResults.success || 0} bản ghi</p>
                                <p>Bỏ qua: {importResults.skipped || 0} bản ghi</p>
                                <p>Lỗi: {importResults.errors || 0} bản ghi</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white z-10 flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="order-2 sm:order-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaTimes className="w-4 h-4" />
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={isProcessing || !selectedFile || errors.length > 0}
                        className="order-1 sm:order-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                            <FaUpload className="w-4 h-4" />
                        )}
                        {isProcessing ? "Đang import..." : "Import dữ liệu"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal; 