import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Calendar, 
    User, 
    Eye, 
    Pin, 
    FileText, 
    Image, 
    Download, 
    Tag,
    Clock,
    Share2,
    AlertCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const AnnouncementDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useDocumentTitle(announcement ? announcement.title : "Chi tiết thông báo");

    useEffect(() => {
        fetchAnnouncement();
    }, [id]);

    const fetchAnnouncement = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/announcements/public/${id}?incrementView=true`
            );

            if (response.data.success) {
                setAnnouncement(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching announcement:', error);
            setError(error.response?.data?.message || 'Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    };

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

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: announcement.title,
                    text: announcement.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
                    url: url
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    copyToClipboard(url);
                }
            }
        } else {
            copyToClipboard(url);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Đã copy link thông báo');
        }).catch(() => {
            toast.error('Không thể copy link');
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded mb-6 w-3/4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !announcement) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {error || 'Không tìm thấy thông báo'}
                        </h2>
                        <button
                            onClick={() => navigate('/announcements')}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            ← Quay lại danh sách thông báo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/announcements')}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Quay lại danh sách thông báo
                        </button>
                        
                        <button
                            onClick={handleShare}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Chia sẻ
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <article className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Article Header */}
                    <div className="p-8 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                {announcement.isPinned && (
                                    <Pin className="w-5 h-5 text-red-500" />
                                )}
                                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(announcement.type)}`}>
                                    {typeLabels[announcement.type] || announcement.type}
                                </span>
                                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(announcement.priority)}`}>
                                    {priorityLabels[announcement.priority] || announcement.priority}
                                </span>
                            </div>
                        </div>
                        
                        <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                            {announcement.title}
                        </h1>

                        {/* Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                <span className="font-medium">Tác giả:</span>
                                <span className="ml-1">{announcement.author?.fullName || 'Admin'}</span>
                            </div>
                            
                            <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-2" />
                                <span className="font-medium">Lượt xem:</span>
                                <span className="ml-1">{announcement.viewCount || 0}</span>
                            </div>
                            
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span className="font-medium">Ngày xuất bản:</span>
                                <span className="ml-1">{formatDate(announcement.publishedAt || announcement.createdAt)}</span>
                            </div>
                            
                            {announcement.expiresAt && (
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Ngày hết hạn:</span>
                                    <span className="ml-1">{formatDate(announcement.expiresAt)}</span>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {announcement.tags && announcement.tags.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center mb-3">
                                    <Tag className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Thẻ tag:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {announcement.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Article Content */}
                    <div className="p-8">
                        <div className="prose prose-lg max-w-none">
                            <div 
                                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ 
                                    __html: announcement.content.replace(/\n/g, '<br/>') 
                                }}
                            />
                        </div>
                    </div>

                    {/* Attachments */}
                    {announcement.attachments && announcement.attachments.length > 0 && (
                        <div className="p-8 border-t border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                File đính kèm ({announcement.attachments.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {announcement.attachments.map((attachment, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
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
                                            className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Tải xuống
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="p-8 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt && (
                                    <p>Cập nhật lần cuối: {formatDate(announcement.updatedAt)}</p>
                                )}
                            </div>
                            
                            <button
                                onClick={handleShare}
                                className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Chia sẻ thông báo
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default AnnouncementDetailPage; 