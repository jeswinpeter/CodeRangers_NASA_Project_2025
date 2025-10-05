import React, { useState, useEffect } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Calendar,
  Clock,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertCircle,
  Moon,
  CloudSnow,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { getForecast, getHourlyForecast } from "../api";

interface ForecastDay {
  date: string;
  datetime: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
  condition: string;
  icon: string;
  day_name: string;
  description: string;
  confidence: {
    probabilities: {
      overall: number;
      temperature: number;
      precipitation: number;
      wind: number;
      condition: number;
    };
    confidence_level: string;
    factors: {
      time_decay: number;
      location_stability: number;
      weather_complexity: number;
    };
  };
}

interface HourlyForecast {
  datetime: string;
  hour: string;
  date: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
  condition: string;
  icon: string;
  is_daytime: boolean;
  confidence: {
    probabilities: {
      overall: number;
      temperature: number;
      precipitation: number;
      wind: number;
      condition: number;
    };
    confidence_level: string;
    factors: {
      time_decay: number;
      location_stability: number;
      weather_complexity: number;
    };
  };
}

interface WeatherForecastProps {
  coordinates: { lat: number; lon: number } | null;
  locationName: string;
}

const WeatherIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  sun: Sun,
  "partly-cloudy": Cloud,
  cloudy: Cloud,
  rain: CloudRain,
  snow: Snowflake,
  moon: Moon,
};

const getWeatherIcon = (iconName: string) => {
  return WeatherIconMap[iconName] || Cloud;
};

export const WeatherForecast: React.FC<WeatherForecastProps> = ({
  coordinates,
  locationName,
}) => {
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"daily" | "hourly" | "charts">(
    "daily"
  );
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const fetchForecastData = async () => {
    if (!coordinates) return;

    setLoading(true);
    setError(null);

    try {
      const [dailyResponse, hourlyResponse] = await Promise.all([
        getForecast(coordinates.lat, coordinates.lon, 14),
        getHourlyForecast(coordinates.lat, coordinates.lon, 48),
      ]);

      setForecastData(dailyResponse.forecast || []);
      setHourlyData(hourlyResponse.hourly_forecast || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch forecast data");
      console.error("Forecast fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecastData();
  }, [coordinates]);

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-green-600 bg-green-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Low":
        return "text-orange-600 bg-orange-100";
      case "Very Low":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getConfidenceBarColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatTemperature = (temp: number) => `${Math.round(temp)}°C`;

  const getDailyChartData = () => {
    return forecastData.map((day) => ({
      date: new Date(day.date).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      }),
      temperature: day.temperature,
      feels_like: day.feels_like,
      humidity: day.humidity,
      wind_speed: day.wind_speed,
      pressure: day.pressure,
      confidence: day.confidence.probabilities.overall,
    }));
  };

  const getHourlyChartData = () => {
    return hourlyData.slice(0, 24).map((hour) => ({
      time: hour.hour,
      temperature: hour.temperature,
      humidity: hour.humidity,
      wind_speed: hour.wind_speed,
      confidence: hour.confidence.probabilities.overall,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-gray-600">Loading forecast data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-red-800 font-semibold">Forecast Error</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchForecastData}
              className="mt-2 text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weather Forecast</h2>
          <p className="text-gray-600">{locationName}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("daily")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "daily"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Daily
          </button>
          <button
            onClick={() => setViewMode("hourly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "hourly"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Hourly
          </button>
          <button
            onClick={() => setViewMode("charts")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "charts"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Charts
          </button>
        </div>
      </div>

      {/* Daily Forecast View */}
      {viewMode === "daily" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {forecastData.slice(0, 8).map((day, index) => {
              const WeatherIcon = getWeatherIcon(day.icon);
              return (
                <div
                  key={day.date}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedDay(index)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {day.day_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <WeatherIcon className="w-8 h-8 text-blue-500" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatTemperature(day.temperature)}
                      </span>
                      <span className="text-sm text-gray-600">
                        Feels {formatTemperature(day.feels_like)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700">{day.condition}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                      <div className="flex items-center">
                        <Droplets className="w-3 h-3 mr-1" />
                        {Math.round(day.humidity)}%
                      </div>
                      <div className="flex items-center">
                        <Wind className="w-3 h-3 mr-1" />
                        {Math.round(day.wind_speed)} km/h
                      </div>
                    </div>

                    {/* Confidence Indicator */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Confidence</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                            day.confidence.confidence_level
                          )}`}
                        >
                          {day.confidence.confidence_level}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getConfidenceBarColor(
                            day.confidence.probabilities.overall
                          )}`}
                          style={{
                            width: `${day.confidence.probabilities.overall}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {day.confidence.probabilities.overall}% accurate
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed view of selected day */}
          {forecastData[selectedDay] && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detailed Forecast - {forecastData[selectedDay].day_name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Temperature</span>
                  </div>
                  <p className="text-xl font-bold">
                    {formatTemperature(forecastData[selectedDay].temperature)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Feels like{" "}
                    {formatTemperature(forecastData[selectedDay].feels_like)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Humidity</span>
                  </div>
                  <p className="text-xl font-bold">
                    {Math.round(forecastData[selectedDay].humidity)}%
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wind className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Wind Speed</span>
                  </div>
                  <p className="text-xl font-bold">
                    {Math.round(forecastData[selectedDay].wind_speed)} km/h
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Pressure</span>
                  </div>
                  <p className="text-xl font-bold">
                    {forecastData[selectedDay].pressure} kPa
                  </p>
                </div>
              </div>

              {/* Confidence Details */}
              <div className="bg-white rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Prediction Confidence
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">
                      Overall Confidence
                    </h5>
                    <div
                      className={`inline-flex px-3 py-2 rounded-full text-sm font-medium ${getConfidenceColor(
                        forecastData[selectedDay].confidence.confidence_level
                      )}`}
                    >
                      {forecastData[selectedDay].confidence.confidence_level} -{" "}
                      {
                        forecastData[selectedDay].confidence.probabilities
                          .overall
                      }
                      %
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${getConfidenceBarColor(
                          forecastData[selectedDay].confidence.probabilities
                            .overall
                        )}`}
                        style={{
                          width: `${forecastData[selectedDay].confidence.probabilities.overall}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">
                      Parameter Confidence
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Temperature:
                        </span>
                        <span className="font-medium">
                          {
                            forecastData[selectedDay].confidence.probabilities
                              .temperature
                          }
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Precipitation:
                        </span>
                        <span className="font-medium">
                          {
                            forecastData[selectedDay].confidence.probabilities
                              .precipitation
                          }
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Wind:</span>
                        <span className="font-medium">
                          {
                            forecastData[selectedDay].confidence.probabilities
                              .wind
                          }
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Condition:
                        </span>
                        <span className="font-medium">
                          {
                            forecastData[selectedDay].confidence.probabilities
                              .condition
                          }
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-3">
                    Confidence Factors
                  </h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">
                        {
                          forecastData[selectedDay].confidence.factors
                            .time_decay
                        }
                        %
                      </div>
                      <div className="text-gray-600">Time Factor</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">
                        {
                          forecastData[selectedDay].confidence.factors
                            .location_stability
                        }
                        %
                      </div>
                      <div className="text-gray-600">Location</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">
                        {
                          forecastData[selectedDay].confidence.factors
                            .weather_complexity
                        }
                        %
                      </div>
                      <div className="text-gray-600">Weather Pattern</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hourly Forecast View */}
      {viewMode === "hourly" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            48-Hour Forecast
          </h3>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <div className="flex space-x-4 p-4 min-w-max">
                {hourlyData.map((hour, index) => {
                  const WeatherIcon = getWeatherIcon(hour.icon);
                  return (
                    <div
                      key={index}
                      className="flex-shrink-0 w-28 text-center bg-white rounded-lg p-3 shadow-sm"
                    >
                      <p className="text-xs text-gray-600 mb-1">{hour.hour}</p>
                      <WeatherIcon
                        className={`w-6 h-6 mx-auto mb-2 ${
                          hour.is_daytime ? "text-yellow-500" : "text-blue-400"
                        }`}
                      />
                      <p className="font-semibold text-sm">
                        {formatTemperature(hour.temperature)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {Math.round(hour.humidity)}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {Math.round(hour.wind_speed)} km/h
                      </p>

                      {/* Confidence indicator for hourly */}
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${getConfidenceBarColor(
                              hour.confidence.probabilities.overall
                            )}`}
                            style={{
                              width: `${hour.confidence.probabilities.overall}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round(hour.confidence.probabilities.overall)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts View */}
      {viewMode === "charts" && (
        <div className="space-y-6">
          {/* Temperature Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              14-Day Temperature Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getDailyChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#3B82F6"
                  fill="#DBEAFE"
                  name="Temperature (°C)"
                />
                <Area
                  type="monotone"
                  dataKey="feels_like"
                  stroke="#EF4444"
                  fill="#FEE2E2"
                  name="Feels Like (°C)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Temperature (Next 24 hours) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              24-Hour Temperature
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getHourlyChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weather Parameters */}
          {/* Prediction Confidence */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Prediction Confidence
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getDailyChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "Confidence"]} />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  name="Confidence (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weather Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Humidity & Wind
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getDailyChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="humidity" fill="#06B6D4" name="Humidity (%)" />
                  <Bar
                    dataKey="wind_speed"
                    fill="#10B981"
                    name="Wind Speed (km/h)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pressure Trend
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={getDailyChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="pressure"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name="Pressure (kPa)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
