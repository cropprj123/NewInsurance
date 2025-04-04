import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import * as turf from '@turf/turf';

const MapWithDiseases = ({ location, diseases, radius }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const radiusLayer = useRef(null);

  useEffect(() => {
    maptilersdk.config.apiKey = "DrLHBz4sGQJTXNNCWdc3";

    if (!location) return;

    if (!map.current) {
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [location.longitude, location.latitude],
        zoom: 15
      });

      // Add source and layer for radius circle when map loads
      map.current.on('load', () => {
        // Create a circle using turf
        const point = turf.point([location.longitude, location.latitude]);
        const circle = turf.circle(point, radius / 1000, { steps: 64, units: 'kilometers' });

        map.current.addSource('radius', {
          type: 'geojson',
          data: circle
        });

        map.current.addLayer({
          id: 'radius-circle',
          type: 'fill',
          source: 'radius',
          paint: {
            'fill-color': 'rgba(66, 133, 244, 0.1)', // Light blue with transparency
            'fill-outline-color': '#4285F4' // Google Maps blue color
          }
        });

        map.current.addLayer({
          id: 'radius-outline',
          type: 'line',
          source: 'radius',
          paint: {
            'line-color': '#4285F4',
            'line-width': 2
          }
        });

        radiusLayer.current = { circle, point };
      });
    }

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for diseases
    if (diseases) {
      diseases.forEach(disease => {
        const coordinates = disease.geolocation.coordinates;
        const marker = new maptilersdk.Marker()
          .setLngLat(coordinates)
          .setPopup(
            new maptilersdk.Popup().setHTML(
              `<div>
                <h3 class="font-semibold text-gray-900">${disease.cropDiseaseName}</h3>
                <p class="text-sm text-gray-700">Confidence: ${(disease.diseaseConfidence * 100).toFixed(1)}%</p>
                <p class="text-sm text-gray-700">Reported: ${new Date(disease.createdAt).toLocaleDateString()}</p>
              </div>`
            )
          )
          .addTo(map.current);

        markers.current.push(marker);
      });
    }

    // Update radius circle when radius changes
    if (map.current.getSource('radius')) {
      // Create a new circle with updated radius
      const point = turf.point([location.longitude, location.latitude]);
      const circle = turf.circle(point, radius / 1000, { steps: 64, units: 'kilometers' });

      map.current.getSource('radius').setData(circle);
      radiusLayer.current = { circle, point };
    }

  }, [location, diseases, radius]);

  return (
    <div
      ref={mapContainer}
      className="h-[500px] w-full rounded-lg overflow-hidden"
    />
  );
};

const NearbyDiseases = () => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(500); // Default 500m radius

  useEffect(() => {
    // Get user's location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(newLocation);
          fetchNearbyDiseases(newLocation, radius);
        },
        (error) => {
          setLocationError('Unable to get your location. Please enable location services.');
          console.error('Location Error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  const fetchNearbyDiseases = async (loc, rad) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/farmer-disease-locations/nearby', {
        params: {
          latitude: loc.latitude,
          longitude: loc.longitude,
          radius: rad
        }
      });
      setDiseases(response.data.data.diseases);
    } catch (err) {
      console.error('Error fetching nearby diseases:', err);
      setError('Failed to fetch nearby diseases');
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value);
    setRadius(newRadius);
    if (location) {
      fetchNearbyDiseases(location, newRadius);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Nearby Disease Reports
          </h1>

          {locationError && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{locationError}</p>
            </div>
          )}

          {location && (
            <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg flex items-center">
              <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>Your location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              Search Radius: {radius} meters
            </p>
            <div className="mb-6">
              <input
                type="range"
                value={radius}
                onChange={handleRadiusChange}
                min={100}
                max={1000}
                step={100}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mycol-mint"
              />
              <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                <span>100m</span>
                <span>500m</span>
                <span>1km</span>
              </div>
            </div>

            {location ? (
              <MapWithDiseases
                location={location}
                diseases={diseases}
                radius={radius}
              />
            ) : (
              <div className="h-[500px] w-full rounded-lg bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Waiting for location...</p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center my-8">
              <Loader2 className="w-8 h-8 text-mycol-mint animate-spin" />
            </div>
          ) : error ? (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md">
              <table className="w-full border-collapse bg-white text-left text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-900">Disease Name</th>
                    <th className="px-6 py-4 font-medium text-gray-900 text-right">Confidence</th>
                    <th className="px-6 py-4 font-medium text-gray-900 text-right">Date Reported</th>
                    <th className="px-6 py-4 font-medium text-gray-900 text-right">Distance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                  {diseases.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No diseases reported in this area
                      </td>
                    </tr>
                  ) : (
                    diseases.map((disease) => (
                      <tr key={disease._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {disease.cropDiseaseName}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            {(disease.diseaseConfidence * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {new Date(disease.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          {calculateDistance(
                            location.latitude,
                            location.longitude,
                            disease.geolocation.coordinates[1],
                            disease.geolocation.coordinates[0]
                          ).toFixed(0)}m
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Helper function to calculate distance between two points in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default NearbyDiseases; 