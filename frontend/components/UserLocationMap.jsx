import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { mapApi } from '../src/front2backconnect/api.js';
import 'leaflet/dist/leaflet.css';

const UserLocationMap = () => {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const response = await mapApi.getData();

      if (response.data.success) {
        setMapData(response.data.data.locations);
        setStats(response.data.data.summary);
      } else {
        throw new Error(response.data.message || 'Failed to fetch map data');
      }
    } catch (err) {
      console.error('Map data fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Only use regions that exist in your data, fallback to a single color
  const getMarkerColor = () => '#3B82F6';

  const getMarkerRadius = (userCount) => {
    return Math.max(8, Math.min(30, userCount * 2.5)); // Slightly larger for visibility
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user locations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center text-red-600">
          <p>Error loading map: {error}</p>
          <button 
            onClick={fetchMapData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h3 className="text-2xl font-bold mb-2">Our Remote Workforce</h3>
        <p className="text-blue-100">
          See where our team members are working from across India
        </p>
        
        {/* Quick Stats */}
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
            <div className="text-sm text-blue-100">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalStates || 0}</div>
            <div className="text-sm text-blue-100">Cities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.topCity || 'N/A'}</div>
            <div className="text-sm text-blue-100">Top City</div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[600px] relative">
        <MapContainer
          center={[22.5, 80.5]} // Centered for better India view
          zoom={4.5}
          minZoom={4}
          maxBounds={[[6, 67], [38, 98]]} // Restrict to India
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {mapData.map((location, index) => (
            <CircleMarker
              key={index}
              center={location.coordinates}
              radius={getMarkerRadius(location.userCount)}
              pathOptions={{
                color: getMarkerColor(),
                fillColor: getMarkerColor(),
                fillOpacity: 0.7,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-center p-2">
                  <h4 className="font-bold text-lg">{location.city || location.state}</h4>
                  <div className="mt-2">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                      {location.userCount} Team Members{location.percentage ? ` (${location.percentage}%)` : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Working remotely from here</p>
                </div>
              </Popup>
              <Tooltip permanent={location.userCount > 5} direction="top">
                <span className="font-semibold">{location.city || location.state}</span>
                <br />
                <span className="text-sm">{location.userCount} members</span>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="p-6 bg-gray-50">
        <p className="text-xs text-gray-500 mt-3">
          Circle size represents number of team members. Click markers to see who's working from each city.
        </p>
      </div>
    </div>
  );
};

export default UserLocationMap;
