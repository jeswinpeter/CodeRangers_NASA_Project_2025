import React, { useState, useEffect } from 'react';
import { 
  Satellite, MapPin, Search, Loader2, Cloud, RefreshCw, 
  Thermometer, Wind, Droplets, Eye, Calendar, TrendingUp,
  AlertCircle, Activity, BarChart3, Map, Download
} from 'lucide-react';
import * as api from './api';

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  condition: string;
  description: string;
  rawTemp: number;
  timestamp: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  color: string;
}

interface NavTabProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface Coordinates {
  lat: number;
  lon: number;
}

const mockWeatherData: WeatherData = {
  location: "New York, NY",
  temperature: 22.5,
  humidity: 65,
  windSpeed: 8.3,
  pressure: 1013,
  condition: "Partly Cloudy",
  description: "High pressure system brings clear weather - Warm",
  rawTemp: 25.5,
  timestamp: new Date().toISOString()
};

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, icon: Icon, trend, color }) => (
  <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/40 p-8 hover:shadow-3xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 pointer-events-none"></div>
    <div className="relative z-10 flex items-start justify-between">
      <div className="flex-1">
        <p className="text-lg font-bold text-white mb-3 drop-shadow-lg">{title}</p>
        <div className="flex items-baseline gap-3">
          <p className="text-4xl font-black text-white drop-shadow-2xl">{value}</p>
          <span className="text-xl text-blue-100 font-bold drop-shadow-lg">{unit}</span>
        </div>
        {trend && (
          <div className="flex items-center gap-3 mt-4">
            <TrendingUp className="h-5 w-5 text-green-300" />
            <span className="text-lg text-green-200 font-semibold drop-shadow-sm">{trend}</span>
          </div>
        )}
      </div>
      <div className={`p-5 rounded-3xl shadow-2xl border-2 border-white/50 ${color}`}>
        <Icon className="h-8 w-8 text-white drop-shadow-lg" />
      </div>
    </div>
  </div>
);

const NavTab: React.FC<NavTabProps> = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex items-center gap-4 px-8 py-4 rounded-3xl transition-all duration-300 font-bold text-lg border-2 shadow-xl ${
      activeTab === id 
        ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-white shadow-2xl scale-110 border-white/50' 
        : 'text-white hover:bg-white/20 border-white/30 bg-white/10 backdrop-blur-lg hover:scale-105'
    }`}
  >
    <Icon className="h-6 w-6" />
    <span className="drop-shadow-lg">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentWeather, setCurrentWeather] = useState<WeatherData>(mockWeatherData);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: 40.7128, lon: -74.006 });

  const fetchWeatherData = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      console.log('Fetching weather for coordinates:', { lat, lon });
      const response = await api.getCurrent(lat, lon);
      console.log('Full API response:', response);
      
      // Extract weather data from the response
      const weatherData = response.current || response;
      
      // Transform API response to match our WeatherData interface
      const transformedData: WeatherData = {
        location: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        temperature: weatherData.temperature || weatherData.ALLSKY_SFC_SW_DWN || 20,
        humidity: weatherData.humidity || weatherData.RH2M || 60,
        windSpeed: weatherData.wind_speed || weatherData.windSpeed || weatherData.WS10M || 5,
        pressure: weatherData.pressure || weatherData.PS || 1013,
        condition: weatherData.condition || "Clear",
        description: weatherData.description || `Weather data from ${response.data_source || 'API'}`,
        rawTemp: weatherData.rawTemp || weatherData.T2M || weatherData.temperature || 22,
        timestamp: response.timestamp || new Date().toISOString()
      };
      
      setCurrentWeather(transformedData);
      console.log('Weather data updated:', transformedData);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      // Show error message to user but keep mock data
      alert('Failed to fetch weather data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetWeather = () => {
    if (coordinates.lat && coordinates.lon) {
      fetchWeatherData(coordinates.lat, coordinates.lon);
    } else {
      alert('Please enter valid coordinates');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a location to search');
      return;
    }

    setLoading(true);
    try {
      // For now, we'll use a simple geocoding approach
      // You can enhance this with Google Maps API or other geocoding services
      console.log('Searching for location:', searchQuery);
      
      // Simple coordinate extraction if user enters "lat,lon" format
      const coordMatch = searchQuery.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (coordMatch) {
        const [, lat, lon] = coordMatch;
        const newCoords = { lat: parseFloat(lat), lon: parseFloat(lon) };
        setCoordinates(newCoords);
        await fetchWeatherData(newCoords.lat, newCoords.lon);
      } else {
        // For demo purposes, use some predefined locations
        const locations: { [key: string]: Coordinates } = {
          'new york': { lat: 40.7128, lon: -74.006 },
          'london': { lat: 51.5074, lon: -0.1278 },
          'tokyo': { lat: 35.6762, lon: 139.6503 },
          'sydney': { lat: -33.8688, lon: 151.2093 },
          'paris': { lat: 48.8566, lon: 2.3522 },
          'delhi': { lat: 28.7041, lon: 77.1025 },
        };
        
        const location = locations[searchQuery.toLowerCase()];
        if (location) {
          setCoordinates(location);
          await fetchWeatherData(location.lat, location.lon);
        } else {
          alert(`Location "${searchQuery}" not found. Try: New York, London, Tokyo, Sydney, Paris, Delhi, or enter coordinates as "lat,lon"`);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load initial weather data
  useEffect(() => {
    fetchWeatherData(coordinates.lat, coordinates.lon);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-blue-300/30 to-indigo-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-gradient-to-tr from-sky-300/20 to-blue-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Header */}
      <header className="relative bg-white/20 backdrop-blur-lg border-b border-white/30 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-2xl shadow-2xl border-2 border-white/50">
                <Satellite className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white drop-shadow-2xl">NASA Weather Intelligence</h1>
                <p className="text-lg text-blue-100 font-semibold drop-shadow-lg">Powered by NASA POWER API</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-400 to-green-500 border-2 border-white/50 rounded-full shadow-xl">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-white drop-shadow-sm">Live</span>
              </div>
              <button className="p-3 hover:bg-white/20 rounded-xl transition-all duration-300 border-2 border-white/30 shadow-lg hover:shadow-xl">
                <RefreshCw className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/40 p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-700" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for cities, locations, or coordinates..."
                className="w-full pl-14 pr-6 py-5 border-3 border-blue-300/50 rounded-2xl focus:ring-4 focus:ring-blue-400/50 focus:border-blue-500 transition-all bg-white/80 backdrop-blur-sm text-gray-800 placeholder-blue-600 text-lg font-medium shadow-xl"
                disabled={loading}
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="px-10 py-5 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-4 border-2 border-white/50 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-6 w-6" />
                  Search Location
                </>
              )}
            </button>
          </div>

          <div className="relative z-10 flex gap-6 mt-8">
            <input
              type="number"
              placeholder="Latitude"
              value={coordinates.lat}
              onChange={(e) => setCoordinates(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
              className="flex-1 px-6 py-4 border-3 border-blue-300/50 rounded-2xl text-lg bg-white/80 backdrop-blur-sm focus:ring-4 focus:ring-blue-400/50 focus:border-blue-500 transition-all shadow-xl font-medium"
              disabled={loading}
            />
            <input
              type="number"
              placeholder="Longitude"
              value={coordinates.lon}
              onChange={(e) => setCoordinates(prev => ({ ...prev, lon: parseFloat(e.target.value) || 0 }))}
              className="flex-1 px-6 py-4 border-3 border-blue-300/50 rounded-2xl text-lg bg-white/80 backdrop-blur-sm focus:ring-4 focus:ring-blue-400/50 focus:border-blue-500 transition-all shadow-xl font-medium"
              disabled={loading}
            />
            <button 
              onClick={handleGetWeather}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white/50 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <MapPin className="h-5 w-5" />
                  Get Weather
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <NavTab id="overview" label="Overview" icon={Activity} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavTab id="forecast" label="Forecast" icon={Calendar} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavTab id="analytics" label="Analytics" icon={BarChart3} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavTab id="map" label="Map View" icon={Map} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Weather Stats Grid */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Temperature"
                value={currentWeather.temperature.toFixed(1)}
                unit="°C"
                icon={Thermometer}
                trend="+2.3° from yesterday"
                color="bg-gradient-to-br from-orange-500 to-red-500"
              />
              <StatCard
                title="Humidity"
                value={currentWeather.humidity}
                unit="%"
                icon={Droplets}
                trend="Normal range"
                color="bg-gradient-to-br from-blue-500 to-cyan-500"
              />
              <StatCard
                title="Wind Speed"
                value={currentWeather.windSpeed.toFixed(1)}
                unit="m/s"
                icon={Wind}
                trend="Light breeze"
                color="bg-gradient-to-br from-gray-500 to-slate-600"
              />
              <StatCard
                title="Pressure"
                value={(currentWeather.pressure / 10).toFixed(1)}
                unit="kPa"
                icon={Eye}
                trend="Stable"
                color="bg-gradient-to-br from-purple-500 to-indigo-600"
              />
            </div>

            {/* Current Conditions Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-8 mb-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">Current Conditions</h2>
                  <p className="text-blue-600 font-medium">{currentWeather.location}</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-full">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">{currentWeather.condition}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-200 shadow-lg">
                    <p className="text-sm text-blue-700 font-semibold mb-3">Weather Description</p>
                    <p className="text-gray-800 font-medium text-lg">{currentWeather.description}</p>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl border-2 border-orange-200 shadow-lg">
                    <p className="text-sm text-orange-700 font-semibold mb-4">Temperature Analysis</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 font-medium">Adjusted Air Temp</span>
                        <span className="font-mono font-bold text-lg text-orange-600">{currentWeather.temperature.toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 font-medium">Surface Temp</span>
                        <span className="font-mono font-medium text-gray-600">{currentWeather.rawTemp.toFixed(1)}°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-700">Humidity Level</span>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Normal
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Wind Conditions</span>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Moderate
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-700">Pressure</span>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Normal
                    </span>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-900">Data Source</p>
                        <p className="text-xs text-blue-700">NASA POWER API</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <button className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all flex items-center gap-3">
                <Download className="h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Export Data</p>
                  <p className="text-xs text-gray-500">Download as CSV/JSON</p>
                </div>
              </button>

              <button className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">View Analytics</p>
                  <p className="text-xs text-gray-500">Historical trends</p>
                </div>
              </button>

              <button className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">ML Predictions</p>
                  <p className="text-xs text-gray-500">14-day forecast</p>
                </div>
              </button>
            </div>
          </>
        )}

        {activeTab === 'forecast' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">7-Day Forecast</h2>
            <p className="text-gray-500">Forecast view coming soon...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
            <p className="text-gray-500">Analytics view coming soon...</p>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Interactive Map</h2>
            <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center">
              <p className="text-gray-500">Map view coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;