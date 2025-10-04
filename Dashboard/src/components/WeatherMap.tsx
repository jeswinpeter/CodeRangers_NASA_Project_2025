import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { LatLngExpression, Icon, DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
// Fix leaflet's default icon issue with webpack
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface WeatherMapProps {
  center: [number, number];
  onLocationSelect: (lat: number, lon: number) => void;
  currentLocation?: {
    lat: number;
    lon: number;
    name?: string;
  };
  weatherData?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
  };
}

// Component to handle map clicks
const LocationSelector: React.FC<{
  onLocationSelect: (lat: number, lon: number) => void;
}> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

// Component to handle map center updates
const MapCenterUpdater: React.FC<{ center: LatLngExpression }> = ({
  center,
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
};

// Custom weather marker
const createWeatherIcon = (temperature: number, condition: string) => {
  const getConditionEmoji = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes("clear") || cond.includes("sunny")) return "☀️";
    if (cond.includes("cloud")) return "☁️";
    if (cond.includes("rain")) return "🌧️";
    if (cond.includes("snow")) return "❄️";
    if (cond.includes("storm")) return "⛈️";
    return "🌤️";
  };

  return new DivIcon({
    className: "weather-marker",
    html: `
      <div style="
        background: rgba(59, 130, 246, 0.9);
        color: white;
        border-radius: 12px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border: 2px solid white;
        min-width: 80px;
      ">
        <div style="font-size: 16px;">${getConditionEmoji(condition)}</div>
        <div>${temperature.toFixed(1)}°C</div>
      </div>
    `,
    iconSize: [80, 60],
    iconAnchor: [40, 30],
  });
};

export const WeatherMap: React.FC<WeatherMapProps> = ({
  center,
  onLocationSelect,
  currentLocation,
  weatherData,
}) => {
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(center);

  useEffect(() => {
    if (currentLocation) {
      setMapCenter([currentLocation.lat, currentLocation.lon]);
    }
  }, [currentLocation]);

  const weatherIcon = weatherData
    ? createWeatherIcon(weatherData.temperature, weatherData.condition)
    : undefined;

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterUpdater center={mapCenter} />
        <LocationSelector onLocationSelect={onLocationSelect} />

        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lon]}
            icon={weatherIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-2">
                  {currentLocation.name ||
                    `${currentLocation.lat.toFixed(
                      4
                    )}, ${currentLocation.lon.toFixed(4)}`}
                </h3>
                {weatherData && (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Temperature:</span>
                      <span className="font-semibold">
                        {weatherData.temperature.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Humidity:</span>
                      <span className="font-semibold">
                        {weatherData.humidity}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wind Speed:</span>
                      <span className="font-semibold">
                        {weatherData.windSpeed.toFixed(1)} m/s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Condition:</span>
                      <span className="font-semibold">
                        {weatherData.condition}
                      </span>
                    </div>
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Click anywhere on the map to check weather at that location
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Instructions Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10 max-w-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">
            Interactive Weather Map
          </span>
        </div>
        <p className="text-xs text-gray-600">
          Click anywhere on the map to get weather data for that location
        </p>
      </div>
    </div>
  );
};
