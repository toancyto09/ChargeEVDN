import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ownerAPI } from '../../../services/api';

const OwnerStationContext = createContext();

export function OwnerStationProvider({ children }) {
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all stations của owner
  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getStations();
      
      // Handle different response structures
      const stationsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);
      
      setStations(stationsData);
      
      // Don't auto-select - let pages control which station to select
    } catch (error) {
      console.error('Error loading stations:', error);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const currentStation = Array.isArray(stations) 
    ? stations.find(s => s.id_tram === selectedStationId)
    : null;

  const value = {
    selectedStationId,
    setSelectedStationId,
    stations,
    currentStation,
    loading,
    refreshStations: loadStations
  };

  return (
    <OwnerStationContext.Provider value={value}>
      {children}
    </OwnerStationContext.Provider>
  );
}

OwnerStationProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useOwnerStation() {
  const context = useContext(OwnerStationContext);
  if (!context) {
    throw new Error('useOwnerStation must be used within OwnerStationProvider');
  }
  return context;
}

