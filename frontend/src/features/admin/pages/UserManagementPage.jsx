import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, Shield, Search, Filter, ArrowLeft, Eye, Lock, Unlock, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../../../services/api';
import PageLayout from '../../../components/layout/PageLayout';
import UserDetailModal from '../components/UserDetailModal';
import CreateUserModal from '../components/CreateUserModal';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, [filters.role, filters.status]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.role !== 'all') params.role = filters.role;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const [usersRes, statsRes] = await Promise.all([
        adminAPI.getUsers(params),
        adminAPI.getUserStats()
      ]);

      const usersData = usersRes.data?.data?.users || usersRes.data?.users || [];
      const statsData = statsRes.data?.data || statsRes.data || null;

      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Không thể tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleViewDetail = (user) => {
    setSelectedUser(user);
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      const statusText = newStatus === 'hoat_dong' ? 'Kích hoạt' : newStatus === 'khoa' ? 'Khóa' : 'Cập nhật';
      toast.success(`${statusText} người dùng thành công`);
      loadData();
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const getRoleBadge = (role) => {
    const config = {
      user: { label: 'User', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      owner: { label: 'Owner', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      admin: { label: 'Admin', color: 'bg-red-100 text-red-700 border-red-200' }
    };

    const c = config[role] || config.user;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${c.color}`}>
        {role === 'admin' && <Shield className="w-3 h-3" />}
        {c.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      hoat_dong: { label: 'Hoạt động', color: 'bg-green-100 text-green-700 border-green-200', icon: UserCheck },
      khoa: { label: 'Đã khóa', color: 'bg-red-100 text-red-700 border-red-200', icon: UserX },
      cho_xac_thuc: { label: 'Chờ xác thực', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: UserCheck }
    };

    const c = config[status] || config.hoat_dong;
    const Icon = c.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${c.color}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Quản lý Người dùng</h1>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              Tạo tài khoản mới
            </button>
          </div>
          <p className="text-blue-100 ml-14">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.total_users || 0}</h3>
              <p className="text-sm text-gray-600">Tổng người dùng</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.by_role?.owner || 0}</h3>
              <p className="text-sm text-gray-600">Chủ sở hữu</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.by_status?.hoat_dong || 0}</h3>
              <p className="text-sm text-gray-600">Đang hoạt động</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.by_status?.khoa || 0}</h3>
              <p className="text-sm text-gray-600">Đã khóa</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tìm
              </button>
            </form>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="user">User</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="hoat_dong">Hoạt động</option>
              <option value="khoa">Đã khóa</option>
              <option value="cho_xac_thuc">Chờ xác thực</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {users.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có người dùng nào</h3>
            <p className="text-gray-600">Không tìm thấy người dùng với bộ lọc hiện tại</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Người dùng</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Liên hệ</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Vai trò</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id_nguoi_dung} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.duong_dan_anh_dai_dien ? (
                            <img
                              src={user.duong_dan_anh_dai_dien}
                              alt={user.ho_ten}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{user.ho_ten}</div>
                            {user.ten_doanh_nghiep && (
                              <div className="text-xs text-gray-500">{user.ten_doanh_nghiep}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-600">{user.so_dien_thoai || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getRoleBadge(user.vai_tro)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(user.trang_thai)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {formatDate(user.ngay_tao)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(user)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Chi tiết
                          </button>
                          {user.vai_tro !== 'admin' && (
                            <button
                              onClick={() => handleUpdateStatus(
                                user.id_nguoi_dung,
                                user.trang_thai === 'khoa' ? 'hoat_dong' : 'khoa'
                              )}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                                user.trang_thai === 'khoa'
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              {user.trang_thai === 'khoa' ? (
                                <>
                                  <Unlock className="w-4 h-4" />
                                  Mở khóa
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4" />
                                  Khóa
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          onUpdateStatus={handleUpdateStatus}
          onSuccess={loadData}
        />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadData}
      />
    </PageLayout>
  );
}
