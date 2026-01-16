import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Zap, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { ownerAPI } from '../../../../services/api';
import QRCodeModal from '../connector/QRCodeModal';

export default function ConnectorManagementTab({ stationId }) {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    loadConnectors();
  }, [stationId]);

  const loadConnectors = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getConnectors(stationId);
      // Handle different response structures
      const connectorsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);
      setConnectors(connectorsData);
    } catch (error) {
      console.error('Error loading connectors:', error);
      toast.error('Không thể tải danh sách cổng sạc');
      setConnectors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (connectorId, newStatus) => {
    try {
      await ownerAPI.changeConnectorStatus(connectorId, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      loadConnectors();
    } catch (error) {
      console.error('Error changing status:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleShowQR = (connector) => {
    setSelectedConnector(connector);
    setShowQRModal(true);
  };

  const statusConfig = {
    trong: { label: 'Trống', color: 'green' },
    dang_su_dung: { label: 'Đang sử dụng', color: 'blue' },
    bao_tri: { label: 'Bảo trì', color: 'red' }
  };

  // Get unique connector types for filter
  const connectorTypes = ['all', ...new Set(connectors.map(c => c.ma_cong).filter(Boolean))];

  // Filter connectors by type
  const filteredConnectors = filterType === 'all' 
    ? connectors 
    : connectors.filter(c => c.ma_cong === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Filter */}
      <div className="mb-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Quản lý cổng sạc</h2>
        
        {/* Filter Dropdown */}
        {connectors.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Lọc theo loại:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả loại cổng</option>
              {connectorTypes.filter(t => t !== 'all').map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600">
              ({filteredConnectors.length} cổng)
            </span>
          </div>
        )}
      </div>

      {/* Connectors Grid */}
      {connectors.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có cổng sạc nào</h3>
          <p className="text-gray-600">Trạm này chưa có cổng sạc</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConnectors.map((connector) => {
            const status = statusConfig[connector.trang_thai] || statusConfig.trong;
            return (
              <div key={connector.id_cong_sac} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-${status.color}-100 rounded-lg flex items-center justify-center`}>
                      <Zap className={`w-6 h-6 text-${status.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{connector.ma_cong_tram || 'Cổng sạc'}</h3>
                      <span className={`text-xs px-2 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div>Loại: <span className="font-medium text-gray-900">{connector.ma_cong || 'N/A'}</span></div>
                  <div>Công suất: <span className="font-medium text-gray-900">{connector.cong_suat_kwh || 0} kW</span></div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* QR Code Button */}
                  <button
                    onClick={() => handleShowQR(connector)}
                    className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Tạo QR Code
                  </button>

                  {/* Status Update */}
                  {connector.trang_thai !== 'dang_su_dung' && (
                    <select
                      value={connector.trang_thai}
                      onChange={(e) => handleChangeStatus(connector.id_cong_sac, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="trong">Trống</option>
                      <option value="bao_tri">Bảo trì</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedConnector && (
        <QRCodeModal
          connector={selectedConnector}
          onClose={() => {
            setShowQRModal(false);
            setSelectedConnector(null);
          }}
        />
      )}
    </div>
  );
}

ConnectorManagementTab.propTypes = {
  stationId: PropTypes.number.isRequired
};

