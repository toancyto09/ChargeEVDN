import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Building2, Plus, Search, Filter,  Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../../../../services/api';
import AddCompanyModal from './AddCompanyModal';
import CompanyDetailModal from './CompanyDetailModal';

export default function CompanyManagementTab() {
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    trang_thai: 'all',
    search: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companiesRes, statsRes] = await Promise.all([
        adminAPI.getCompanies(filters.trang_thai === 'all' ? { search: filters.search } : filters),
        adminAPI.getCompanyStats()
      ]);

      setCompanies(companiesRes.data.data || companiesRes.data);
      setStats(statsRes.data.data || statsRes.data);
    } catch (error) {
      console.error('Load companies error:', error);
      toast.error('Không thể tải danh sách doanh nghiệp');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (company) => {
    setSelectedCompany(company);
  };

  const statusConfig = {
    cho_duyet: { label: 'Chờ duyệt', color: 'yellow', icon: Clock },
    da_duyet: { label: 'Đã duyệt', color: 'green', icon: CheckCircle },
    tu_choi: { label: 'Từ chối', color: 'red', icon: XCircle },
    active: { label: 'Hoạt động', color: 'green', icon: CheckCircle }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
            <div className="text-sm text-gray-600">Tổng DN</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-900">{stats.cho_duyet || 0}</div>
            <div className="text-sm text-yellow-700">Chờ duyệt</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-900">{stats.da_duyet || 0}</div>
            <div className="text-sm text-green-700">Đã duyệt</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-900">{stats.tu_choi || 0}</div>
            <div className="text-sm text-red-700">Từ chối</div>
          </div>
        </div>
      )}

      {/* Actions & Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm doanh nghiệp..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.trang_thai}
              onChange={(e) => setFilters({ ...filters, trang_thai: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="cho_duyet">Chờ duyệt</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="tu_choi">Từ chối</option>
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm DN mới
          </button>
        </div>
      </div>

      {/* Companies Table */}
      {companies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có doanh nghiệp nào</h3>
          <p className="text-gray-600">Bấm "Thêm DN mới" để tạo doanh nghiệp</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tên DN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Chủ sở hữu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Liên hệ</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies.map((company) => {
                  const status = statusConfig[company.trang_thai] || statusConfig.active;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={company.id_doanh_nghiep} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">#{company.id_doanh_nghiep}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{company.ten_doanh_nghiep}</div>
                        <div className="text-sm text-gray-600">{company.dia_chi}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{company.ten_chu_so_huu || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{company.email_chu_so_huu || ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{company.email_lien_he}</div>
                        <div className="text-sm text-gray-600">{company.so_dien_thoai}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full text-xs font-medium`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewDetail(company)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddCompanyModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}

      {selectedCompany && (
        <CompanyDetailModal
          isOpen={true}
          onClose={() => setSelectedCompany(null)}
          company={selectedCompany}
          onSuccess={() => {
            setSelectedCompany(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
