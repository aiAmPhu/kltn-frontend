import React, { useState } from "react";
import { FaCog, FaTimes, FaCheck, FaGraduationCap, FaListAlt, FaUsers, FaMapMarkerAlt, FaSpinner, FaSearch, FaCheckSquare, FaSquare } from "react-icons/fa";

const ConfigModal = ({ show, onClose, selectedYear, currentConfig, availableOptions, loading, onSaveConfig }) => {
    const [selectedItems, setSelectedItems] = React.useState({
        criteria: [],
        majors: [],
        objects: [],
        regions: [],
    });

    // Search states for each section
    const [searchTerms, setSearchTerms] = useState({
        criteria: "",
        majors: "",
        objects: "",
        regions: "",
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

    // Reset search terms when modal opens
    React.useEffect(() => {
        if (show) {
            setSearchTerms({
                criteria: "",
                majors: "",
                objects: "",
                regions: "",
            });
        }
    }, [show]);

    // Handle checkbox change
    const handleCheckboxChange = (type, itemId, checked) => {
        setSelectedItems((prev) => ({
            ...prev,
            [type]: checked ? [...prev[type], itemId] : prev[type].filter((id) => id !== itemId),
        }));
    };

    // Handle Select All/Deselect All
    const handleSelectAll = (type, allItems) => {
        const filteredItems = getFilteredItems(type, allItems);
        const allIds = filteredItems.map(item => getItemId(type, item));
        const currentSelected = selectedItems[type];
        
        // Check if all filtered items are selected
        const allFilteredSelected = allIds.every(id => currentSelected.includes(id));
        
        if (allFilteredSelected) {
            // Deselect all filtered items
            setSelectedItems(prev => ({
                ...prev,
                [type]: prev[type].filter(id => !allIds.includes(id))
            }));
        } else {
            // Select all filtered items
            const newSelected = [...new Set([...currentSelected, ...allIds])];
            setSelectedItems(prev => ({
                ...prev,
                [type]: newSelected
            }));
        }
    };

    // Get item ID based on type
    const getItemId = (type, item) => {
        switch (type) {
            case 'criteria': return item.criteriaId;
            case 'majors': return item.majorId;
            case 'objects': return item.objectId;
            case 'regions': return item.regionId;
            default: return item.id;
        }
    };

    // Get item name based on type
    const getItemName = (type, item) => {
        switch (type) {
            case 'criteria': return item.criteriaName;
            case 'majors': return item.majorName;
            case 'objects': return item.objectName;
            case 'regions': return item.regionName;
            default: return item.name;
        }
    };

    // Filter items based on search term
    const getFilteredItems = (type, items) => {
        if (!items || !Array.isArray(items)) return [];
        const searchTerm = searchTerms[type].toLowerCase();
        if (!searchTerm) return items.filter(item => item && getItemId(type, item));
        
        return items.filter(item => {
            if (!item || !getItemId(type, item)) return false;
            const name = getItemName(type, item).toLowerCase();
            const id = getItemId(type, item).toLowerCase();
            return name.includes(searchTerm) || id.includes(searchTerm);
        });
    };

    // Handle search change
    const handleSearchChange = (type, value) => {
        setSearchTerms(prev => ({
            ...prev,
            [type]: value
        }));
    };

    // Handle save
    const handleSave = () => {
        onSaveConfig(selectedItems);
    };

    // Check if all filtered items are selected
    const areAllFilteredSelected = (type, items) => {
        const filteredItems = getFilteredItems(type, items);
        if (filteredItems.length === 0) return false;
        const allIds = filteredItems.map(item => getItemId(type, item));
        return allIds.every(id => selectedItems[type].includes(id));
    };

    // Get section styling based on type
    const getSectionStyling = (type) => {
        switch (type) {
            case 'criteria':
                return {
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    titleColor: 'text-blue-600',
                    checkboxColor: 'text-blue-600',
                    buttonSelected: 'bg-blue-500 text-white hover:bg-blue-600',
                    buttonDefault: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                    checkColor: 'text-blue-600'
                };
            case 'majors':
                return {
                    iconBg: 'bg-green-100',
                    iconColor: 'text-green-600',
                    titleColor: 'text-green-600',
                    checkboxColor: 'text-green-600',
                    buttonSelected: 'bg-green-500 text-white hover:bg-green-600',
                    buttonDefault: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                    checkColor: 'text-green-600'
                };
            case 'objects':
                return {
                    iconBg: 'bg-purple-100',
                    iconColor: 'text-purple-600',
                    titleColor: 'text-purple-600',
                    checkboxColor: 'text-purple-600',
                    buttonSelected: 'bg-purple-500 text-white hover:bg-purple-600',
                    buttonDefault: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                    checkColor: 'text-purple-600'
                };
            case 'regions':
                return {
                    iconBg: 'bg-orange-100',
                    iconColor: 'text-orange-600',
                    titleColor: 'text-orange-600',
                    checkboxColor: 'text-orange-600',
                    buttonSelected: 'bg-orange-500 text-white hover:bg-orange-600',
                    buttonDefault: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                    checkColor: 'text-orange-600'
                };
            default:
                return {
                    iconBg: 'bg-gray-100',
                    iconColor: 'text-gray-600',
                    titleColor: 'text-gray-600',
                    checkboxColor: 'text-gray-600',
                    buttonSelected: 'bg-gray-500 text-white hover:bg-gray-600',
                    buttonDefault: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                    checkColor: 'text-gray-600'
                };
        }
    };

    // Render section with multi-select features
    const renderSection = (type, items, title, icon) => {
        const filteredItems = getFilteredItems(type, items);
        const selectedCount = selectedItems[type].length;
        const filteredSelectedCount = filteredItems.filter(item => 
            selectedItems[type].includes(getItemId(type, item))
        ).length;
        const allFilteredSelected = areAllFilteredSelected(type, items);
        const styling = getSectionStyling(type);

        return (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${styling.iconBg} rounded-lg flex items-center justify-center`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className={`font-semibold ${styling.titleColor}`}>{title}</h3>
                            <p className="text-xs text-gray-500">
                                {selectedCount} đã chọn
                                {searchTerms[type] && ` (${filteredSelectedCount}/${filteredItems.length} hiển thị)`}
                            </p>
                        </div>
                    </div>
                    
                    {/* Select All/Deselect All Button */}
                    <button
                        onClick={() => handleSelectAll(type, items)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            allFilteredSelected ? styling.buttonSelected : styling.buttonDefault
                        }`}
                        title={allFilteredSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    >
                        {allFilteredSelected ? <FaCheckSquare className="w-3 h-3" /> : <FaSquare className="w-3 h-3" />}
                        {allFilteredSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </button>
                </div>

                {/* Search Box */}
                <div className="relative mb-3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-3 w-3 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerms[type]}
                        onChange={(e) => handleSearchChange(type, e.target.value)}
                        placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
                        className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg w-full text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => {
                            const itemId = getItemId(type, item);
                            const itemName = getItemName(type, item);
                            const isSelected = selectedItems[type].includes(itemId);
                            
                            return (
                                <label
                                    key={itemId}
                                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                                        isSelected ? 'bg-white border border-blue-200' : 'hover:bg-white'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => handleCheckboxChange(type, itemId, e.target.checked)}
                                        className={`mr-3 w-4 h-4 ${styling.checkboxColor} rounded focus:ring-2 focus:ring-blue-500`}
                                    />
                                    <span className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                                        {itemName}
                                    </span>
                                    {isSelected && (
                                        <FaCheck className={`ml-auto w-3 h-3 ${styling.checkColor}`} />
                                    )}
                                </label>
                            );
                        })
                    ) : availableOptions?.[type] && Array.isArray(availableOptions[type]) && availableOptions[type].length > 0 ? (
                        <div className="text-gray-500 text-sm text-center py-4">
                            Không tìm thấy kết quả cho "{searchTerms[type]}"
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm text-center py-4">
                            Không có dữ liệu {title.toLowerCase()}
                        </div>
                    )}
                </div>

                {/* Quick stats */}
                {filteredItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Hiển thị: {filteredItems.length}</span>
                            <span>Đã chọn: {filteredSelectedCount}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* Header - Fixed */}
                <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 rounded-t-2xl">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                            <FaCog className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Cấu hình năm tuyển sinh: {selectedYear?.yearName}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Chọn các thành phần sẽ được sử dụng trong năm tuyển sinh này
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="text-center">
                            <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
                            <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Diện xét tuyển */}
                                {renderSection(
                                    'criteria',
                                    availableOptions?.criteria,
                                    'Diện xét tuyển',
                                    <FaListAlt className="text-blue-600 text-sm" />
                                )}

                                {/* Ngành học */}
                                {renderSection(
                                    'majors',
                                    availableOptions?.majors,
                                    'Ngành học',
                                    <FaGraduationCap className="text-green-600 text-sm" />
                                )}

                                {/* Đối tượng ưu tiên */}
                                {renderSection(
                                    'objects',
                                    availableOptions?.objects,
                                    'Đối tượng ưu tiên',
                                    <FaUsers className="text-purple-600 text-sm" />
                                )}

                                {/* Khu vực */}
                                {renderSection(
                                    'regions',
                                    availableOptions?.regions,
                                    'Khu vực ưu tiên',
                                    <FaMapMarkerAlt className="text-orange-600 text-sm" />
                                )}
                            </div>

                            {/* Enhanced Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                    <FaCheck className="w-4 h-4" />
                                    Tóm tắt cấu hình
                                </h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{selectedItems.criteria.length}</div>
                                        <div className="text-sm text-gray-600">Diện xét tuyển</div>
                                        {availableOptions?.criteria && (
                                            <div className="text-xs text-gray-500">
                                                / {availableOptions.criteria.filter(c => c && c.criteriaId).length} tổng
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{selectedItems.majors.length}</div>
                                        <div className="text-sm text-gray-600">Ngành học</div>
                                        {availableOptions?.majors && (
                                            <div className="text-xs text-gray-500">
                                                / {availableOptions.majors.filter(m => m && m.majorId).length} tổng
                                </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">{selectedItems.objects.length}</div>
                                        <div className="text-sm text-gray-600">Đối tượng ưu tiên</div>
                                        {availableOptions?.objects && (
                                            <div className="text-xs text-gray-500">
                                                / {availableOptions.objects.filter(o => o && o.objectId).length} tổng
                                </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">{selectedItems.regions.length}</div>
                                        <div className="text-sm text-gray-600">Khu vực ưu tiên</div>
                                        {availableOptions?.regions && (
                                            <div className="text-xs text-gray-500">
                                                / {availableOptions.regions.filter(r => r && r.regionId).length} tổng
                                </div>
                                        )}
                                </div>
                            </div>

                                {/* Total summary */}
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <div className="text-center">
                                        <span className="text-lg font-bold text-blue-800">
                                            Tổng cộng: {Object.values(selectedItems).reduce((sum, arr) => sum + arr.length, 0)} mục đã chọn
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons - Fixed */}
                        <div className="sticky bottom-0 bg-white z-10 flex flex-col sm:flex-row justify-between gap-3 p-6 border-t border-gray-200 rounded-b-2xl">
                            <button
                                onClick={onClose}
                                className="order-2 sm:order-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
                                title="Đóng modal và hủy thao tác"
                            >
                                <FaTimes className="w-4 h-4" />
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSave}
                                className="order-1 sm:order-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
                                title="Lưu cấu hình năm tuyển sinh"
                            >
                                <FaCheck className="w-4 h-4" />
                                Lưu cấu hình ({Object.values(selectedItems).reduce((sum, arr) => sum + arr.length, 0)} mục)
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConfigModal;
