import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

/**
 * RoutingControl Component
 * Displays route between origin and destination on the map
 * Uses OSRM (Open Source Routing Machine) for routing
 */
export default function RoutingControl({ origin, destination, onRouteFound, onRouteError }) {
  const map = useMap();
  const routingControlRef = useRef(null);
  const polylineRef = useRef(null);
  const previousOriginRef = useRef(null);
  const updateTimeoutRef = useRef(null);
  const onRouteFoundRef = useRef(onRouteFound);
  const onRouteErrorRef = useRef(onRouteError);

  // Update refs when callbacks change
  useEffect(() => {
    onRouteFoundRef.current = onRouteFound;
    onRouteErrorRef.current = onRouteError;
  }, [onRouteFound, onRouteError]);

  // Calculate distance between two points (km)
  const calculateDistance = (point1, point2) => {
    if (!point1 || !point2) return 0;
    const R = 6371;
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * 
      Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Effect 1: Create routing control (only once)
  useEffect(() => {
    if (!origin || !destination || !map) return;
    
    // Only create if doesn't exist
    if (routingControlRef.current) {
      return;
    }
    
    console.log('🆕 Creating routing control...');

    // Create routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(origin.lat, origin.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      
      // Routing options
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      
      // Line styling - IMPORTANT: This draws the blue line
      lineOptions: {
        styles: [
          {
            color: '#3B82F6', // Blue-600
            opacity: 0.9,
            weight: 5,
          },
        ],
        extendToWaypoints: false,
        missingRouteTolerance: 0,
      },
      
      // Hide default markers (we already have custom markers)
      createMarker: function() { return null; },
      
      // Use OSRM public server
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving',
        timeout: 15000, // 15 seconds timeout
      }),
      
      // Hide the default itinerary panel
      show: false,
      
      // Custom container to hide the default UI
      containerClassName: 'leaflet-routing-container-hidden',
    }).addTo(map);

    // Store reference
    routingControlRef.current = routingControl;

    // Listen for route found event
    routingControl.on('routesfound', (e) => {
      console.log('✅ Route found!', e);
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        const summary = route.summary;
        
        console.log('📍 Route details:', {
          distance: (summary.totalDistance / 1000).toFixed(1) + ' km',
          duration: Math.round(summary.totalTime / 60) + ' phút',
          coordinates: route.coordinates.length + ' points',
        });
        
        // MANUAL FIX: Draw polyline directly on map
        if (route.coordinates && route.coordinates.length > 0) {
          // Remove old polyline if exists
          if (polylineRef.current) {
            map.removeLayer(polylineRef.current);
          }
          
          // Create new polyline
          const polyline = L.polyline(route.coordinates, {
            color: '#3B82F6',
            weight: 5,
            opacity: 0.9,
            smoothFactor: 1,
          }).addTo(map);
          
          polylineRef.current = polyline;
          
          // Fit map to route bounds
          map.fitBounds(polyline.getBounds(), {
            padding: [50, 50],
          });
          
          console.log('🎨 Polyline drawn on map!');
        }
        
        if (onRouteFoundRef.current) {
          onRouteFoundRef.current({
            distance: (summary.totalDistance / 1000).toFixed(1), // Convert to km
            duration: Math.round(summary.totalTime / 60), // Convert to minutes
            coordinates: route.coordinates,
            instructions: route.instructions,
          });
        }
      }
    });

    // Listen for routing errors
    routingControl.on('routingerror', (e) => {
      console.error('❌ Routing error:', e);
      if (onRouteErrorRef.current) {
        onRouteErrorRef.current('Không thể tìm đường đi. Vui lòng thử lại.');
      }
    });
    
    // Listen for routing start
    routingControl.on('routingstart', () => {
      console.log('🔵 Routing started...');
    });

    // Store initial origin
    previousOriginRef.current = { ...origin };

    // Cleanup on unmount only
    return () => {
      console.log('🧹 Cleaning up routing control...');
      
      if (polylineRef.current) {
        try {
          map.removeLayer(polylineRef.current);
          polylineRef.current = null;
        } catch (error) {
          console.warn('⚠️ Polyline cleanup error:', error.message);
        }
      }
      
      if (routingControlRef.current) {
        try {
          routingControlRef.current.off('routesfound');
          routingControlRef.current.off('routingerror');
          routingControlRef.current.off('routingstart');
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        } catch (error) {
          console.warn('⚠️ Routing cleanup error (expected):', error.message);
        }
      }
    };
  }, [destination, map]); // Only depend on destination and map, NOT origin

  // Effect 2: Update route when origin changes (real-time tracking)
  useEffect(() => {
    if (!origin || !destination || !map || !routingControlRef.current) return;

    // Check if moved significantly
    if (previousOriginRef.current) {
      const distanceMoved = calculateDistance(previousOriginRef.current, origin);
      
      // Only update if moved more than 50 meters
      if (distanceMoved < 0.05) {
        return; // Not enough movement
      }
      
      console.log(`📍 Moved ${(distanceMoved * 1000).toFixed(0)}m, updating route...`);
    }

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce: Wait 3 seconds before updating
    updateTimeoutRef.current = setTimeout(() => {
      if (routingControlRef.current && polylineRef.current) {
        try {
          // Update waypoints (this triggers automatic re-routing)
          routingControlRef.current.setWaypoints([
            L.latLng(origin.lat, origin.lng),
            L.latLng(destination.lat, destination.lng),
          ]);
          
          // Remove old polyline
          map.removeLayer(polylineRef.current);
          polylineRef.current = null;
          
          // Store new origin
          previousOriginRef.current = { ...origin };
          
          console.log('🔄 Route updated with new origin');
        } catch (error) {
          console.error('❌ Error updating route:', error);
        }
      }
    }, 3000);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [origin]); // Only depend on origin changes

  return null; // This component doesn't render anything
}

