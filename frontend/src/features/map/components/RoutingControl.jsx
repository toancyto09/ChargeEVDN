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
  const onRouteFoundRef = useRef(onRouteFound);
  const onRouteErrorRef = useRef(onRouteError);

  // Update refs when callbacks change
  useEffect(() => {
    onRouteFoundRef.current = onRouteFound;
    onRouteErrorRef.current = onRouteError;
  }, [onRouteFound, onRouteError]);

  useEffect(() => {
    if (!origin || !destination || !map) return;
    
    // Prevent multiple routing controls
    if (routingControlRef.current) {
      console.log('⚠️ Routing control already exists, skipping...');
      return;
    }

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

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up routing control...');
      
      // Remove polyline first
      if (map && polylineRef.current) {
        try {
          map.removeLayer(polylineRef.current);
          polylineRef.current = null;
          console.log('🧹 Polyline removed');
        } catch (error) {
          console.warn('⚠️ Polyline cleanup error:', error.message);
        }
      }
      
      // Remove routing control
      if (map && routingControlRef.current) {
        try {
          // Remove event listeners first
          routingControlRef.current.off('routesfound');
          routingControlRef.current.off('routingerror');
          routingControlRef.current.off('routingstart');
          
          // Remove from map
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        } catch (error) {
          // Silently suppress the error - this is a known bug in leaflet-routing-machine
          console.warn('⚠️ Routing cleanup error (expected):', error.message);
        }
      }
    };
  }, [origin, destination, map]); // Remove onRouteFound, onRouteError from deps

  return null; // This component doesn't render anything
}

