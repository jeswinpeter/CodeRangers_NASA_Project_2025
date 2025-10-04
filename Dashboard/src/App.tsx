import React, { useState, useEffect } from "react";
import {
  Satellite,
  MapPin,
  Calendar,
  Clock,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Search,
  Loader2,
} from "lucide-react";

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");
  const [coordinates, setCoordinates] = useState({
    lat: 40.7128,
    lon: -74.006,
  });
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rawApiData, setRawApiData] = useState<any>(null);
  const [showRawData, setShowRawData] = useState(false);

  const testBackendConnection = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setBackendStatus("Connected");
      } else {
        setBackendStatus("Disconnected");
      }
    } catch (err) {
      setBackendStatus("Disconnected");
      console.error("Backend connection failed:", err);
    }
  };

  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectLocation = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setCoordinates({ lat, lon });
    setSearchQuery(result.display_name);
    setShowSuggestions(false);
    setSearchResults([]);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchLocation(value);
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/weather/current?lat=${coordinates.lat}&lon=${coordinates.lon}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Weather API Response:", data);
        
        // Store raw API data
        setRawApiData(data);

        const current = data.current || {};
        const locationName = searchQuery && searchQuery !== '' 
          ? searchQuery.split(',')[0] + ` (${coordinates.lat.toFixed(2)}, ${coordinates.lon.toFixed(2)})`
          : `${coordinates.lat.toFixed(2)}, ${coordinates.lon.toFixed(2)}`;
        
        setCurrentWeather({
          location: locationName,
          temperature: current.ts || 0,
          humidity: current.rh2m || 0,
          windSpeed: current.ws10m || 0,
          pressure: current.ps ? current.ps * 10 : 0,
          description: `NASA POWER Data (${data.data_date || "Recent"})`,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error('Weather API failed');
      }
    } catch (err) {
      setError("Failed to fetch weather data");
      console.error("Weather API Error:", err);
      
      // Fallback data
      const locationName = searchQuery && searchQuery !== '' 
        ? searchQuery.split(',')[0] + ` (${coordinates.lat.toFixed(2)}, ${coordinates.lon.toFixed(2)})`
        : `${coordinates.lat.toFixed(2)}, ${coordinates.lon.toFixed(2)}`;
        
      setCurrentWeather({
        location: locationName,
        temperature: Math.floor(Math.random() * 20) + 15,
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 15) + 3,
        pressure: Math.floor(Math.random() * 50) + 1000,
        description: "Fallback Data (API Error)",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData();
  };

  useEffect(() => {
    testBackendConnection();
    fetchWeatherData();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Satellite className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">
              NASA Weather Dashboard
            </h1>
            <div className="ml-auto flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                backendStatus === "Connected" 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-red-500/20 text-red-400"
              }`}>
                {backendStatus}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Search */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location
          </h2>
          
          {/* Search Input */}
          <div className="mb-6 relative search-container">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search for a location
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search for cities, addresses, landmarks..."
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => selectLocation(result)}
                    className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0"
                  >
                    <div className="text-white font-medium">
                      {result.name || result.display_name.split(',')[0]}
                    </div>
                    <div className="text-gray-400 text-sm truncate">
                      {result.display_name}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual Coordinates */}
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-lg font-medium text-white mb-3">Or enter coordinates manually:</h3>
            <form onSubmit={handleLocationChange} className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={coordinates.lat}
                  onChange={(e) =>
                    setCoordinates((prev) => ({
                      ...prev,
                      lat: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter latitude"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={coordinates.lon}
                  onChange={(e) =>
                    setCoordinates((prev) => ({
                      ...prev,
                      lon: parseFloat(e.target.value) || 0,
                    }))
                  }
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
                  {loading ? "Loading..." : "Get Weather"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Weather Data */}
        {currentWeather && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <WeatherCard
              title="Temperature"
              value={`${currentWeather.temperature.toFixed(1)}°C`}
              icon={<Thermometer className="h-8 w-8" />}
              color="text-orange-400"
            />
            <WeatherCard
              title="Humidity"
              value={`${currentWeather.humidity.toFixed(0)}%`}
              icon={<Droplets className="h-8 w-8" />}
              color="text-blue-400"
            />
            <WeatherCard
              title="Wind Speed"
              value={`${currentWeather.windSpeed.toFixed(1)} m/s`}
              icon={<Wind className="h-8 w-8" />}
              color="text-gray-400"
            />
            <WeatherCard
              title="Pressure"
              value={`${currentWeather.pressure.toFixed(0)} hPa`}
              icon={<Eye className="h-8 w-8" />}
              color="text-purple-400"
            />
          </div>
        )}

        {/* Weather Details */}
        {currentWeather && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Weather Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-300">Conditions:</span>
                <span className="text-white ml-2 font-medium">
                  {currentWeather.description}
                </span>
              </div>
              <div>
                <span className="text-gray-300">Location:</span>
                <span className="text-white ml-2 font-medium">
                  {currentWeather.location}
                </span>
              </div>
              <div>
                <span className="text-gray-300">Last Updated:</span>
                <span className="text-white ml-2 font-medium">
                  {new Date(currentWeather.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div>
                <span className="text-gray-300">Data Source:</span>
                <span className="text-white ml-2 font-medium">
                  NASA POWER API
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Raw NASA API Data */}
        {rawApiData && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Satellite className="h-5 w-5 mr-2" />
                Raw NASA POWER API Data
              </h3>
              <button
                onClick={() => setShowRawData(!showRawData)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                {showRawData ? 'Hide' : 'Show'} Raw Data
              </button>
            </div>
            
            {showRawData && (
              <div className="space-y-4">
                {/* API Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black/20 rounded-lg">
                  <div>
                    <span className="text-gray-300 text-sm">API Endpoint:</span>
                    <div className="text-white font-mono text-sm break-all">
                      NASA POWER Daily Data
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-300 text-sm">Data Date:</span>
                    <div className="text-white font-medium">
                      {rawApiData.data_date || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-300 text-sm">Coordinates:</span>
                    <div className="text-white font-medium">
                      {rawApiData.lat}°, {rawApiData.lon}°
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-300 text-sm">Elevation:</span>
                    <div className="text-white font-medium">
                      {rawApiData.elevation ? `${rawApiData.elevation} m` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Current Weather Parameters */}
                {rawApiData.current && (
                  <div className="p-4 bg-black/20 rounded-lg">
                    <h4 className="text-white font-semibold mb-3">Current Weather Parameters</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(rawApiData.current).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-300 text-sm">
                            {getParameterDescription(key)}:
                          </span>
                          <span className="text-white font-mono text-sm">
                            {formatParameterValue(key, value as number)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw JSON Data */}
                <div className="p-4 bg-black/20 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">Complete JSON Response</h4>
                  <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono bg-black/30 p-3 rounded max-h-96 overflow-y-auto">
                    {JSON.stringify(rawApiData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Helper functions for raw data display
const getParameterDescription = (key: string): string => {
  const descriptions: { [key: string]: string } = {
    'ts': 'Temperature (2m)',
    'rh2m': 'Relative Humidity (2m)', 
    'ws10m': 'Wind Speed (10m)',
    'ps': 'Surface Pressure',
    'prectotcorr': 'Precipitation',
    'allsky_sfc_sw_dwn': 'Solar Irradiance',
    'clrsky_sfc_sw_dwn': 'Clear Sky Solar',
    't2m': 'Temperature (2m)',
    't2m_max': 'Max Temperature',
    't2m_min': 'Min Temperature',
    'wspd': 'Wind Speed',
    'u10m': 'Wind U-Component',
    'v10m': 'Wind V-Component'
  };
  return descriptions[key] || key.toUpperCase();
};

const formatParameterValue = (key: string, value: number): string => {
  if (value === null || value === undefined) return 'N/A';
  
  const units: { [key: string]: string } = {
    'ts': '°C',
    't2m': '°C', 
    't2m_max': '°C',
    't2m_min': '°C',
    'rh2m': '%',
    'ws10m': ' m/s',
    'wspd': ' m/s',
    'u10m': ' m/s', 
    'v10m': ' m/s',
    'ps': ' kPa',
    'prectotcorr': ' mm',
    'allsky_sfc_sw_dwn': ' W/m²',
    'clrsky_sfc_sw_dwn': ' W/m²'
  };
  
  const unit = units[key] || '';
  const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
  return `${formattedValue}${unit}`;
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