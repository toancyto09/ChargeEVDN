import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageLayout from '../../../components/layout/PageLayout';
import CompanyManagementTab from '../components/company/CompanyManagementTab';

export default function CompanyManagementPage() {
  const navigate = useNavigate();

  return (
    <PageLayout className="bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Quản lý Doanh nghiệp</h1>
            </div>
          </div>
          <p className="text-teal-100 ml-14">Quản lý và duyệt hồ sơ doanh nghiệp</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CompanyManagementTab />
      </div>
    </PageLayout>
  );
}
