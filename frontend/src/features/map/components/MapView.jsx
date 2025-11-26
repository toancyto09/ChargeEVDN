import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import StationMarker from './StationMarker';
import UserLocationMarker from './UserLocationMarker';
import MapControls from './MapControls';
import RoutingControl from './RoutingControl';
import RouteInfoPanel from './RouteInfoPanel';
import 'leaflet/dist/leaflet.css';
import '../styles/routing.css';

// Component to handle map center changes
function MapController({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}


export default function MapView({
  center,
  userLocation,
  stations,
  onStationClick,
  highlightedStationId,
  onMyLocationClick,
  routeDestination,
  routeStationName,
  onRouteFound,
  onRouteError,
  onClearRoute,
  routeInfo,
  onShowRoute,
}) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      className="w-full h-full relative z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController center={center} />

      {/* User location marker */}
      {userLocation && (
        <UserLocationMarker
          position={[userLocation.lat, userLocation.lng]}
          accuracy={userLocation.accuracy}
        />
      )}

      {/* Station markers with stable key */}
      {stations.map((station, idx) => (
        <StationMarker
          key={station.id || station.id_tram || idx}
          station={station}
          onStationClick={onStationClick}
          isHighlighted={station.id === highlightedStationId}
          userLocation={userLocation}
          onShowRoute={onShowRoute}
        />
      ))}

      {/* Routing Control */}
      {userLocation && routeDestination && (
        <RoutingControl
          origin={userLocation}
          destination={routeDestination}
          onRouteFound={onRouteFound}
          onRouteError={onRouteError}
        />
      )}

      {/* Route Info Panel */}
      {routeInfo && (
        <RouteInfoPanel
          routeInfo={routeInfo}
          stationName={routeStationName}
          onClear={onClearRoute}
        />
      )}

      {/* Map controls */}
      <MapControls
        onMyLocationClick={onMyLocationClick}
        hasUserLocation={!!userLocation}
      />
    </MapContainer>
  );
}
