import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    Eye, 
    Pin, 
    FileText, 
    ChevronRight, 
    AlertCircle,
    Clock,
    User,
    Tag
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/announcements/public?limit=6&page=1`
            );

            if (response.data.success) {
                setAnnouncements(response.data.data.announcements);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            setError('Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (announcementId) => {
        try {
            // Increment view count when viewing details
            await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/announcements/public/${announcementId}?incrementView=true`
            );
            
            // Navigate to announcement detail page
            navigate(`/announcements/${announcementId}`);
        } catch (error) {
            console.error('Error viewing announcement:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
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

    if (loading) {
        return (
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">Thông báo tuyển sinh</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">Thông báo tuyển sinh</h2>
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Thông báo tuyển sinh</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Cập nhật những thông tin mới nhất về tuyển sinh, lịch thi và các thông báo quan trọng khác
                    </p>
                </div>

                {announcements.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thông báo nào</h3>
                        <p className="text-gray-500">Các thông báo mới sẽ được cập nhật tại đây</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {announcements.map((announcement) => (
                                <div 
                                    key={announcement.id} 
                                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group"
                                >
                                    {/* Header with badges */}
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                {announcement.isPinned && (
                                                    <Pin className="w-4 h-4 text-red-500" />
                                                )}
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(announcement.type)}`}>
                                                    {typeLabels[announcement.type] || announcement.type}
                                                </span>
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority)}`}>
                                                    {priorityLabels[announcement.priority] || announcement.priority}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {announcement.title}
                                        </h3>
                                        
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                                            {announcement.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                                        </p>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        {/* Tags */}
                                        {announcement.tags && announcement.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {announcement.tags.slice(0, 3).map((tag, index) => (
                                                    <span 
                                                        key={index}
                                                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                                                    >
                                                        <Tag className="w-3 h-3 mr-1" />
                                                        {tag}
                                                    </span>
                                                ))}
                                                {announcement.tags.length > 3 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{announcement.tags.length - 3} khác
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Attachments indicator */}
                                        {announcement.attachments && announcement.attachments.length > 0 && (
                                            <div className="flex items-center text-xs text-blue-600 mb-3">
                                                <FileText className="w-4 h-4 mr-1" />
                                                {announcement.attachments.length} file đính kèm
                                            </div>
                                        )}

                                        {/* Metadata */}
                                        <div className="space-y-2 text-xs text-gray-500 mb-4">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Xuất bản: {formatDate(announcement.publishedAt || announcement.createdAt)}
                                            </div>
                                            
                                            {announcement.expiresAt && (
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    Hết hạn: {formatDate(announcement.expiresAt)}
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 mr-2" />
                                                    {announcement.author?.fullName || 'Admin'}
                                                </div>
                                                <div className="flex items-center">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    {announcement.viewCount || 0}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action button */}
                                        <button
                                            onClick={() => handleViewDetails(announcement.id)}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center group"
                                        >
                                            Xem chi tiết
                                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* View all button */}
                        <div className="text-center">
                            <button
                                onClick={() => navigate('/announcements')}
                                className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 font-medium"
                            >
                                Xem tất cả thông báo
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

export default Announcements;
