import React, { useState, useEffect } from 'react';
import { Satellite, MapPin, Thermometer, Cloud, Wind, Eye, Droplets } from 'lucide-react';
import { getCurrent, getHealthCheck } from './api';

const App: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  const [coordinates, setCoordinates] = useState({ lat: 40.7128, lon: -74.0060 }); // Default to NYC

  const fetchWeatherData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCurrent(coordinates.lat, coordinates.lon);
      setCurrentWeather({
        location: `${coordinates.lat.toFixed(2)}, ${coordinates.lon.toFixed(2)}`,
        temperature: data.current.temperature,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_speed,
        pressure: data.current.pressure,
        visibility: data.current.visibility,
        cloudCover: data.current.cloud_cover,
        description: data.current.description,
        timestamp: data.timestamp
      });
    } catch (err) {
      setError('Failed to fetch weather data from API');
      console.error(err);
      // Fallback to mock data
      const mockData = {
        location: `${coordinates.lat.toFixed(2)}, ${coordinates.lon.toFixed(2)}`,
        temperature: Math.floor(Math.random() * 30) + 10,
        humidity: Math.floor(Math.random() * 50) + 30,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        pressure: Math.floor(Math.random() * 100) + 1000,
        visibility: Math.floor(Math.random() * 10) + 5,
        cloudCover: Math.floor(Math.random() * 100),
        description: 'Mock Data',
        timestamp: new Date().toISOString()
      };
      setCurrentWeather(mockData);
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      const data = await getHealthCheck();
      setBackendStatus('Connected');
      console.log('Backend connection test:', data);
      return data;
    } catch (err) {
      setBackendStatus('Disconnected');
      console.error('Backend connection failed:', err);
      return null;
    }
  };

  useEffect(() => {
    testBackendConnection();
    fetchWeatherData();
  }, []);

  const handleLocationChange = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Satellite className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">NASA Weather Intelligence Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Input */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location
          </h2>
          <form onSubmit={handleLocationChange} className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                value={coordinates.lat}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter latitude"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                value={coordinates.lon}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lon: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter longitude"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-md font-medium transition-colors"
              >
                {loading ? 'Loading...' : 'Get Weather'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Weather Data */}
        {currentWeather && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <WeatherCard
              title="Temperature"
              value={`${currentWeather.temperature}°C`}
              icon={<Thermometer className="h-8 w-8" />}
              color="text-orange-400"
            />
            <WeatherCard
              title="Humidity"
              value={`${currentWeather.humidity}%`}
              icon={<Droplets className="h-8 w-8" />}
              color="text-blue-400"
            />
            <WeatherCard
              title="Wind Speed"
              value={`${currentWeather.windSpeed} m/s`}
              icon={<Wind className="h-8 w-8" />}
              color="text-gray-400"
            />
            <WeatherCard
              title="Pressure"
              value={`${currentWeather.pressure} hPa`}
              icon={<Cloud className="h-8 w-8" />}
              color="text-purple-400"
            />
            <WeatherCard
              title="Visibility"
              value={`${currentWeather.visibility} km`}
              icon={<Eye className="h-8 w-8" />}
              color="text-green-400"
            />
            <WeatherCard
              title="Cloud Cover"
              value={`${currentWeather.cloudCover}%`}
              icon={<Cloud className="h-8 w-8" />}
              color="text-gray-400"
            />
          </div>
        )}

        {/* Additional Weather Info */}
        {currentWeather && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Weather Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-300">Conditions:</span>
                <span className="text-white ml-2 font-medium">{currentWeather.description}</span>
              </div>
              <div>
                <span className="text-gray-300">Location:</span>
                <span className="text-white ml-2 font-medium">{currentWeather.location}</span>
              </div>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Backend API</span>
              <span className={`px-2 py-1 rounded text-sm ${
                backendStatus === 'Connected' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {backendStatus}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Last Updated</span>
              <span className="text-gray-400 text-sm">
                {currentWeather ? new Date(currentWeather.timestamp).toLocaleTimeString() : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Data Source</span>
              <span className="text-gray-400 text-sm">
                {error ? 'Mock Data (API Error)' : 'NASA Weather API'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Weather Card Component
interface WeatherCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  title,
  value,
  icon,
  color,
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`${color}`}>{icon}</div>
      </div>
    </div>
  );
};

export default App;
