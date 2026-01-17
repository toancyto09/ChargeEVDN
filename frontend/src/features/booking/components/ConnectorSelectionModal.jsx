import { X, Zap, CheckCircle } from 'lucide-react';

export default function ConnectorSelectionModal({ 
  isOpen, 
  onClose, 
  connectors = [], 
  vehicleConnectorType,
  onSelectConnector 
}) {
  if (!isOpen) return null;

  // DEBUG: Log để kiểm tra data
  console.log('🔍 ConnectorSelectionModal - Total connectors:', connectors.length);
  console.log('🔍 Connectors data:', connectors);

  // Filter và group connectors theo loại
  const groupedConnectors = connectors.reduce((acc, connector) => {
    const type = connector.loai_cong;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(connector);
    return acc;
  }, {});

  console.log('🔍 Grouped connectors:', groupedConnectors);

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Chọn cổng sạc</h2>
              <p className="text-blue-100 text-sm">
                Chọn vị trí cổng sạc bạn muốn sử dụng
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-140px)]">
          {Object.entries(groupedConnectors).map(([connectorType, connectorList]) => {
            const isCompatible = connectorType === vehicleConnectorType;
            const hasAvailable = connectorList.some(c => parseInt(c.cong_trong) > 0);

            return (
              <div key={connectorType} className="space-y-3">
                {/* Type Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    {connectorType}
                  </h3>
                  {isCompatible && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      ✓ Phù hợp với xe bạn
                    </span>
                  )}
                </div>

                {/* Connector Cards */}
                <div className="grid grid-cols-1 gap-2">
                  {connectorList.map((connector) => {
                    const isAvailable = parseInt(connector.cong_trong) > 0;
                    const totalPorts = parseInt(connector.tong_cong) || 1;
                    const availablePorts = parseInt(connector.cong_trong) || 0;

                    return (
                      <button
                        key={connector.id_cong_sac}
                        onClick={() => {
                          if (isAvailable) {
                            onSelectConnector(connector);
                          }
                        }}
                        disabled={!isAvailable}
                        className={`
                          w-full text-left p-4 rounded-xl border-2 transition-all
                          ${isAvailable 
                            ? 'border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer hover:scale-[1.02]' 
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono font-bold text-gray-900">
                                {connector.ma_cong_tram}
                              </span>
                              {isAvailable ? (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                  Trống
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                  Đang sử dụng
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                {connector.cong_suat_kwh} kW
                              </span>
                              <span>•</span>
                              <span>{availablePorts}/{totalPorts} cổng trống</span>
                            </div>
                          </div>

                          {isAvailable && (
                            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!hasAvailable && (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    ⚠️ Tất cả cổng {connectorType} đang được sử dụng
                  </p>
                )}
              </div>
            );
          })}

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
            <p className="text-sm text-blue-800">
              💡 <strong>Gợi ý:</strong> Chọn cổng phù hợp với loại xe của bạn và đang có chỗ trống.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
