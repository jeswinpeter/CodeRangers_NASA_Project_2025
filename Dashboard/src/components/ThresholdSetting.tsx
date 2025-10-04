import React, { useState } from "react";
import {
  Thermometer,
  Wind,
  Droplets,
  CloudRain,
  BarChart3,
} from "lucide-react";

export interface WeatherThreshold {
  parameter:
    | "temperature"
    | "humidity"
    | "windSpeed"
    | "pressure"
    | "precipitation";
  operator: ">" | "<" | ">=" | "<=" | "=";
  value: number;
  unit: string;
  label: string;
}

interface ThresholdSettingProps {
  value: WeatherThreshold;
  onChange: (threshold: WeatherThreshold) => void;
}

export const ThresholdSetting: React.FC<ThresholdSettingProps> = ({
  value,
  onChange,
}) => {
  const [isCustom, setIsCustom] = useState(false);

  const weatherParameters = [
    {
      id: "temperature" as const,
      label: "Temperature",
      icon: <Thermometer className="h-5 w-5" />,
      unit: "°F",
      unitOptions: [
        { value: "°F", label: "Fahrenheit" },
        { value: "°C", label: "Celsius" },
      ],
      presets: [
        { operator: ">" as const, value: 110, label: "Extreme Heat (>110°F)" },
        { operator: ">" as const, value: 100, label: "Very Hot (>100°F)" },
        { operator: ">" as const, value: 90, label: "Hot (>90°F)" },
        { operator: "<" as const, value: 32, label: "Freezing (<32°F)" },
        { operator: "<" as const, value: 20, label: "Very Cold (<20°F)" },
      ],
    },
    {
      id: "humidity" as const,
      label: "Humidity",
      icon: <Droplets className="h-5 w-5" />,
      unit: "%",
      unitOptions: [{ value: "%", label: "Percent" }],
      presets: [
        { operator: ">" as const, value: 80, label: "Very Humid (>80%)" },
        { operator: ">" as const, value: 70, label: "Humid (>70%)" },
        { operator: "<" as const, value: 30, label: "Dry (<30%)" },
        { operator: "<" as const, value: 20, label: "Very Dry (<20%)" },
      ],
    },
    {
      id: "windSpeed" as const,
      label: "Wind Speed",
      icon: <Wind className="h-5 w-5" />,
      unit: "mph",
      unitOptions: [
        { value: "mph", label: "Miles per hour" },
        { value: "m/s", label: "Meters per second" },
        { value: "km/h", label: "Kilometers per hour" },
      ],
      presets: [
        {
          operator: ">" as const,
          value: 74,
          label: "Hurricane Force (>74 mph)",
        },
        { operator: ">" as const, value: 39, label: "Gale Force (>39 mph)" },
        { operator: ">" as const, value: 25, label: "Strong Wind (>25 mph)" },
        { operator: ">" as const, value: 15, label: "Moderate Wind (>15 mph)" },
      ],
    },
    {
      id: "pressure" as const,
      label: "Pressure",
      icon: <BarChart3 className="h-5 w-5" />,
      unit: "hPa",
      unitOptions: [
        { value: "hPa", label: "Hectopascals" },
        { value: "inHg", label: "Inches of Mercury" },
        { value: "mmHg", label: "Millimeters of Mercury" },
      ],
      presets: [
        {
          operator: "<" as const,
          value: 980,
          label: "Low Pressure (<980 hPa)",
        },
        {
          operator: "<" as const,
          value: 1000,
          label: "Below Normal (<1000 hPa)",
        },
        {
          operator: ">" as const,
          value: 1030,
          label: "High Pressure (>1030 hPa)",
        },
        {
          operator: ">" as const,
          value: 1020,
          label: "Above Normal (>1020 hPa)",
        },
      ],
    },
  ];

  const operators = [
    { value: ">" as const, label: "Greater than (>)" },
    { value: ">=" as const, label: "Greater than or equal (≥)" },
    { value: "<" as const, label: "Less than (<)" },
    { value: "<=" as const, label: "Less than or equal (≤)" },
    { value: "=" as const, label: "Equal to (=)" },
  ];

  const currentParameter = weatherParameters.find(
    (p) => p.id === value.parameter
  );

  const handleParameterChange = (parameterId: string) => {
    const parameter = weatherParameters.find((p) => p.id === parameterId);
    if (parameter) {
      onChange({
        parameter: parameter.id,
        operator: ">",
        value: parameter.presets[0]?.value || 0,
        unit: parameter.unit,
        label: parameter.presets[0]?.label || `${parameter.label} > 0`,
      });
      setIsCustom(false);
    }
  };

  const handlePresetSelect = (preset: {
    operator: ">" | "<" | ">=" | "<=" | "=";
    value: number;
    label: string;
  }) => {
    onChange({
      ...value,
      operator: preset.operator,
      value: preset.value,
      label: preset.label,
    });
    setIsCustom(false);
  };

  const handleCustomChange = (field: keyof WeatherThreshold, newValue: any) => {
    const updated = { ...value, [field]: newValue };

    // Update label for custom threshold
    if (field === "operator" || field === "value" || field === "unit") {
      updated.label = `${currentParameter?.label} ${updated.operator} ${updated.value}${updated.unit}`;
    }

    onChange(updated);
  };

  const convertTemperature = (
    temp: number,
    fromUnit: string,
    toUnit: string
  ): number => {
    if (fromUnit === toUnit) return temp;

    if (fromUnit === "°F" && toUnit === "°C") {
      return ((temp - 32) * 5) / 9;
    } else if (fromUnit === "°C" && toUnit === "°F") {
      return (temp * 9) / 5 + 32;
    }

    return temp;
  };

  const convertWindSpeed = (
    speed: number,
    fromUnit: string,
    toUnit: string
  ): number => {
    // Convert to m/s first, then to target unit
    let speedInMs = speed;

    if (fromUnit === "mph") speedInMs = speed * 0.44704;
    else if (fromUnit === "km/h") speedInMs = speed * 0.277778;

    if (toUnit === "mph") return speedInMs / 0.44704;
    else if (toUnit === "km/h") return speedInMs / 0.277778;
    else return speedInMs;
  };

  const convertPressure = (
    pressure: number,
    fromUnit: string,
    toUnit: string
  ): number => {
    // Convert to hPa first, then to target unit
    let pressureInHPa = pressure;

    if (fromUnit === "inHg") pressureInHPa = pressure * 33.8639;
    else if (fromUnit === "mmHg") pressureInHPa = pressure * 1.33322;

    if (toUnit === "inHg") return pressureInHPa / 33.8639;
    else if (toUnit === "mmHg") return pressureInHPa / 1.33322;
    else return pressureInHPa;
  };

  const handleUnitChange = (newUnit: string) => {
    let newValue = value.value;

    if (value.parameter === "temperature") {
      newValue = convertTemperature(value.value, value.unit, newUnit);
    } else if (value.parameter === "windSpeed") {
      newValue = convertWindSpeed(value.value, value.unit, newUnit);
    } else if (value.parameter === "pressure") {
      newValue = convertPressure(value.value, value.unit, newUnit);
    }

    onChange({
      ...value,
      value: Math.round(newValue * 100) / 100, // Round to 2 decimal places
      unit: newUnit,
      label: `${currentParameter?.label} ${value.operator} ${
        Math.round(newValue * 100) / 100
      }${newUnit}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Parameter Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Weather Parameter
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {weatherParameters.map((param) => (
            <button
              key={param.id}
              onClick={() => handleParameterChange(param.id)}
              className={`
                flex items-center space-x-2 p-3 rounded-lg border transition-colors
                ${
                  value.parameter === param.id
                    ? "bg-blue-600/20 border-blue-500 text-blue-300"
                    : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                }
              `}
            >
              {param.icon}
              <span className="text-sm font-medium">{param.label}</span>
            </button>
          ))}
        </div>
      </div>

      {currentParameter && (
        <>
          {/* Preset Thresholds */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Common Thresholds
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentParameter.presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetSelect(preset)}
                  className={`
                    p-3 text-left rounded-lg border transition-colors
                    ${
                      value.label === preset.label
                        ? "bg-blue-600/20 border-blue-500 text-blue-300"
                        : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                    }
                  `}
                >
                  <span className="font-medium">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Threshold */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Custom Threshold
              </label>
              <button
                onClick={() => setIsCustom(!isCustom)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {isCustom ? "Hide Custom" : "Show Custom"}
              </button>
            </div>

            {isCustom && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Parameter
                  </label>
                  <div className="flex items-center space-x-2 p-2 bg-white/5 rounded border border-white/20">
                    {currentParameter.icon}
                    <span className="text-white text-sm">
                      {currentParameter.label}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Operator
                  </label>
                  <select
                    value={value.operator}
                    onChange={(e) =>
                      handleCustomChange("operator", e.target.value)
                    }
                    className="w-full p-2 bg-white/10 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {operators.map((op) => (
                      <option
                        key={op.value}
                        value={op.value}
                        className="bg-gray-800"
                      >
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={value.value}
                    onChange={(e) =>
                      handleCustomChange(
                        "value",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full p-2 bg-white/10 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Unit
                  </label>
                  <select
                    value={value.unit}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    className="w-full p-2 bg-white/10 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currentParameter.unitOptions.map((unit) => (
                      <option
                        key={unit.value}
                        value={unit.value}
                        className="bg-gray-800"
                      >
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Current Selection Summary */}
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <h4 className="text-white font-medium mb-2">Selected Threshold</h4>
            <div className="flex items-center space-x-3">
              {currentParameter.icon}
              <span className="text-white font-medium text-lg">
                {value.label}
              </span>
            </div>
            <p className="text-gray-300 text-sm mt-2">
              Analyze the probability of {currentParameter.label.toLowerCase()}{" "}
              being {value.operator} {value.value}
              {value.unit}
            </p>
          </div>
        </>
      )}
    </div>
  );
};
