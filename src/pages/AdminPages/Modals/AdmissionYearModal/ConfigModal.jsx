import React from "react";

const ConfigModal = ({ show, onClose, selectedYear, currentConfig, availableOptions, loading, onSaveConfig }) => {
    const [selectedItems, setSelectedItems] = React.useState({
        criteria: [],
        majors: [],
        objects: [],
        regions: [],
    });

    // Load current config khi mở modal
    React.useEffect(() => {
        if (currentConfig) {
            setSelectedItems({
                criteria: currentConfig.criteria?.map((c) => c?.criteriaId).filter(Boolean) || [],
                majors: currentConfig.majors?.map((m) => m?.majorId).filter(Boolean) || [],
                objects: currentConfig.objects?.map((o) => o?.objectId).filter(Boolean) || [],
                regions: currentConfig.regions?.map((r) => r?.regionId).filter(Boolean) || [],
            });
        }
    }, [currentConfig]);

    // Handle checkbox change
    const handleCheckboxChange = (type, itemId, checked) => {
        setSelectedItems((prev) => ({
            ...prev,
            [type]: checked ? [...prev[type], itemId] : prev[type].filter((id) => id !== itemId),
        }));
    };

    // Handle save
    const handleSave = () => {
        onSaveConfig(selectedItems);
    };

    if (!show) return null;
    // console.log("Available Options:", availableOptions);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl font-bold">Cấu hình năm tuyển sinh: {selectedYear?.yearName}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                        ×
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="text-lg">Đang tải dữ liệu...</div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* ✅ Diện xét tuyển - Thu nhỏ */}
                                <div className="border p-3 rounded-lg">
                                    <h3 className="font-semibold mb-2 text-blue-600 text-sm">
                                        Diện xét tuyển ({selectedItems.criteria.length} đã chọn)
                                    </h3>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {availableOptions?.criteria && Array.isArray(availableOptions.criteria) ? (
                                            availableOptions.criteria
                                                .filter((criteria) => criteria && criteria.criteriaId)
                                                .map((criteria) => (
                                                    <label
                                                        key={criteria.criteriaId}
                                                        className="flex items-center text-xs"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.criteria.includes(
                                                                criteria.criteriaId
                                                            )}
                                                            onChange={(e) =>
                                                                handleCheckboxChange(
                                                                    "criteria",
                                                                    criteria.criteriaId,
                                                                    e.target.checked
                                                                )
                                                            }
                                                            className="mr-2 w-3 h-3"
                                                        />
                                                        <span>{criteria.criteriaName}</span>
                                                    </label>
                                                ))
                                        ) : (
                                            <div className="text-gray-500 text-xs">Không có dữ liệu diện xét tuyển</div>
                                        )}
                                    </div>
                                </div>

                                {/* ✅ Ngành học - Thu nhỏ */}
                                <div className="border p-3 rounded-lg">
                                    <h3 className="font-semibold mb-2 text-green-600 text-sm">
                                        Ngành học ({selectedItems.majors.length} đã chọn)
                                    </h3>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {availableOptions?.majors && Array.isArray(availableOptions.majors) ? (
                                            availableOptions.majors
                                                .filter((major) => major && major.majorId)
                                                .map((major) => (
                                                    <label key={major.majorId} className="flex items-center text-xs">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.majors.includes(major.majorId)}
                                                            onChange={(e) =>
                                                                handleCheckboxChange(
                                                                    "majors",
                                                                    major.majorId,
                                                                    e.target.checked
                                                                )
                                                            }
                                                            className="mr-2 w-3 h-3"
                                                        />
                                                        <span>{major.majorName}</span>
                                                    </label>
                                                ))
                                        ) : (
                                            <div className="text-gray-500 text-xs">Không có dữ liệu ngành học</div>
                                        )}
                                    </div>
                                </div>

                                {/* ✅ Đối tượng - Thu nhỏ */}
                                <div className="border p-3 rounded-lg">
                                    <h3 className="font-semibold mb-2 text-purple-600 text-sm">
                                        Đối tượng ưu tiên ({selectedItems.objects.length} đã chọn)
                                    </h3>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {availableOptions?.objects && Array.isArray(availableOptions.objects) ? (
                                            availableOptions.objects
                                                .filter((object) => object && object.objectId)
                                                .map((object) => (
                                                    <label key={object.objectId} className="flex items-center text-xs">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.objects.includes(object.objectId)}
                                                            onChange={(e) =>
                                                                handleCheckboxChange(
                                                                    "objects",
                                                                    object.objectId,
                                                                    e.target.checked
                                                                )
                                                            }
                                                            className="mr-2 w-3 h-3"
                                                        />
                                                        <span>{object.objectName}</span>
                                                    </label>
                                                ))
                                        ) : (
                                            <div className="text-gray-500 text-xs">Không có dữ liệu đối tượng</div>
                                        )}
                                    </div>
                                </div>

                                {/* ✅ Khu vực - Thu nhỏ */}
                                <div className="border p-3 rounded-lg">
                                    <h3 className="font-semibold mb-2 text-orange-600 text-sm">
                                        Khu vực ({selectedItems.regions.length} đã chọn)
                                    </h3>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {availableOptions?.regions && Array.isArray(availableOptions.regions) ? (
                                            availableOptions.regions
                                                .filter((region) => region && region.regionId)
                                                .map((region) => (
                                                    <label key={region.regionId} className="flex items-center text-xs">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.regions.includes(region.regionId)}
                                                            onChange={(e) =>
                                                                handleCheckboxChange(
                                                                    "regions",
                                                                    region.regionId,
                                                                    e.target.checked
                                                                )
                                                            }
                                                            className="mr-2 w-3 h-3"
                                                        />
                                                        <span>{region.regionName}</span>
                                                    </label>
                                                ))
                                        ) : (
                                            <div className="text-gray-500 text-xs">Không có dữ liệu khu vực</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ✅ Summary - Thu nhỏ */}
                            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                                <h4 className="font-semibold mb-2 text-sm">Tóm tắt cấu hình:</h4>
                                <div className="text-xs space-y-1">
                                    <div>
                                        • <strong>{selectedItems.criteria.length}</strong> diện xét tuyển
                                    </div>
                                    <div>
                                        • <strong>{selectedItems.majors.length}</strong> ngành học
                                    </div>
                                    <div>
                                        • <strong>{selectedItems.objects.length}</strong> đối tượng ưu tiên
                                    </div>
                                    <div>
                                        • <strong>{selectedItems.regions.length}</strong> khu vực
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 p-6 border-t border-gray-200 flex-shrink-0">
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                                Lưu cấu hình
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                            >
                                Hủy
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConfigModal;
