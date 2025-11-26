import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Car } from 'lucide-react';
import { toast } from 'sonner';
import VehicleCard from '../components/VehicleCard';
import AddVehicleModal from '../components/AddVehicleModal';
import EditVehicleModal from '../components/EditVehicleModal';
import PageLayout from '../../../components/layout/PageLayout';

export default function VehiclesPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [connectorTypes, setConnectorTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    loadVehicles();
    loadConnectorTypes();
  }, []);

  const loadVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8080/api/vehicles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setVehicles(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Load vehicles error:', error);
      toast.error('Không thể tải danh sách phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const loadConnectorTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/vehicles/connectors/types', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setConnectorTypes(data.data);
      }
    } catch (error) {
      console.error('Load connector types error:', error);
    }
  };

  const handleAddVehicle = async (vehicleData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Sending vehicle data:', vehicleData);
      
      const response = await fetch('http://localhost:8080/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vehicleData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        toast.success('Thêm phương tiện thành công!');
        loadVehicles();
      } else {
        // Hiển thị lỗi validation chi tiết
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach(err => {
            toast.error(err.msg || err.message);
          });
        } else {
          toast.error(data.message || 'Không thể thêm phương tiện');
        }
        throw new Error(data.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Add vehicle error:', error);
      if (!error.message.includes('Validation')) {
        toast.error(error.message || 'Không thể thêm phương tiện. Vui lòng thử lại.');
      }
      throw error;
    }
  };

  const handleEditVehicle = async (vehicleId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Cập nhật phương tiện thành công!');
        loadVehicles();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Edit vehicle error:', error);
      toast.error(error.message || 'Không thể cập nhật phương tiện');
      throw error;
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phương tiện này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Xóa phương tiện thành công!');
        loadVehicles();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Delete vehicle error:', error);
      toast.error(error.message || 'Không thể xóa phương tiện');
    }
  };

  const handleUpdateSOC = async (vehicleId, soc) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/vehicles/${vehicleId}/soc`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ soc }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Cập nhật mức pin thành công!');
        loadVehicles();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Update SOC error:', error);
      toast.error(error.message || 'Không thể cập nhật mức pin');
    }
  };

  const handleSetMainVehicle = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/vehicles/${vehicleId}/set-main`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Đã đặt làm xe chính!');
        loadVehicles();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Set main vehicle error:', error);
      toast.error(error.message || 'Không thể đặt xe chính');
    }
  };

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">Phương tiện của tôi</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Thêm xe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {vehicles.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chưa có phương tiện nào
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Thêm phương tiện đầu tiên của bạn để bắt đầu sử dụng dịch vụ sạc xe điện
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Thêm phương tiện
            </button>
          </div>
        ) : (
          // Vehicle Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(vehicle => (
              <VehicleCard
                key={vehicle.id_phuong_tien}
                vehicle={vehicle}
                onEdit={handleEditClick}
                onDelete={handleDeleteVehicle}
                onUpdateSOC={handleUpdateSOC}
                onSetMain={handleSetMainVehicle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddVehicle}
        connectorTypes={connectorTypes}
      />

      <EditVehicleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedVehicle(null);
        }}
        onSubmit={handleEditVehicle}
        vehicle={selectedVehicle}
        connectorTypes={connectorTypes}
      />
    </PageLayout>
  );
}

