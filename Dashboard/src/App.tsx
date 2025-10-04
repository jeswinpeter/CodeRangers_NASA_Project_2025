import React, { useState, useEffect } from "react";
import {
  Satellite,
  MapPin,
  Search,
  Loader2,
  Cloud,
  RefreshCw,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Calendar,
  TrendingUp,
  AlertCircle,
  Activity,
  BarChart3,
  Map,
  Download,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Zap,
  Sun,
  CloudRain,
} from "lucide-react";
import * as api from "./api";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";

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

interface HistoricalWeatherData {
  date: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  condition: string;
}

interface WeatherTrend {
  period: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  avgHumidity: number;
  avgWindSpeed: number;
  avgPressure: number;
}

interface WeatherStats {
  totalDataPoints: number;
  avgTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  avgHumidity: number;
  avgWindSpeed: number;
  mostCommonCondition: string;
  temperatureTrend: "up" | "down" | "stable";
  trendPercentage: number;
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
  timestamp: new Date().toISOString(),
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  color,
}) => (
  <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/40 p-8 hover:shadow-3xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 pointer-events-none"></div>
    <div className="relative z-10 flex items-start justify-between">
      <div className="flex-1">
        <p className="text-lg font-bold text-white mb-3 drop-shadow-lg">
          {title}
        </p>
        <div className="flex items-baseline gap-3">
          <p className="text-4xl font-black text-white drop-shadow-2xl">
            {value}
          </p>
          <span className="text-xl text-blue-100 font-bold drop-shadow-lg">
            {unit}
          </span>
        </div>
        {trend && (
          <div className="flex items-center gap-3 mt-4">
            <TrendingUp className="h-5 w-5 text-green-300" />
            <span className="text-lg text-green-200 font-semibold drop-shadow-sm">
              {trend}
            </span>
          </div>
        )}
      </div>
      <div
        className={`p-5 rounded-3xl shadow-2xl border-2 border-white/50 ${color}`}
      >
        <Icon className="h-8 w-8 text-white drop-shadow-lg" />
      </div>
    </div>
  </div>
);

const NavTab: React.FC<NavTabProps> = ({
  id,
  label,
  icon: Icon,
  activeTab,
  setActiveTab,
}) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex items-center gap-4 px-8 py-4 rounded-3xl transition-all duration-300 font-bold text-lg border-2 shadow-xl ${
      activeTab === id
        ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-white shadow-2xl scale-110 border-white/50"
        : "text-white hover:bg-white/20 border-white/30 bg-white/10 backdrop-blur-lg hover:scale-105"
    }`}
  >
    <Icon className="h-6 w-6" />
    <span className="drop-shadow-lg">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentWeather, setCurrentWeather] =
    useState<WeatherData>(mockWeatherData);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: 40.7128,
    lon: -74.006,
  });

  // Analytics state
  const [historicalData, setHistoricalData] = useState<HistoricalWeatherData[]>(
    []
  );
  const [weatherTrends, setWeatherTrends] = useState<WeatherTrend[]>([]);
  const [weatherStats, setWeatherStats] = useState<WeatherStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);

  const fetchWeatherData = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      console.log("Fetching weather for coordinates:", { lat, lon });
      const weatherData = await api.getCurrent(lat, lon);

      // Transform API response to match our WeatherData interface
      const transformedData: WeatherData = {
        location: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        temperature:
          weatherData.temperature || weatherData.ALLSKY_SFC_SW_DWN || 20,
        humidity: weatherData.humidity || weatherData.RH2M || 60,
        windSpeed: weatherData.windSpeed || weatherData.WS10M || 5,
        pressure: weatherData.pressure || weatherData.PS || 1013,
        condition: weatherData.condition || "Clear",
        description:
          weatherData.description || `Weather data from NASA POWER API`,
        rawTemp: weatherData.rawTemp || weatherData.T2M || 22,
        timestamp: new Date().toISOString(),
      };

      setCurrentWeather(transformedData);
      console.log("Weather data updated:", transformedData);
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
      // Show error message to user but keep mock data
      alert(
        "Failed to fetch weather data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetWeather = () => {
    if (coordinates.lat && coordinates.lon) {
      fetchWeatherData(coordinates.lat, coordinates.lon);
    } else {
      alert("Please enter valid coordinates");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a location to search");
      return;
    }

    setLoading(true);
    try {
      // For now, we'll use a simple geocoding approach
      // You can enhance this with Google Maps API or other geocoding services
      console.log("Searching for location:", searchQuery);

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
          "new york": { lat: 40.7128, lon: -74.006 },
          london: { lat: 51.5074, lon: -0.1278 },
          tokyo: { lat: 35.6762, lon: 139.6503 },
          sydney: { lat: -33.8688, lon: 151.2093 },
          paris: { lat: 48.8566, lon: 2.3522 },
          delhi: { lat: 28.7041, lon: 77.1025 },
        };

        const location = locations[searchQuery.toLowerCase()];
        if (location) {
          setCoordinates(location);
          await fetchWeatherData(location.lat, location.lon);
        } else {
          alert(
            `Location "${searchQuery}" not found. Try: New York, London, Tokyo, Sydney, Paris, Delhi, or enter coordinates as "lat,lon"`
          );
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate mock analytics data
  const generateAnalyticsData = (lat: number, lon: number) => {
    const now = new Date();
    const historical: HistoricalWeatherData[] = [];
    const trends: WeatherTrend[] = [];

    // Generate 30 days of historical data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate realistic weather based on location and season
      const baseTemp = 15 + 25 * (1 - Math.abs(lat) / 90);
      const seasonalVariation =
        10 * Math.sin((date.getMonth() * 2 * Math.PI) / 12);
      const dailyVariation = Math.random() * 10 - 5;

      historical.push({
        date: date.toISOString().split("T")[0],
        temperature:
          Math.round((baseTemp + seasonalVariation + dailyVariation) * 10) / 10,
        humidity: Math.round(60 + Math.random() * 40),
        windSpeed: Math.round((5 + Math.random() * 15) * 10) / 10,
        pressure: Math.round(1013 + Math.random() * 20 - 10),
        condition: ["Clear", "Partly Cloudy", "Cloudy", "Rainy"][
          Math.floor(Math.random() * 4)
        ],
      });
    }

    // Generate weekly trends
    for (let week = 0; week < 4; week++) {
      const weekData = historical.slice(week * 7, (week + 1) * 7);
      const temps = weekData.map((d) => d.temperature);

      trends.push({
        period: `Week ${week + 1}`,
        avgTemp:
          Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) /
          10,
        maxTemp: Math.max(...temps),
        minTemp: Math.min(...temps),
        avgHumidity: Math.round(
          weekData.reduce((a, b) => a + b.humidity, 0) / weekData.length
        ),
        avgWindSpeed:
          Math.round(
            (weekData.reduce((a, b) => a + b.windSpeed, 0) / weekData.length) *
              10
          ) / 10,
        avgPressure: Math.round(
          weekData.reduce((a, b) => a + b.pressure, 0) / weekData.length
        ),
      });
    }

    // Calculate statistics
    const allTemps = historical.map((d) => d.temperature);
    const recentWeek = historical.slice(-7);
    const previousWeek = historical.slice(-14, -7);
    const recentAvg =
      recentWeek.reduce((a, b) => a + b.temperature, 0) / recentWeek.length;
    const previousAvg =
      previousWeek.reduce((a, b) => a + b.temperature, 0) / previousWeek.length;
    const tempChange = ((recentAvg - previousAvg) / previousAvg) * 100;

    const stats: WeatherStats = {
      totalDataPoints: historical.length,
      avgTemperature:
        Math.round(
          (allTemps.reduce((a, b) => a + b, 0) / allTemps.length) * 10
        ) / 10,
      maxTemperature: Math.max(...allTemps),
      minTemperature: Math.min(...allTemps),
      avgHumidity: Math.round(
        historical.reduce((a, b) => a + b.humidity, 0) / historical.length
      ),
      avgWindSpeed:
        Math.round(
          (historical.reduce((a, b) => a + b.windSpeed, 0) /
            historical.length) *
            10
        ) / 10,
      mostCommonCondition: "Partly Cloudy",
      temperatureTrend:
        Math.abs(tempChange) < 1 ? "stable" : tempChange > 0 ? "up" : "down",
      trendPercentage: Math.round(Math.abs(tempChange) * 10) / 10,
    };

    setHistoricalData(historical);
    setWeatherTrends(trends);
    setWeatherStats(stats);
  };

  // Load analytics data when coordinates change
  useEffect(() => {
    if (activeTab === "analytics" && coordinates.lat && coordinates.lon) {
      setAnalyticsLoading(true);
      setTimeout(() => {
        generateAnalyticsData(coordinates.lat, coordinates.lon);
        setAnalyticsLoading(false);
      }, 1000); // Simulate API delay
    }
  }, [activeTab, coordinates]);

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
                <h1 className="text-3xl font-black text-white drop-shadow-2xl">
                  NASA Weather Intelligence
                </h1>
                <p className="text-lg text-blue-100 font-semibold drop-shadow-lg">
                  Powered by NASA POWER API
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-400 to-green-500 border-2 border-white/50 rounded-full shadow-xl">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-white drop-shadow-sm">
                  Live
                </span>
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
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
              onChange={(e) =>
                setCoordinates((prev) => ({
                  ...prev,
                  lat: parseFloat(e.target.value) || 0,
                }))
              }
              className="flex-1 px-6 py-4 border-3 border-blue-300/50 rounded-2xl text-lg bg-white/80 backdrop-blur-sm focus:ring-4 focus:ring-blue-400/50 focus:border-blue-500 transition-all shadow-xl font-medium"
              disabled={loading}
            />
            <input
              type="number"
              placeholder="Longitude"
              value={coordinates.lon}
              onChange={(e) =>
                setCoordinates((prev) => ({
                  ...prev,
                  lon: parseFloat(e.target.value) || 0,
                }))
              }
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
          <NavTab
            id="overview"
            label="Overview"
            icon={Activity}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <NavTab
            id="forecast"
            label="Forecast"
            icon={Calendar}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <NavTab
            id="analytics"
            label="Analytics"
            icon={BarChart3}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <NavTab
            id="map"
            label="Map View"
            icon={Map}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Weather Stats Grid */}
        {activeTab === "overview" && (
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
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                    Current Conditions
                  </h2>
                  <p className="text-blue-600 font-medium">
                    {currentWeather.location}
                  </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-full">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">
                    {currentWeather.condition}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-200 shadow-lg">
                    <p className="text-sm text-blue-700 font-semibold mb-3">
                      Weather Description
                    </p>
                    <p className="text-gray-800 font-medium text-lg">
                      {currentWeather.description}
                    </p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl border-2 border-orange-200 shadow-lg">
                    <p className="text-sm text-orange-700 font-semibold mb-4">
                      Temperature Analysis
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 font-medium">
                          Adjusted Air Temp
                        </span>
                        <span className="font-mono font-bold text-lg text-orange-600">
                          {currentWeather.temperature.toFixed(1)}°C
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 font-medium">
                          Surface Temp
                        </span>
                        <span className="font-mono font-medium text-gray-600">
                          {currentWeather.rawTemp.toFixed(1)}°C
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-700">
                        Humidity Level
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Normal
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Wind Conditions
                      </span>
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
                        <p className="text-xs font-medium text-blue-900">
                          Data Source
                        </p>
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

        {activeTab === "forecast" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              7-Day Forecast
            </h2>
            <p className="text-gray-500">Forecast view coming soon...</p>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Analytics Header */}
            <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/40 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white drop-shadow-2xl mb-2">
                    Analytics Dashboard
                  </h2>
                  <p className="text-blue-100 text-lg font-medium drop-shadow-lg">
                    Weather insights and trends for {currentWeather.location}
                  </p>
                </div>
                {analyticsLoading && (
                  <div className="flex items-center gap-3 text-white">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="font-medium">Loading analytics...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Weather Statistics Cards */}
            {weatherStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/40 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl">
                      <Thermometer className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 font-medium">
                        Avg Temperature
                      </p>
                      <p className="text-3xl font-bold text-white drop-shadow-lg">
                        {weatherStats.avgTemperature}°C
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {weatherStats.temperatureTrend === "up" ? (
                          <ArrowUp className="h-4 w-4 text-green-300" />
                        ) : weatherStats.temperatureTrend === "down" ? (
                          <ArrowDown className="h-4 w-4 text-red-300" />
                        ) : (
                          <Zap className="h-4 w-4 text-blue-300" />
                        )}
                        <span className="text-sm text-white/90 font-medium">
                          {weatherStats.trendPercentage}%{" "}
                          {weatherStats.temperatureTrend}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/40 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl">
                      <Droplets className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 font-medium">Avg Humidity</p>
                      <p className="text-3xl font-bold text-white drop-shadow-lg">
                        {weatherStats.avgHumidity}%
                      </p>
                      <p className="text-sm text-white/90 font-medium mt-1">
                        Normal range
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/40 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl">
                      <Wind className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 font-medium">
                        Avg Wind Speed
                      </p>
                      <p className="text-3xl font-bold text-white drop-shadow-lg">
                        {weatherStats.avgWindSpeed} m/s
                      </p>
                      <p className="text-sm text-white/90 font-medium mt-1">
                        Light breeze
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/40 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 font-medium">Data Points</p>
                      <p className="text-3xl font-bold text-white drop-shadow-lg">
                        {weatherStats.totalDataPoints}
                      </p>
                      <p className="text-sm text-white/90 font-medium mt-1">
                        30-day period
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Temperature Trend Chart */}
            {historicalData.length > 0 && (
              <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/40 p-8">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-6">
                  Temperature Trends (30 Days)
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <defs>
                        <linearGradient
                          id="temperatureGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f97316"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f97316"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.2)"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.8)"
                        fontSize={12}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.8)"
                        fontSize={12}
                        label={{
                          value: "Temperature (°C)",
                          angle: -90,
                          position: "insideLeft",
                          style: {
                            textAnchor: "middle",
                            fill: "rgba(255,255,255,0.8)",
                          },
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255,255,255,0.9)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                        }}
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="temperature"
                        stroke="#f97316"
                        fillOpacity={1}
                        fill="url(#temperatureGradient)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Weather Metrics Charts */}
            {historicalData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Humidity & Wind Speed Chart */}
                <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/40 p-8">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-6">
                    Humidity & Wind Speed
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={historicalData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.2)"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="rgba(255,255,255,0.8)"
                          fontSize={12}
                          tickFormatter={(value) =>
                            new Date(value).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          }
                        />
                        <YAxis stroke="rgba(255,255,255,0.8)" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255,255,255,0.9)",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="humidity"
                          stroke="#06b6d4"
                          strokeWidth={3}
                          dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
                          name="Humidity (%)"
                        />
                        <Line
                          type="monotone"
                          dataKey="windSpeed"
                          stroke="#64748b"
                          strokeWidth={3}
                          dot={{ fill: "#64748b", strokeWidth: 2, r: 4 }}
                          name="Wind Speed (m/s)"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Weekly Trends Bar Chart */}
                <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/40 p-8">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-6">
                    Weekly Temperature Averages
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={weatherTrends}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.2)"
                        />
                        <XAxis
                          dataKey="period"
                          stroke="rgba(255,255,255,0.8)"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="rgba(255,255,255,0.8)"
                          fontSize={12}
                          label={{
                            value: "Temperature (°C)",
                            angle: -90,
                            position: "insideLeft",
                            style: {
                              textAnchor: "middle",
                              fill: "rgba(255,255,255,0.8)",
                            },
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255,255,255,0.9)",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="avgTemp"
                          fill="#f97316"
                          name="Avg Temp"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="maxTemp"
                          fill="#dc2626"
                          name="Max Temp"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="minTemp"
                          fill="#2563eb"
                          name="Min Temp"
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Weather Conditions Distribution */}
            {historicalData.length > 0 && (
              <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/40 p-8">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-6">
                  Weather Conditions Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: "Clear", value: 35, fill: "#fbbf24" },
                            {
                              name: "Partly Cloudy",
                              value: 30,
                              fill: "#06b6d4",
                            },
                            { name: "Cloudy", value: 25, fill: "#64748b" },
                            { name: "Rainy", value: 10, fill: "#3b82f6" },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {[
                            { name: "Clear", value: 35, fill: "#fbbf24" },
                            {
                              name: "Partly Cloudy",
                              value: 30,
                              fill: "#06b6d4",
                            },
                            { name: "Cloudy", value: 25, fill: "#64748b" },
                            { name: "Rainy", value: 10, fill: "#3b82f6" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255,255,255,0.9)",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/20 rounded-2xl">
                      <Sun className="h-8 w-8 text-yellow-300" />
                      <div>
                        <p className="text-white font-bold text-lg">
                          Most Common
                        </p>
                        <p className="text-blue-100">
                          {weatherStats?.mostCommonCondition}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white/20 rounded-2xl">
                      <CloudRain className="h-8 w-8 text-blue-300" />
                      <div>
                        <p className="text-white font-bold text-lg">
                          Precipitation Days
                        </p>
                        <p className="text-blue-100">3 out of 30 days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white/20 rounded-2xl">
                      <TrendingUp className="h-8 w-8 text-green-300" />
                      <div>
                        <p className="text-white font-bold text-lg">
                          Temperature Range
                        </p>
                        <p className="text-blue-100">
                          {weatherStats?.minTemperature}°C -{" "}
                          {weatherStats?.maxTemperature}°C
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "map" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Interactive Map
            </h2>
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
