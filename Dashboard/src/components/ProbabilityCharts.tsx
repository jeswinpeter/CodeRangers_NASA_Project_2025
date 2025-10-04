import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, Calendar } from "lucide-react";

interface DailyProbability {
  date: string;
  probability: number;
  predicted_value: number;
}

interface ProbabilityChartsProps {
  data: DailyProbability[];
  parameter: string;
  threshold: number;
  operator: string;
  unit: string;
  overallProbability: number;
  riskLevel: string;
}

export const ProbabilityCharts: React.FC<ProbabilityChartsProps> = ({
  data,
  parameter,
  threshold,
  operator,
  unit,
  overallProbability,
  riskLevel,
}) => {
  // Format data for charts
  const chartData = data.map((item, index) => ({
    ...item,
    date_short: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    day: index + 1,
    probability_percentage: item.probability * 100,
    threshold_line: threshold,
    risk_zone:
      item.probability > 0.5
        ? "high"
        : item.probability > 0.3
        ? "medium"
        : "low",
  }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800/95 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">
            {new Date(data.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-blue-300">
              Probability:{" "}
              <span className="font-bold">
                {(data.probability * 100).toFixed(1)}%
              </span>
            </p>
            <p className="text-green-300">
              Predicted {parameter}:{" "}
              <span className="font-bold">
                {data.predicted_value.toFixed(1)}
                {unit}
              </span>
            </p>
            <p className="text-orange-300">
              Threshold:{" "}
              <span className="font-bold">
                {threshold}
                {unit}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Risk level styling
  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high":
        return <AlertTriangle className="h-5 w-5" />;
      case "medium":
        return <TrendingUp className="h-5 w-5" />;
      case "low":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  // Calculate statistics
  const avgProbability =
    data.reduce((sum, item) => sum + item.probability, 0) / data.length;
  const maxProbability = Math.max(...data.map((item) => item.probability));
  const highRiskDays = data.filter((item) => item.probability > 0.5).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            {getRiskIcon(riskLevel)}
            <span className="text-gray-300 text-sm font-medium">
              Overall Risk
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${getRiskColor(riskLevel)}`}>
              {(overallProbability * 100).toFixed(1)}%
            </span>
            <span
              className={`text-sm px-2 py-1 rounded ${
                riskLevel.toLowerCase() === "high"
                  ? "bg-red-500/20 text-red-300"
                  : riskLevel.toLowerCase() === "medium"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : "bg-green-500/20 text-green-300"
              }`}
            >
              {riskLevel}
            </span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span className="text-gray-300 text-sm font-medium">
              Avg Probability
            </span>
          </div>
          <span className="text-2xl font-bold text-blue-400">
            {(avgProbability * 100).toFixed(1)}%
          </span>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <span className="text-gray-300 text-sm font-medium">Peak Risk</span>
          </div>
          <span className="text-2xl font-bold text-orange-400">
            {(maxProbability * 100).toFixed(1)}%
          </span>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            <span className="text-gray-300 text-sm font-medium">
              High Risk Days
            </span>
          </div>
          <span className="text-2xl font-bold text-purple-400">
            {highRiskDays}/{data.length}
          </span>
        </div>
      </div>

      {/* Probability Trend Chart */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-blue-400" />
          Daily Probability Trend
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="probabilityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="date_short"
                stroke="rgba(255,255,255,0.7)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="rgba(255,255,255,0.7)"
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="probability_percentage"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#probabilityGradient)"
                name="Probability"
              />
              {/* Threshold line at 50% */}
              <Line
                type="monotone"
                dataKey={() => 50}
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="High Risk Threshold (50%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predicted Values vs Threshold */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-green-400" />
          Predicted {parameter.charAt(0).toUpperCase() + parameter.slice(1)} vs
          Threshold
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="date_short"
                stroke="rgba(255,255,255,0.7)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="rgba(255,255,255,0.7)"
                fontSize={12}
                tickFormatter={(value) => `${value}${unit}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="predicted_value"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                name={`Predicted ${parameter}`}
              />
              <Line
                type="monotone"
                dataKey="threshold_line"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name={`Threshold (${threshold}${unit})`}
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Distribution Bar Chart */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <BarChart className="h-6 w-6 mr-2 text-purple-400" />
          Daily Risk Distribution
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="date_short"
                stroke="rgba(255,255,255,0.7)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="rgba(255,255,255,0.7)"
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="probability_percentage"
                name="Probability"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Assessment Summary */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">
          Risk Assessment Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-white mb-3">
              Analysis Results
            </h4>
            <div className="space-y-2 text-gray-300">
              <p>
                • Overall probability of threshold exceedance:{" "}
                <span className="font-bold text-white">
                  {(overallProbability * 100).toFixed(1)}%
                </span>
              </p>
              <p>
                • Average daily probability:{" "}
                <span className="font-bold text-white">
                  {(avgProbability * 100).toFixed(1)}%
                </span>
              </p>
              <p>
                • Number of high-risk days ({">"}50%):{" "}
                <span className="font-bold text-white">
                  {highRiskDays} out of {data.length}
                </span>
              </p>
              <p>
                • Risk level classification:{" "}
                <span className={`font-bold ${getRiskColor(riskLevel)}`}>
                  {riskLevel}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-3">
              Recommendations
            </h4>
            <div className="space-y-2 text-gray-300">
              {riskLevel.toLowerCase() === "high" && (
                <>
                  <p>• ⚠️ High risk period - prepare contingency plans</p>
                  <p>• 📊 Monitor weather updates closely</p>
                  <p>
                    • 🎯 Consider adjusting activities during peak risk days
                  </p>
                </>
              )}
              {riskLevel.toLowerCase() === "medium" && (
                <>
                  <p>• ⚡ Moderate risk - maintain awareness</p>
                  <p>• 📈 Check forecasts regularly</p>
                  <p>• 🔄 Have backup plans ready</p>
                </>
              )}
              {riskLevel.toLowerCase() === "low" && (
                <>
                  <p>• ✅ Low risk period - favorable conditions expected</p>
                  <p>• 🌟 Good time for outdoor activities</p>
                  <p>• 📅 Consider this for planning purposes</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
