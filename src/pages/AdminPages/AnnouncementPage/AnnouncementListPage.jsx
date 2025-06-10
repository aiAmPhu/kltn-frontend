import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    Filter, 
    Edit2, 
    Trash2, 
    Eye, 
    Pin, 
    Calendar,
    User,
    AlertCircle,
    FileText,
    Download,
    X
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AnnouncementModal from './AnnouncementModal';
import AnnouncementDetailModal from './AnnouncementDetailModal';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

const AnnouncementListPage = () => {
    useDocumentTitle("Quản lý thông báo");
    
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState({});
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        type: '',
        priority: '',
        isPublished: ''
    });
    const [pagination, setPagination] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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

    const publishedOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'true', label: 'Đã xuất bản' },
        { value: 'false', label: 'Chưa xuất bản' }
    ];

    useEffect(() => {
        fetchAnnouncements();
        fetchStatistics();
    }, [filters]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/announcements/admin?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
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
            toast.error('Lỗi khi tải danh sách thông báo');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/announcements/admin/statistics`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setStatistics(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
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
    };

    const handleCreate = () => {
        setSelectedAnnouncement(null);
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEdit = (announcement) => {
        setSelectedAnnouncement(announcement);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleView = (announcement) => {
        setSelectedAnnouncement(announcement);
        setShowDetailModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/announcements/admin/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Xóa thông báo thành công');
                fetchAnnouncements();
                fetchStatistics();
            }
        } catch (error) {
            console.error('Error deleting announcement:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi xóa thông báo');
        }
    };

    const handleTogglePin = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/announcements/admin/${id}/toggle-pin`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                fetchAnnouncements();
            }
        } catch (error) {
            console.error('Error toggling pin:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái ghim');
        }
    };

    const handleModalSuccess = () => {
        setShowModal(false);
        fetchAnnouncements();
        fetchStatistics();
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
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý thông báo</h1>
                <p className="text-gray-600">Tạo và quản lý các thông báo công khai</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">{statistics.total || 0}</div>
                    <div className="text-gray-600 text-sm">Tổng thông báo</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-green-600">{statistics.published || 0}</div>
                    <div className="text-gray-600 text-sm">Đã xuất bản</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-orange-600">{statistics.pinned || 0}</div>
                    <div className="text-gray-600 text-sm">Đã ghim</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-purple-600">
                        {statistics.byType ? Object.values(statistics.byType).reduce((a, b) => a + b, 0) : 0}
                    </div>
                    <div className="text-gray-600 text-sm">Theo loại</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tiêu đề, nội dung..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {typeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {priorityOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>

                    <select
                        value={filters.isPublished}
                        onChange={(e) => handleFilterChange('isPublished', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {publishedOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Tìm kiếm
                    </button>
                </form>
            </div>

            {/* Create Button */}
            <div className="mb-4">
                <button
                    onClick={handleCreate}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo thông báo mới
                </button>
            </div>

            {/* Announcements List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Không có thông báo nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thông báo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loại / Mức độ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tác giả
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {announcements.map((announcement) => (
                                    <tr key={announcement.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {announcement.isPinned && (
                                                    <Pin className="w-4 h-4 text-red-500 mr-2" />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                                        {announcement.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 line-clamp-2">
                                                        {announcement.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                                    </div>
                                                    {announcement.attachments && announcement.attachments.length > 0 && (
                                                        <div className="flex items-center text-xs text-blue-600 mt-1">
                                                            <FileText className="w-3 h-3 mr-1" />
                                                            {announcement.attachments.length} file đính kèm
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(announcement.type)}`}>
                                                    {typeOptions.find(t => t.value === announcement.type)?.label || announcement.type}
                                                </span>
                                                <br />
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                                                    {priorityOptions.find(p => p.value === announcement.priority)?.label || announcement.priority}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                announcement.isPublished 
                                                    ? 'text-green-800 bg-green-100' 
                                                    : 'text-gray-800 bg-gray-100'
                                            }`}>
                                                {announcement.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Lượt xem: {announcement.viewCount || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                {announcement.author?.fullName || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {formatDate(announcement.createdAt)}
                                            </div>
                                            {announcement.publishedAt && (
                                                <div className="text-xs text-green-600 mt-1">
                                                    Xuất bản: {formatDate(announcement.publishedAt)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleView(announcement)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(announcement)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Sửa"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleTogglePin(announcement.id)}
                                                    className={`${announcement.isPinned ? 'text-red-600 hover:text-red-900' : 'text-gray-400 hover:text-gray-600'}`}
                                                    title={announcement.isPinned ? 'Bỏ ghim' : 'Ghim'}
                                                >
                                                    <Pin className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(announcement.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{((pagination.currentPage - 1) * filters.limit) + 1}</span> đến{' '}
                                <span className="font-medium">
                                    {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)}
                                </span>{' '}
                                trong <span className="font-medium">{pagination.totalCount}</span> kết quả
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                className={`px-3 py-1 border rounded-md text-sm ${
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
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showModal && (
                <AnnouncementModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    announcement={selectedAnnouncement}
                    isEditing={isEditing}
                    onSuccess={handleModalSuccess}
                />
            )}

            {showDetailModal && selectedAnnouncement && (
                <AnnouncementDetailModal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    announcement={selectedAnnouncement}
                />
            )}
        </div>
    );
};

export default AnnouncementListPage; 