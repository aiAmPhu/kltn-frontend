import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
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
import useDocumentTitle from '../../hooks/useDocumentTitle';

const AnnouncementListPage = () => {
    useDocumentTitle("Thông báo");
    
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 12,
        search: '',
        type: '',
        priority: ''
    });
    const [pagination, setPagination] = useState({});
    const navigate = useNavigate();

    const typeOptions = [
        { value: '', label: 'Tất cả loại' },
        { value: 'general', label: 'Thông báo chung' },
        { value: 'admission', label: 'Tuyển sinh' },
        { value: 'exam', label: 'Thi cử' },
        { value: 'urgent', label: 'Khẩn cấp' },
        { value: 'event', label: 'Sự kiện' }
    ];

    const priorityOptions = [
        { value: '', label: 'Tất cả mức độ' },
        { value: 'low', label: 'Thấp' },
        { value: 'medium', label: 'Trung bình' },
        { value: 'high', label: 'Cao' },
        { value: 'urgent', label: 'Khẩn cấp' }
    ];

    useEffect(() => {
        fetchAnnouncements();
    }, [filters]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/announcements/public?${params}`
            );

            if (response.data.success) {
                setAnnouncements(response.data.data.announcements);
                setPagination({
                    currentPage: response.data.data.currentPage,
                    totalPages: response.data.data.totalPages,
                    totalCount: response.data.data.totalCount,
                    hasMore: response.data.data.hasMore
                });
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, page: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleViewDetails = async (announcementId) => {
        try {
            await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/announcements/public/${announcementId}?incrementView=true`
            );
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Thông báo tuyển sinh</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Cập nhật những thông tin mới nhất về tuyển sinh, lịch thi và các thông báo quan trọng khác
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Tìm kiếm tiêu đề, nội dung..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {typeOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>

                        <select
                            value={filters.priority}
                            onChange={(e) => handleFilterChange('priority', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {priorityOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </form>
                </div>

                {/* Results count */}
                {pagination.totalCount !== undefined && (
                    <div className="mb-6">
                        <p className="text-gray-600">
                            Tìm thấy <span className="font-semibold">{pagination.totalCount}</span> thông báo
                        </p>
                    </div>
                )}

                {/* Announcements Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy thông báo nào</h3>
                        <p className="text-gray-500">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {announcements.map((announcement) => (
                                <div 
                                    key={announcement.id} 
                                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group cursor-pointer"
                                    onClick={() => handleViewDetails(announcement.id)}
                                >
                                    {/* Header with badges */}
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
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
                                        
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {announcement.title}
                                        </h3>
                                        
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                            {announcement.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                        </p>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        {/* Tags */}
                                        {announcement.tags && announcement.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-4">
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
                                            <div className="flex items-center text-xs text-blue-600 mb-4">
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
                                        <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-800 transition-colors">
                                            <span className="text-sm font-medium">Xem chi tiết</span>
                                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Trước
                                </button>
                                
                                {[...Array(pagination.totalPages)].map((_, index) => {
                                    const page = index + 1;
                                    if (
                                        page === 1 ||
                                        page === pagination.totalPages ||
                                        (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-4 py-2 border rounded-md text-sm ${
                                                    page === pagination.currentPage
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (
                                        page === pagination.currentPage - 3 ||
                                        page === pagination.currentPage + 3
                                    ) {
                                        return <span key={page} className="px-2">...</span>;
                                    }
                                    return null;
                                })}
                                
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AnnouncementListPage; 