import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Zap, AlertCircle, Filter } from 'lucide-react';
import { sessionAPI } from '../../../services/api';
import PageLayout from '../../../components/layout/PageLayout';
import ChargingSessionCard from '../components/ChargingSessionCard';

/**
 * SessionsPage
 * View all user's charging sessions with filters
 */
export default function SessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'dang_sac', 'hoan_thanh'
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [filter]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const statusParam = filter === 'all' ? null : filter;
      const response = await sessionAPI.getMySessions(statusParam);
      
      if (response.data.success) {
        setSessions(response.data.data);
      }
    } catch (error) {
      console.error('Load sessions error:', error);
      toast.error('Không thể tải danh sách phiên sạc');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (session) => {
    navigate(`/sessions/${session.id_phien_sac}`);
  };

  const filterOptions = [
    { value: 'all', label: 'Tất cả', count: sessions.length },
    { 
      value: 'dang_sac', 
      label: 'Đang sạc', 
      count: sessions.filter(s => s.trang_thai === 'dang_sac').length 
    },
    { 
      value: 'hoan_thanh', 
      label: 'Hoàn thành', 
      count: sessions.filter(s => s.trang_thai === 'hoan_thanh').length 
    },
  ];

  return (
    <PageLayout title="Phiên sạc của tôi">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Lọc theo trạng thái
            </h3>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium lg:hidden"
            >
              {showFilter ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
          
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${showFilter ? 'block' : 'hidden lg:grid'}`}>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilter(option.value);
                  setShowFilter(false);
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  filter === option.value
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-sm opacity-75">{option.count} phiên</div>
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          </div>
        )}

        {/* Sessions List */}
        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Zap className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có phiên sạc nào
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Bạn chưa có phiên sạc nào'
                : `Không có phiên sạc ở trạng thái "${filterOptions.find(f => f.value === filter)?.label}"`
              }
            </p>
            <button
              onClick={() => navigate('/map')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
            >
              Tìm trạm sạc
            </button>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <div className="space-y-4">
            {sessions.map((session) => (
              <ChargingSessionCard
                key={session.id_phien_sac}
                session={session}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

