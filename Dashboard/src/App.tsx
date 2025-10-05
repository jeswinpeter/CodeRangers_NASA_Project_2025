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
import { LocationSearch } from "./components/LocationSearch";
import { WeatherMap } from "./components/WeatherMap";
import { WeatherForecast } from "./components/WeatherForecast";
import { useWeatherTheme } from './hooks/useWeatherTheme';
import { WeatherBackground } from './components/WeatherBackground';

// Function to generate natural weather descriptions
const generateWeatherDescription = (
  temperature: number,
  humidity: number,
  windSpeed: number,
  pressure: number
): string => {
  let description = "";

  // Base condition based on temperature
  if (temperature > 30) {
    description = "hot";
  } else if (temperature > 25) {
    description = "warm";
  } else if (temperature > 15) {
    description = "mild";
  } else if (temperature > 5) {
    description = "cool";
  } else {
    description = "cold";
  }

  // Sky conditions based on pressure and humidity
  let skyCondition = "";
  if (pressure > 1020) {
    if (humidity < 40) {
      skyCondition = "mostly sunny";
    } else if (humidity < 60) {
      skyCondition = "partly sunny";
    } else {
      skyCondition = "partly cloudy";
    }
  } else if (pressure > 1000) {
    if (humidity < 50) {
      skyCondition = "partly cloudy";
    } else if (humidity < 70) {
      skyCondition = "mostly cloudy";
    } else {
      skyCondition = "overcast";
    }
  } else {
    if (humidity > 80) {
      skyCondition = "rainy";
    } else if (humidity > 70) {
      skyCondition = "cloudy with chance of rain";
    } else {
      skyCondition = "mostly cloudy";
    }
  }

  // Wind conditions
  let windCondition = "";
  if (windSpeed > 20) {
    windCondition = " with strong winds";
  } else if (windSpeed > 10) {
    windCondition = " with moderate winds";
  } else if (windSpeed > 5) {
    windCondition = " with light winds";
  }

  // Additional weather details based on humidity
  let additionalDetails = "";
  if (humidity > 85 && pressure < 1010) {
    additionalDetails = ", chance of rain";
  } else if (humidity > 75 && temperature > 25) {
    additionalDetails = ", humid conditions";
  } else if (humidity < 30) {
    additionalDetails = ", dry conditions";
  }

  return `${skyCondition} and ${description}${windCondition}${additionalDetails}`;
};
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
  // NEW: Dark, matte card with subtle internal glow and soft hover.
  <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700/70 p-6 hover:shadow-xl hover:shadow-indigo-900/40 transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        {/* NEW: Muted text for title */}
        <p className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          {/* NEW: Clean white text for value */}
          <p className="text-3xl font-extrabold text-white">
            {value}
          </p>
          {/* NEW: Light blue unit */}
          <span className="text-lg text-blue-300 font-medium">
            {unit}
          </span>
        </div>
        {trend && (
          <div className="flex items-center gap-2 mt-3">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-300 font-medium">
              {trend}
            </span>
          </div>
        )}
      </div>
      {/* NEW: Icon is reserved color, simple rounded square */}
      <div className={`p-3 rounded-lg shadow-md ${color}`}>
        <Icon className="h-6 w-6 text-white" />
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
  // NEW: Dark base, simple border, focus on clean lines
  <button
    onClick={() => setActiveTab(id)}
    className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-300 font-semibold text-base ${
      activeTab === id
        // NEW Active: Muted blue primary color, strong shadow
        ? "bg-blue-600 text-white shadow-xl shadow-blue-900/50 scale-100"
        // NEW Inactive: Dark subtle hover
        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
    }`}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </button>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [currentWeather, setCurrentWeather] =
    useState<WeatherData>(mockWeatherData);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: 40.7128,
    lon: -74.006,
  });
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
    name?: string;
  }>({ lat: 40.7128, lon: -74.006, name: "New York, NY" });

  // Analytics state
  const [historicalData, setHistoricalData] = useState<HistoricalWeatherData[]>(
    []
  );
  const [weatherTrends, setWeatherTrends] = useState<WeatherTrend[]>([]);
  const [weatherStats, setWeatherStats] = useState<WeatherStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  // Inside the App component, add this after your state declarations:
  const { theme: weatherTheme, themeClasses } = useWeatherTheme(currentWeather);
  const [themeIndex, setThemeIndex] = useState<number>(0);
  const themeOrder = ['Clear', 'Rainy', 'Thunderstorm', 'Cloudy', 'Snowy'];
  const fetchWeatherData = async (
    lat: number,
    lon: number,
    locationName?: string
  ) => {
    setLoading(true);
    try {
      console.log("Fetching weather for coordinates:", { lat, lon });
      const weatherData = await api.getCurrent(lat, lon);

      // Transform API response to match our WeatherData interface
      const current = weatherData.current || weatherData;
      const transformedData: WeatherData = {
        location:
          locationName ||
          currentLocation.name ||
          `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        temperature: current.ts || current.temperature || 20,
        humidity: current.rh2m || current.humidity || 60,
        windSpeed: current.ws10m || current.windSpeed || 5,
        pressure: current.ps || current.pressure || 1013,
        condition: current.condition || "Clear",
        description:
          current.description ||
          generateWeatherDescription(
            current.ts || current.temperature || 20,
            current.rh2m || current.humidity || 60,
            current.ws10m || current.windSpeed || 5,
            current.ps || current.pressure || 1013
          ),
        rawTemp: current.ts || current.T2M || current.rawTemp || 22,
        timestamp: new Date().toISOString(),
      };

      setCurrentWeather(transformedData);
      console.log("Weather data updated:", transformedData);

      // Also update analytics data when location changes
      generateAnalyticsData(lat, lon);
      console.log("Analytics data updated for new location");
    } catch (error: any) {
      console.error("Failed to fetch weather data:", error);

      // Detailed error message based on error type
      let errorMessage = "Failed to fetch weather data. ";

      if (
        error.code === "NETWORK_ERROR" ||
        error.message?.includes("Network Error")
      ) {
        errorMessage +=
          "Network connection issue. Please check if both servers are running:\n" +
          "• Backend: http://localhost:8002\n" +
          "• Frontend: http://localhost:5174";
      } else if (error.response?.status === 404) {
        errorMessage +=
          "API endpoint not found. Please check if the backend server is running on port 8002.";
      } else if (error.response?.status === 500) {
        errorMessage +=
          "Server error. Please check the backend logs for details.";
      } else if (error.response?.status) {
        errorMessage += `Server responded with status ${
          error.response.status
        }. ${error.response.data?.detail || ""}`;
      } else if (error.request) {
        errorMessage +=
          "No response from server. Please check:\n" +
          "1. Backend server is running (port 8002)\n" +
          "2. Network connection\n" +
          "3. Firewall settings";
      } else {
        errorMessage += `Unexpected error: ${error.message || "Unknown error"}`;
      }

      errorMessage += "\n\nTo restart servers, run:\n./troubleshoot.sh";

      alert(errorMessage);
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

  const handleMapLocationSelect = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      console.log("Map location selected:", { lat, lon });
      setCurrentLocation({
        lat,
        lon,
        name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      });
      setCoordinates({ lat, lon });
      await fetchWeatherData(lat, lon);
    } catch (error: any) {
      console.error("Map location selection failed:", error);
      alert(
        "Failed to get weather data for selected location. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = async (location: {
    lat: number;
    lon: number;
    name: string;
  }) => {
    setLoading(true);
    try {
      console.log("Location selected:", location);
      setCurrentLocation(location);
      setCoordinates({ lat: location.lat, lon: location.lon });
      await fetchWeatherData(location.lat, location.lon, location.name);
    } catch (error: any) {
      console.error("Location change failed:", error);

      let errorMessage = "Search failed. ";

      if (error.message?.includes("Failed to fetch weather data")) {
        errorMessage +=
          "Could not fetch weather data for the location. Please check if the backend server is running.";
      } else {
        errorMessage += `Error: ${
          error.message || "Unknown error"
        }. Please try again.`;
      }

      alert(errorMessage);
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

  // Analytics data is now updated automatically when weather data is fetched
  // This useEffect is kept only for showing loading state when switching to analytics tab
  useEffect(() => {
    if (activeTab === "analytics") {
      setAnalyticsLoading(true);
      // Small delay to show loading animation, then hide it
      setTimeout(() => {
        setAnalyticsLoading(false);
      }, 500);
    }
  }, [activeTab]);

  // Load initial weather data
  useEffect(() => {
    fetchWeatherData(coordinates.lat, coordinates.lon);
  }, []);

  // ... inside App component return

return (
  // NEW: Deep Indigo/Gray Background
  <div className={`min-h-screen bg-gray-950 text-white ${themeClasses.background} transition-colors duration-1000`}>
    {/* Animated Background Elements */}
    <WeatherBackground theme={weatherTheme} />

    {/* Header (Clean, Dark Bar) */}
    <header className={`relative bg-gray-900/90 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50 shadow-2xl shadow-black/50 transition-colors duration-1000`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* NEW: Simple Logo Icon - Muted Cyan */}
            <div className="p-3 bg-gray-800 rounded-lg border border-cyan-500/50">
              <Satellite className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wider">
                JUPITER
              </h1>
              <p className="text-sm text-gray-400 font-medium">
                NASA Data Core
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-700 border border-emerald-500 rounded-full shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-white">
                Live
              </span>
            </div>
            {/* NEW: Dark, simple refresh button */}
           
            {/* NEW: Test Theme Button - Blue/Purple gradient kept for "action" */}
            <button 
              onClick={() => {
                const nextIndex = (themeIndex + 1) % themeOrder.length;
                setThemeIndex(nextIndex);
                const nextTheme = themeOrder[nextIndex];
                
                // Update weather to trigger theme change
                setCurrentWeather({
                  ...currentWeather,
                  condition: nextTheme,
                  description: `Testing ${nextTheme} weather`,
                  temperature: nextTheme === 'Snowy' ? -5 : currentWeather.temperature
                });
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 rounded-lg transition-all duration-300 border border-gray-700 shadow-lg"
            >
              <Zap className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold text-white">Theme Cycle</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div className="relative max-w-7xl mx-auto px-6 py-8">
      {/* Search Section (Matte Dark Card) */}
      <div className={`bg-gray-800 rounded-xl shadow-2xl shadow-black/50 border border-gray-700 p-6 mb-6 transition-colors duration-1000`}>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
            <Search className="h-6 w-6 text-blue-400" />
            Location Target
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Input coordinate data or search for a location grid.
          </p>

          <LocationSearch
            value={currentLocation}
            onChange={handleLocationChange}
            placeholder="Search city/region (e.g., Kottayam, Barcelona, Tokyo)"
            // NEW: Dark input styling
            inputClassName="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500 text-sm"
          />

          {/* Manual Coordinate Input */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex gap-3 flex-1">
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
                  // NEW: Dark coordinate input
                  className="flex-1 px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 transition-all text-sm"
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
                  // NEW: Dark coordinate input
                  className="flex-1 px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 transition-all text-sm"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleGetWeather}
                disabled={loading}
                // NEW: Primary button with subtle gradient
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-sm hover:opacity-80 transition-all duration-300 flex items-center justify-center gap-2 border border-gray-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Satellite className="h-4 w-4" />
                    Fetch Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Sleek Dark Bar) */}
      <div className="flex justify-start items-center gap-1 mb-8 bg-gray-900/80 backdrop-blur-sm rounded-lg p-1.5 border border-gray-700 shadow-xl shadow-black/50 overflow-x-auto">
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
        <NavTab
            id="export"
            label="Export"
            icon={Download}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
      </div>

      {/* Weather Stats Grid */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Current Temp"
              value={currentWeather.temperature.toFixed(1)}
              unit="°C"
              icon={Thermometer}
              trend="+2.3° from yesterday"
              // NEW: Muted gradients
              color="bg-gradient-to-br from-red-600 to-orange-700"
            />
            <StatCard
              title="Relative Humidity"
              value={currentWeather.humidity}
              unit="%"
              icon={Droplets}
              trend="Normal range"
              // NEW: Muted gradients
              color="bg-gradient-to-br from-blue-600 to-cyan-700"
            />
            <StatCard
              title="Wind Speed"
              value={currentWeather.windSpeed.toFixed(1)}
              unit="m/s"
              icon={Wind}
              trend="Light breeze"
              // NEW: Muted gradients
              color="bg-gradient-to-br from-slate-600 to-gray-700"
            />
            <StatCard
              title="Pressure"
              value={(currentWeather.pressure / 10).toFixed(1)}
              unit="kPa"
              icon={Eye}
              trend="Stable"
              // NEW: Muted gradients
              color="bg-gradient-to-br from-purple-600 to-indigo-700"
            />
          </div>

          {/* Current Conditions Card (Dark, High Contrast) */}
          <div className="bg-gray-800 rounded-xl shadow-2xl shadow-black/50 border border-gray-700 p-8 mb-8">
            <div className="flex items-start justify-between mb-6 border-b border-gray-700 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Target: {currentWeather.location}
                </h2>
                <p className="text-gray-400 font-medium text-sm">
                  Last Updated: {new Date(currentWeather.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 border border-gray-600 rounded-full">
                <Cloud className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-semibold text-white">
                  {currentWeather.condition}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400 font-medium mb-2">
                    System Description
                  </p>
                  <p className="text-white font-normal text-base">
                    {currentWeather.description}
                  </p>
                </div>

                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400 font-medium mb-2">
                    Temperature Detail
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm text-white">
                      <span>Adjusted Air Temp</span>
                      <span className="font-mono font-bold text-orange-400">
                        {currentWeather.temperature.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-white">
                      <span>Surface Temp (T2M)</span>
                      <span className="font-mono font-medium text-gray-300">
                        {currentWeather.rawTemp.toFixed(1)}°C
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-400" />
                    <span className="text-sm text-gray-300">Humidity Status</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-800 text-emerald-300 text-xs font-medium rounded-full border border-emerald-600">
                    Optimal
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-300">Wind Conditions</span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-full border border-slate-600">
                    Stable
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-400" />
                    <span className="text-sm text-gray-300">Pressure Status</span>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-800 text-indigo-300 text-xs font-medium rounded-full border border-indigo-600">
                    Normal
                  </span>
                </div>

                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-xs font-medium text-red-400">
                        Alerts
                      </p>
                      <p className="text-xs text-gray-400">No active warnings.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Minimal) */}
          
        </>
      )}

      {/* Forecast, Analytics, and Map View Tabs (Dark/Clean Styling) */}

      {/* Forecast */}
        {activeTab === "forecast" && (
          // Add 'text-white' to the container and a data-theme prop for the component
          <div className="bg-gray-800 rounded-xl shadow-2xl shadow-black/50 border border-gray-700 p-8 text-black">
            <WeatherForecast
              coordinates={coordinates}
              locationName={currentWeather.location}
              // This prop is used to apply dark mode styles inside the component
              
              // Passing text-white via className is a good fallback
              className="text-white" 
            />
          </div>
        )}


      {/* Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-8">
          {/* Analytics Header */}
          <div className="bg-gray-800 rounded-xl shadow-2xl shadow-black/50 border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  System Analytics
                </h2>
                <p className="text-gray-400 text-base font-medium">
                  Weather insights and trends for {currentWeather.location}
                </p>
              </div>
              {analyticsLoading && (
                <div className="flex items-center gap-3 text-cyan-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="font-medium">Loading analysis...</span>
                </div>
              )}
            </div>
          </div>

          {/* Weather Statistics Cards */}
          {weatherStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1: Avg Temperature */}
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700/70 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-red-600 to-orange-700 rounded-lg">
                    <Thermometer className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium text-sm">
                      Avg Temperature
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {weatherStats.avgTemperature}°C
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {weatherStats.temperatureTrend === "up" ? (
                        <ArrowUp className="h-4 w-4 text-emerald-400" />
                      ) : weatherStats.temperatureTrend === "down" ? (
                        <ArrowDown className="h-4 w-4 text-red-400" />
                      ) : (
                        <Zap className="h-4 w-4 text-blue-400" />
                      )}
                      <span className="text-xs text-gray-300 font-medium">
                        {weatherStats.trendPercentage}%{" "}
                        {weatherStats.temperatureTrend}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stat 2: Avg Humidity */}
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700/70 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-lg">
                    <Droplets className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium text-sm">Avg Humidity</p>
                    <p className="text-2xl font-bold text-white">
                      {weatherStats.avgHumidity}%
                    </p>
                    <p className="text-xs text-gray-300 font-medium mt-1">
                      Optimal Range
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Stat 3: Avg Wind Speed */}
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700/70 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-slate-600 to-gray-700 rounded-lg">
                    <Wind className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium text-sm">
                      Avg Wind Speed
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {weatherStats.avgWindSpeed} m/s
                    </p>
                    <p className="text-xs text-gray-300 font-medium mt-1">
                      Stable Circulation
                    </p>
                  </div>
                </div>
              </div>

              {/* Stat 4: Data Points */}
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700/70 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium text-sm">Data Points</p>
                    <p className="text-2xl font-bold text-white">
                      {weatherStats.totalDataPoints}
                    </p>
                    <p className="text-xs text-gray-300 font-medium mt-1">
                      30-day history
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Container */}
          {historicalData.length > 0 && (
            <div className="space-y-6">
              {/* Temperature Trend Chart */}
              <div className="bg-gray-800 rounded-xl shadow-2xl shadow-black/50 border border-gray-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Temperature Trends (30 Days)
                </h3>
                <div className="h-72">
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
                          {/* Use more subdued colors for the fill */}
                          <stop
                            offset="5%"
                            stopColor="#dc2626"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#dc2626"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={11}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={11}
                        label={{
                          value: "Temp (°C)",
                          angle: -90,
                          position: "insideLeft",
                          style: { fill: "rgba(255,255,255,0.6)" },
                        }}
                      />
                      {/* Customize Tooltip for dark mode */}
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(31, 41, 55, 0.9)", // Gray-800
                          border: "1px solid #4b5563", // Gray-600
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                          color: "white"
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="temperature"
                        stroke="#f97316" // Orange
                        fillOpacity={1}
                        fill="url(#temperatureGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weather Metrics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Humidity & Wind Speed Chart */}
                <div className="bg-gray-800 rounded-xl shadow-2xl shadow-black/50 border border-gray-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Humidity & Wind Metrics
                  </h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={historicalData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="rgba(255,255,255,0.6)"
                          fontSize={11}
                          tickFormatter={(value) =>
                            new Date(value).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          }
                        />
                        <YAxis stroke="rgba(255,255,255,0.6)" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(31, 41, 55, 0.9)",
                            border: "1px solid #4b5563",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                            color: "white"
                          }}
                        />
                        <Legend wrapperStyle={{ color: 'white' }} />
                        <Line
                          type="monotone"
                          dataKey="humidity"
                          stroke="#38bdf8" // Sky Blue
                          strokeWidth={2}
                          dot={{ fill: "#38bdf8", strokeWidth: 1, r: 3 }}
                          name="Humidity (%)"
                        />
                        <Line
                          type="monotone"
                          dataKey="windSpeed"
                          stroke="#94a3b8" // Slate
                          strokeWidth={2}
                          dot={{ fill: "#94a3b8", strokeWidth: 1, r: 3 }}
                          name="Wind Speed (m/s)"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Weekly Trends Bar Chart */}
                <div className="bg-gray-800 rounded-xl shadow-2xl shadow-black/50 border border-gray-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Weekly Temperature Averages
                  </h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={weatherTrends}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis
                          dataKey="period"
                          stroke="rgba(255,255,255,0.6)"
                          fontSize={11}
                        />
                        <YAxis
                          stroke="rgba(255,255,255,0.6)"
                          fontSize={11}
                          label={{
                            value: "Temp (°C)",
                            angle: -90,
                            position: "insideLeft",
                            style: { fill: "rgba(255,255,255,0.6)" },
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(31, 41, 55, 0.9)",
                            border: "1px solid #4b5563",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                            color: "white"
                          }}
                        />
                        <Legend wrapperStyle={{ color: 'white' }} />
                        {/* Use subdued, related colors for the bars */}
                        <Bar
                          dataKey="avgTemp"
                          fill="#facc15" // Amber
                          name="Avg Temp"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="maxTemp"
                          fill="#f87171" // Red-300
                          name="Max Temp"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="minTemp"
                          fill="#60a5fa" // Blue-400
                          name="Min Temp"
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Weather Conditions Distribution */}
              <div className="bg-gray-800 rounded-xl shadow-2xl shadow-black/50 border border-gray-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4">
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
                              fill: "#38bdf8",
                            },
                            { name: "Cloudy", value: 25, fill: "#64748b" },
                            { name: "Rainy", value: 10, fill: "#2563eb" },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          dataKey="value"
                          labelLine={false} // Cleanliness
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: "Clear", value: 35, fill: "#fbbf24" },
                            {
                              name: "Partly Cloudy",
                              value: 30,
                              fill: "#38bdf8",
                            },
                            { name: "Cloudy", value: 25, fill: "#64748b" },
                            { name: "Rainy", value: 10, fill: "#2563eb" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(31, 41, 55, 0.9)",
                            border: "1px solid #4b5563",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                            color: "white"
                          }}
                        />
                        <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ color: 'white' }} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                      <Sun className="h-6 w-6 text-yellow-400" />
                      <div>
                        <p className="text-white font-semibold text-base">
                          Most Frequent Condition
                        </p>
                        <p className="text-gray-400">
                          {weatherStats?.mostCommonCondition}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                      <CloudRain className="h-6 w-6 text-blue-400" />
                      <div>
                        <p className="text-white font-semibold text-base">
                          Rainy Days (30-Day)
                        </p>
                        <p className="text-gray-400">3 out of 30 days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                      <TrendingUp className="h-6 w-6 text-emerald-400" />
                      <div>
                        <p className="text-white font-semibold text-base">
                          Temperature Range
                        </p>
                        <p className="text-gray-400">
                          {weatherStats?.minTemperature}°C -{" "}
                          {weatherStats?.maxTemperature}°C
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map View */}
      {activeTab === "map" && (
        <div className="bg-gray-800 rounded-xl shadow-2xl shadow-black/50 border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Interactive Weather Map
              </h2>
              <p className="text-gray-400 font-medium text-sm">
                Select coordinates to pull real-time data.
              </p>
            </div>
            {loading && (
              <div className="flex items-center gap-3 text-cyan-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="font-medium">Acquiring signal...</span>
              </div>
            )}
          </div>
          <div className="h-96 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
            <WeatherMap
              center={[coordinates.lat, coordinates.lon]}
              onLocationSelect={handleMapLocationSelect}
              currentLocation={currentLocation}
              weatherData={{
                temperature: currentWeather.temperature,
                humidity: currentWeather.humidity,
                windSpeed: currentWeather.windSpeed,
                condition: currentWeather.condition,
              }}
            />
          </div>
          <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                Current Map Target
              </span>
            </div>
            <p className="text-sm text-white">
              <strong>
                {currentLocation.name || "No target selected"}
              </strong>
              {currentLocation.lat && (
                <span className="ml-2 text-gray-400 font-mono">
                  ({currentLocation.lat.toFixed(4)},{" "}
                  {currentLocation.lon.toFixed(4)})
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default App;

