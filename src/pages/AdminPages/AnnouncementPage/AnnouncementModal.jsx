import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Image, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AnnouncementModal = ({ isOpen, onClose, announcement, isEditing, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'general',
        priority: 'medium',
        isPublished: false,
        expiresAt: '',
        tags: [],
        attachments: []
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState({});

    const typeOptions = [
        { value: 'general', label: 'Thông báo chung' },
        { value: 'admission', label: 'Tuyển sinh' },
        { value: 'exam', label: 'Thi cử' },
        { value: 'urgent', label: 'Khẩn cấp' },
        { value: 'event', label: 'Sự kiện' }
    ];

    const priorityOptions = [
        { value: 'low', label: 'Thấp' },
        { value: 'medium', label: 'Trung bình' },
        { value: 'high', label: 'Cao' },
        { value: 'urgent', label: 'Khẩn cấp' }
    ];

    useEffect(() => {
        if (isEditing && announcement) {
            setFormData({
                title: announcement.title || '',
                content: announcement.content || '',
                type: announcement.type || 'general',
                priority: announcement.priority || 'medium',
                isPublished: announcement.isPublished || false,
                expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : '',
                tags: announcement.tags || [],
                attachments: announcement.attachments || []
            });
        } else {
            setFormData({
                title: '',
                content: '',
                type: 'general',
                priority: 'medium',
                isPublished: false,
                expiresAt: '',
                tags: [],
                attachments: []
            });
        }
        setFiles([]);
        setTagInput('');
        setErrors({});
    }, [isEditing, announcement, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = [];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        selectedFiles.forEach(file => {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`File ${file.name} không được hỗ trợ`);
                return;
            }
            if (file.size > maxSize) {
                toast.error(`File ${file.name} quá lớn (tối đa 10MB)`);
                return;
            }
            validFiles.push(file);
        });

        if (files.length + validFiles.length > 5) {
            toast.error('Tối đa 5 file được cho phép');
            return;
        }

        setFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = async (attachmentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa file này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/announcements/admin/${announcement.id}/attachments/${attachmentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setFormData(prev => ({
                ...prev,
                attachments: prev.attachments.filter(att => att.publicId !== attachmentId)
            }));
            toast.success('Xóa file thành công');
        } catch (error) {
            console.error('Error deleting attachment:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi xóa file');
        }
    };

    const addTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !formData.tags.includes(trimmedTag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, trimmedTag]
            }));
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề là bắt buộc';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Nội dung là bắt buộc';
        }

        if (formData.expiresAt && new Date(formData.expiresAt) <= new Date()) {
            newErrors.expiresAt = 'Ngày hết hạn phải lớn hơn ngày hiện tại';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const submitData = new FormData();
            
            // Append form data
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'tags') {
                    submitData.append(key, JSON.stringify(value));
                } else if (key === 'attachments') {
                    // Skip existing attachments for new uploads
                    if (!isEditing) {
                        submitData.append(key, JSON.stringify(value));
                    }
                } else if (key === 'expiresAt' && value) {
                    submitData.append(key, new Date(value).toISOString());
                } else if (value !== '' && value !== null && value !== undefined) {
                    submitData.append(key, value);
                }
            });

            // Append new files
            files.forEach(file => {
                submitData.append('attachments', file);
            });

            const url = isEditing 
                ? `${process.env.REACT_APP_API_BASE_URL}/announcements/admin/${announcement.id}`
                : `${process.env.REACT_APP_API_BASE_URL}/announcements/admin`;
            
            const method = isEditing ? 'put' : 'post';

            const response = await axios[method](url, submitData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success(response.data.message);
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving announcement:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi lưu thông báo');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) {
            return <Image className="w-4 h-4" />;
        }
        return <FileText className="w-4 h-4" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {isEditing ? 'Sửa thông báo' : 'Tạo thông báo mới'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tiêu đề <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.title ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Nhập tiêu đề thông báo"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nội dung <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        rows={6}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.content ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Nhập nội dung thông báo"
                                    />
                                    {errors.content && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.content}
                                        </p>
                                    )}
                                </div>

                                {/* Type and Priority */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Loại thông báo</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {typeOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Mức độ ưu tiên</label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {priorityOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Expires At */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ngày hết hạn</label>
                                    <input
                                        type="datetime-local"
                                        name="expiresAt"
                                        value={formData.expiresAt}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.expiresAt ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.expiresAt && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.expiresAt}
                                        </p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">Để trống nếu không có ngày hết hạn</p>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Thẻ tag</label>
                                    <div className="mt-1 flex">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập thẻ tag"
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                                        >
                                            Thêm
                                        </button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {formData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">File đính kèm</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                    <span>Chọn file</span>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*,application/pdf,.doc,.docx"
                                                        onChange={handleFileChange}
                                                        className="sr-only"
                                                    />
                                                </label>
                                                <p className="pl-1">hoặc kéo thả file vào đây</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF, DOC, DOCX tối đa 10MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Existing Attachments */}
                                {isEditing && Array.isArray(formData.attachments) && formData.attachments.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">File hiện tại</label>
                                        <div className="mt-2 space-y-2">
                                            {formData.attachments.map((attachment, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                                    <div className="flex items-center">
                                                        {getFileIcon(attachment.type)}
                                                        <span className="ml-2 text-sm text-gray-700">{attachment.filename}</span>
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            ({formatFileSize(attachment.size)})
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingAttachment(attachment.publicId)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Files Preview */}
                                {files.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">File mới sẽ upload</label>
                                        <div className="mt-2 space-y-2">
                                            {files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                                                    <div className="flex items-center">
                                                        {getFileIcon(file.type)}
                                                        <span className="ml-2 text-sm text-gray-700">{file.name}</span>
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            ({formatFileSize(file.size)})
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Publish */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isPublished"
                                        checked={formData.isPublished}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700">
                                        Xuất bản thông báo ngay
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Tạo thông báo')}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementModal;