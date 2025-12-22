import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Zap, Users, Activity } from 'lucide-react';
import { useOwnerStation } from '../contexts/OwnerStationContext';
import StationSelector from '../components/shared/StationSelector';
import PageLayout from '../../../components/layout/PageLayout';

// Tab components (will create these)
import StationOverviewTab from '../components/workspace/StationOverviewTab';
import ConnectorManagementTab from '../components/workspace/ConnectorManagementTab';
import BookingManagementTab from '../components/workspace/BookingManagementTab';
import SessionManagementTab from '../components/workspace/SessionManagementTab';

export default function OwnerStationWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setSelectedStationId, currentStation } = useOwnerStation();
  const [localStation, setLocalStation] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const activeTab = searchParams.get('tab') || 'overview';

  // Sync URL param with context
  useEffect(() => {
    if (id) {
      setSelectedStationId(Number(id));
      // Mark as initialized after setting ID from URL
      setIsInitialized(true);
    }
  }, [id, setSelectedStationId]);

  // Fetch station info directly for header
  useEffect(() => {
    const fetchStation = async () => {
      if (!id) return;
      try {
        const { ownerAPI } = await import('../../../services/api');
        const response = await ownerAPI.getStation(Number(id));
        const stationData = response.data?.data || response.data;
        setLocalStation(stationData);
      } catch (error) {
        console.error('Error loading station:', error);
      }
    };
    fetchStation();
  }, [id]);

  // When station changes via selector, update URL (but not on initial load)
  useEffect(() => {
    // Only redirect if initialized and currentStation doesn't match URL
    if (isInitialized && currentStation && currentStation.id_tram !== Number(id)) {
      navigate(`/owner/stations/${currentStation.id_tram}?tab=${activeTab}`);
    }
  }, [currentStation, id, activeTab, navigate, isInitialized]);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'connectors', label: 'Cổng sạc', icon: Zap },
    { id: 'bookings', label: 'Đặt chỗ', icon: Users },
    { id: 'sessions', label: 'Phiên sạc', icon: Activity }
  ];

  return (
    <PageLayout className="bg-gray-50">
      {/* Header - closer to left edge */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="px-3 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Quản lý trạm</h1>
            {(localStation || currentStation) && (
              <p className="text-sm text-gray-600 mt-0.5">
                {localStation?.ten_tram || currentStation?.ten_tram}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap transition-colors
                  ${isActive 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <StationOverviewTab stationId={Number(id)} />}
        {activeTab === 'connectors' && <ConnectorManagementTab stationId={Number(id)} />}
        {activeTab === 'bookings' && <BookingManagementTab stationId={Number(id)} />}
        {activeTab === 'sessions' && <SessionManagementTab stationId={Number(id)} />}
      </div>
    </PageLayout>
  );
}

