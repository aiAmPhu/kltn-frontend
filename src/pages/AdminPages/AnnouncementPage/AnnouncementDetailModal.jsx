import React from 'react';
import { X, Calendar, User, Eye, Pin, FileText, Image, Download, Tag } from 'lucide-react';

const AnnouncementDetailModal = ({ isOpen, onClose, announcement }) => {
    if (!isOpen || !announcement) return null;

    const typeLabels = {
        general: 'Thông báo chung',
        admission: 'Tuyển sinh',
        exam: 'Thi cử',
        urgent: 'Khẩn cấp',
        event: 'Sự kiện'
    };

    const priorityLabels = {
        low: 'Thấp',
        medium: 'Trung bình',
        high: 'Cao',
        urgent: 'Khẩn cấp'
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'urgent': return 'text-red-600 bg-red-100';
            case 'admission': return 'text-blue-600 bg-blue-100';
            case 'exam': return 'text-purple-600 bg-purple-100';
            case 'event': return 'text-indigo-600 bg-indigo-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa đặt';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) {
            return <Image className="w-5 h-5" />;
        }
        return <FileText className="w-5 h-5" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDownload = (attachment) => {
        window.open(attachment.url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Chi tiết thông báo
                                </h3>
                                {announcement.isPinned && (
                                    <Pin className="w-5 h-5 text-red-500 ml-2" />
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {announcement.title}
                                </h1>
                                
                                {/* Status badges */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(announcement.type)}`}>
                                        {typeLabels[announcement.type] || announcement.type}
                                    </span>
                                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(announcement.priority)}`}>
                                        {priorityLabels[announcement.priority] || announcement.priority}
                                    </span>
                                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                                        announcement.isPublished 
                                            ? 'text-green-800 bg-green-100' 
                                            : 'text-gray-800 bg-gray-100'
                                    }`}>
                                        {announcement.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
                                    </span>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center text-sm text-gray-600">
                                    <User className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Tác giả:</span>
                                    <span className="ml-1">{announcement.author?.fullName || 'N/A'}</span>
                                </div>
                                
                                <div className="flex items-center text-sm text-gray-600">
                                    <Eye className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Lượt xem:</span>
                                    <span className="ml-1">{announcement.viewCount || 0}</span>
                                </div>
                                
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Ngày tạo:</span>
                                    <span className="ml-1">{formatDate(announcement.createdAt)}</span>
                                </div>
                                
                                {announcement.publishedAt && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span className="font-medium">Ngày xuất bản:</span>
                                        <span className="ml-1">{formatDate(announcement.publishedAt)}</span>
                                    </div>
                                )}
                                
                                {announcement.expiresAt && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span className="font-medium">Ngày hết hạn:</span>
                                        <span className="ml-1">{formatDate(announcement.expiresAt)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            {announcement.tags && announcement.tags.length > 0 && (
                                <div>
                                    <div className="flex items-center mb-2">
                                        <Tag className="w-4 h-4 mr-2 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Thẻ tag:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {announcement.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-3">Nội dung</h4>
                                <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                                    <div 
                                        className="whitespace-pre-wrap text-gray-700"
                                        dangerouslySetInnerHTML={{ 
                                            __html: announcement.content.replace(/\n/g, '<br/>') 
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Attachments */}
                            {Array.isArray(announcement.attachments) && announcement.attachments.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                                        File đính kèm ({announcement.attachments.length})
                                    </h4>
                                    <div className="space-y-3">
                                        {announcement.attachments.map((attachment, index) => (
                                            <div 
                                                key={index} 
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center">
                                                    {getFileIcon(attachment.type)}
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {attachment.filename}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatFileSize(attachment.size)} • {attachment.format?.toUpperCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    onClick={() => handleDownload(attachment)}
                                                    className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Tải xuống
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Last updated */}
                            {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt && (
                                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                                    Cập nhật lần cuối: {formatDate(announcement.updatedAt)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetailModal; 