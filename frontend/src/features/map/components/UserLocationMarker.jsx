import { Marker, Circle } from 'react-leaflet';
import L from 'leaflet';

// Create custom icon for user location
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background-color: #3B82F6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function UserLocationMarker({ position, accuracy }) {
  return (
    <>
      {/* Accuracy circle */}
      {accuracy && (
        <Circle
          center={position}
          radius={accuracy}
          pathOptions={{
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.1,
            weight: 1,
          }}
        />
      )}

      {/* User marker */}
      <Marker position={position} icon={userLocationIcon} />
    </>
  );
}
