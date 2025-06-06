import React from "react";

const CreateYearModal = ({ show, onClose, formData, setFormData, onSubmit }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">Tạo Năm Tuyển Sinh Mới</h2>
                <form onSubmit={onSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Mã năm:</label>
                        <input
                            type="text"
                            value={formData.yearId}
                            onChange={(e) => setFormData({ ...formData, yearId: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="VD: 2024"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Tên năm:</label>
                        <input
                            type="text"
                            value={formData.yearName}
                            onChange={(e) => setFormData({ ...formData, yearName: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="VD: Năm tuyển sinh 2024"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Ngày bắt đầu:</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Ngày kết thúc:</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Mô tả:</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            rows="3"
                            placeholder="Mô tả về năm tuyển sinh..."
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Tạo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateYearModal;
