import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  X,
  Plus,
  Edit,
  Trash2,
  Zap,
  Power,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ownerAPI } from '../../../../services/api';
import AddConnectorModal from './AddConnectorModal';
import EditConnectorModal from './EditConnectorModal';

/**
 * Connector Management Modal
 * View and manage connectors for a station
 */
export default function ConnectorManagementModal({ isOpen, onClose, station }) {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState(null);

  useEffect(() => {
    if (isOpen && station) {
      loadConnectors();
    }
  }, [isOpen, station]);

  const loadConnectors = async () => {
    setLoading(true);
    try {
      const response = await ownerAPI.getConnectors(station.id_tram);
      if (response.data.success) {
        setConnectors(response.data.data);
      }
    } catch (error) {
      console.error('Load connectors error:', error);
      toast.error('Không thể tải danh sách cổng sạc');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (connector) => {
    if (!confirm(`Xóa cổng "${connector.ma_cong_tram}"?`)) return;

    try {
      const response = await ownerAPI.deleteConnector(connector.id_cong_sac);
      if (response.data.success) {
        toast.success('Xóa cổng sạc thành công');
        loadConnectors();
      }
    } catch (error) {
      console.error('Delete connector error:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa cổng sạc');
    }
  };

  const handleChangeStatus = async (connector, newStatus) => {
    try {
      const response = await ownerAPI.changeConnectorStatus(
        connector.id_cong_sac,
        newStatus
      );
      if (response.data.success) {
        toast.success('Thay đổi trạng thái thành công');
        loadConnectors();
      }
    } catch (error) {
      console.error('Change status error:', error);
      toast.error(
        error.response?.data?.message || 'Không thể thay đổi trạng thái'
      );
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      trong: {
        label: 'Trống',
        color: 'bg-green-100 text-green-800',
        icon: Power,
      },
      dang_su_dung: {
        label: 'Đang dùng',
        color: 'bg-blue-100 text-blue-800',
        icon: Zap,
      },
      bao_tri: {
        label: 'Bảo trì',
        color: 'bg-orange-100 text-orange-800',
        icon: Wrench,
      },
    };

    const config = statusConfig[status] || statusConfig['trong'];
    const Icon = config.icon;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (!isOpen || !station) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Quản lý cổng sạc</h2>
                  <p className="text-purple-100 text-sm mt-1">
                    {station.ten_tram}
                  </p>
                </div>
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
          <div className="flex-1 overflow-y-auto p-6">
            {/* Add Button */}
            <div className="mb-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {connectors.length} cổng sạc
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
              >
                <Plus className="w-5 h-5" />
                Thêm cổng mới
              </button>
            </div>

            {/* Connectors List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : connectors.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">
                  Chưa có cổng sạc nào
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Thêm cổng sạc để bắt đầu nhận đặt chỗ
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Thêm cổng đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {connectors.map((connector) => (
                  <div
                    key={connector.id_cong_sac}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {connector.ma_cong_tram}
                          </h3>
                          {getStatusBadge(connector.trang_thai)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Zap className="w-4 h-4 text-purple-500" />
                            <span>
                              Loại: <strong>{connector.ma_cong}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Power className="w-4 h-4 text-indigo-500" />
                            <span>
                              Công suất:{' '}
                              <strong>{connector.cong_suat_kwh} kW</strong>
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Tạo:{' '}
                            {new Date(connector.ngay_tao).toLocaleDateString(
                              'vi-VN'
                            )}
                          </div>
                        </div>

                        {connector.mo_ta_loai_cong && (
                          <p className="text-sm text-gray-500 mt-2">
                            {connector.mo_ta_loai_cong}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {/* Status Change Dropdown */}
                        <select
                          value={connector.trang_thai}
                          onChange={(e) =>
                            handleChangeStatus(connector, e.target.value)
                          }
                          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          title="Thay đổi trạng thái"
                        >
                          <option value="trong">Trống</option>
                          <option value="dang_su_dung">Đang dùng</option>
                          <option value="bao_tri">Bảo trì</option>
                        </select>

                        <button
                          onClick={() => {
                            setSelectedConnector(connector);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDelete(connector)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Notice */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Lưu ý:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Cổng "Đang dùng" không thể xóa</li>
                    <li>Cổng có đặt chỗ đang hoạt động không thể xóa</li>
                    <li>Thay đổi trạng thái để bảo trì hoặc mở lại cổng</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <AddConnectorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadConnectors();
        }}
        station={station}
      />

      <EditConnectorModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedConnector(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedConnector(null);
          loadConnectors();
        }}
        connector={selectedConnector}
        station={station}
      />
    </>
  );
}

ConnectorManagementModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  station: PropTypes.object,
};
