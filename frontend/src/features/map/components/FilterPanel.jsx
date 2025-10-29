import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function FilterPanel({ filters, onFiltersChange, onClose, isDesktop }) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);

    // On desktop, apply filters immediately
    if (isDesktop) {
      onFiltersChange(newFilters);
    }
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    if (!isDesktop) {
      onClose();
    }
  };

  const handleProviderToggle = (provider) => {
    const currentProviders = localFilters.providers || [];
    const newProviders = currentProviders.includes(provider)
      ? currentProviders.filter((p) => p !== provider)
      : [...currentProviders, provider];

    handleFilterChange('providers', newProviders);
  };

  const handleReset = () => {
    const resetFilters = {
      status: 'all',
      connectorType: 'all',
      powerRange: 'all',
      maxPrice: 10000,
      maxDistance: 20,
      providers: [],
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Header - Only show on mobile */}
      {!isDesktop && (
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Connector Type Filter - Button Grid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Loại cổng sạc
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('connectorType', 'all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                localFilters.connectorType === 'all'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              GB/T
            </button>
            <button
              onClick={() => handleFilterChange('connectorType', 'CCS2')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                localFilters.connectorType === 'CCS2'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              DC - CCS2
            </button>
            <button
              onClick={() => handleFilterChange('connectorType', 'Type 2')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                localFilters.connectorType === 'Type 2'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              AC - Type 2
            </button>
          </div>
        </div>

        {/* Power Filter - Button Grid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Công suất
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'AC (1.5kW - 22kW)' },
              { value: '30-60', label: 'DC 30kW - 60kW' },
              { value: '60-120', label: 'DC 60kW - 120kW' },
              { value: '120-150', label: 'DC 120kW - 150kW' },
              { value: '150-350', label: 'DC 150kW - 350kW' },
              { value: '350-500', label: 'DC 350kW - 500kW' },
            ].map((power) => (
              <button
                key={power.value}
                onClick={() => handleFilterChange('powerRange', power.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  localFilters.powerRange === power.value
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {power.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Filter - Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giá tối đa:{' '}
            {localFilters.maxPrice?.toLocaleString('vi-VN') || '10,000'} đ/kWh
          </label>
          <input
            type="range"
            min="4000"
            max="10000"
            step="100"
            value={localFilters.maxPrice || 10000}
            onChange={(e) =>
              handleFilterChange('maxPrice', parseInt(e.target.value))
            }
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>4,000đ</span>
            <span>10,000đ</span>
          </div>
        </div>

        {/* Provider Filter - Multi-select Button Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Nhà cung cấp
            </label>
            <button
              onClick={() => handleFilterChange('providers', [])}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Xóa chọn
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'VinFast',
              'E Charge International',
              'BIT Charge',
              'EV One',
              'EverCharge',
            ].map((provider) => (
              <button
                key={provider}
                onClick={() => handleProviderToggle(provider)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  (localFilters.providers || []).includes(provider)
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {provider}
              </button>
            ))}
          </div>
          {(localFilters.providers || []).length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Đã chọn: {(localFilters.providers || []).length} nhà cung cấp
            </p>
          )}
        </div>

        {/* Max Distance Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khoảng cách tối đa: {localFilters.maxDistance} km
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={localFilters.maxDistance}
            onChange={(e) =>
              handleFilterChange('maxDistance', parseFloat(e.target.value))
            }
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 km</span>
            <span>20 km</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-white flex gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors active:bg-gray-100"
        >
          Đặt lại
        </button>
        {!isDesktop && (
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-95"
          >
            Áp dụng
          </button>
        )}
      </div>
    </div>
  );

  // Desktop: Return inline content
  if (isDesktop) {
    return content;
  }

  // Mobile: Return modal overlay - SCROLLABLE
  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end lg:items-center lg:justify-center">
      <div className="bg-white w-full h-[90vh] rounded-t-2xl lg:rounded-2xl lg:max-w-md lg:h-auto lg:max-h-[90vh] flex flex-col">
        {content}
      </div>
    </div>
  );
}
