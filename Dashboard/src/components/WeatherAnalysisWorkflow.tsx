import React, { useState } from "react";
import {
  Satellite,
  Search,
  Calendar,
  Settings,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { LocationSearch } from "./LocationSearch";
import { DateRangePicker, DateRange } from "./DateRangePicker";
import { ThresholdSetting, WeatherThreshold } from "./ThresholdSetting";
import { ProbabilityCharts } from "./ProbabilityCharts";
import { analyzeWeatherRisk } from "../api";

interface AnalysisResult {
  analysis_id: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  criteria: {
    parameter: string;
    operator: string;
    threshold: number;
    date_range: {
      start: string;
      end: string;
      days: number;
    };
  };
  results: {
    overall_probability: number;
    risk_level: string;
    summary: string;
    daily_probabilities: Array<{
      date: string;
      probability: number;
      predicted_value: number;
    }>;
  };
  historical_context: {
    mean: number;
    std: number;
    min: number;
    max: number;
    historical_exceedance_rate: number;
    total_days: number;
    exceedance_days: number;
  };
  generated_at: string;
  data_source: string;
}

export const WeatherAnalysisWorkflow: React.FC = () => {
  // Workflow state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  // Form data
  const [location, setLocation] = useState({
    lat: 33.4484,
    lon: -112.074,
    name: "Phoenix, Arizona, USA",
  });

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 1);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 14);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  });

  const [threshold, setThreshold] = useState<WeatherThreshold>({
    parameter: "temperature",
    operator: ">",
    value: 110,
    unit: "°F",
    label: "Extreme Heat (>110°F)",
  });

  const steps = [
    {
      id: 1,
      title: "Location",
      icon: Search,
      description: "Search for location",
    },
    {
      id: 2,
      title: "Date Range",
      icon: Calendar,
      description: "Select analysis period",
    },
    {
      id: 3,
      title: "Threshold",
      icon: Settings,
      description: "Set weather criteria",
    },
    { id: 4, title: "Analyze", icon: Play, description: "Run analysis" },
    {
      id: 5,
      title: "Results",
      icon: TrendingUp,
      description: "View predictions",
    },
  ];

  const handleAnalyze = async () => {
    if (!location.name || !dateRange.startDate || !dateRange.endDate) {
      setError("Please complete all steps before analyzing");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Convert temperature from Fahrenheit to Celsius if needed
      let analysisThreshold = threshold.value;
      if (threshold.parameter === "temperature" && threshold.unit === "°F") {
        analysisThreshold = ((threshold.value - 32) * 5) / 9;
      }

      const result = await analyzeWeatherRisk(
        location.lat,
        location.lon,
        location.name,
        analysisThreshold,
        threshold.parameter,
        threshold.operator,
        dateRange.startDate,
        dateRange.endDate
      );

      setAnalysisResult(result);
      setCurrentStep(5);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Analysis failed. Please try again."
      );
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= 4 && !loading) {
      setCurrentStep(stepId);
      setError("");
    }
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return location.name && location.lat && location.lon;
      case 2:
        return dateRange.startDate && dateRange.endDate;
      case 3:
        return threshold.parameter && threshold.value > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getStepStatus = (stepId: number) => {
    if (currentStep === stepId) return "current";
    if (currentStep > stepId && canProceed(stepId)) return "completed";
    if (currentStep > stepId) return "error";
    return "pending";
  };

  const getStepIcon = (step: any, status: string) => {
    if (status === "completed") return <CheckCircle className="h-5 w-5" />;
    if (status === "error") return <AlertCircle className="h-5 w-5" />;
    if (status === "current" && loading && step.id === 4)
      return <Loader2 className="h-5 w-5 animate-spin" />;
    return <step.icon className="h-5 w-5" />;
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white border-green-600";
      case "current":
        return "bg-blue-600 text-white border-blue-600";
      case "error":
        return "bg-red-600 text-white border-red-600";
      default:
        return "bg-gray-600 text-gray-300 border-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Satellite className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">
              NASA Weather Risk Analysis
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const isClickable = step.id <= 4 && !loading;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => isClickable && handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={`
                      flex flex-col items-center space-y-2 p-4 rounded-lg transition-all
                      ${
                        isClickable
                          ? "hover:bg-white/10 cursor-pointer"
                          : "cursor-default"
                      }
                      ${status === "current" ? "bg-white/10" : ""}
                    `}
                  >
                    <div
                      className={`
                      flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors
                      ${getStepColor(status)}
                    `}
                    >
                      {getStepIcon(step, status)}
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium text-sm">
                        {step.title}
                      </p>
                      <p className="text-gray-300 text-xs">
                        {step.description}
                      </p>
                    </div>
                  </button>

                  {index < steps.length - 1 && (
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 mb-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Step 1: Choose Location
              </h2>
              <p className="text-gray-300 mb-6">
                Search for a location to analyze weather risks. You can search
                by city name, address, or famous landmarks.
              </p>
              <LocationSearch
                value={location}
                onChange={(newLocation) => setLocation(newLocation)}
                placeholder="Search for a location (e.g., Phoenix, Arizona)"
              />
              {location.name && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                  <p className="text-white font-medium">Selected Location:</p>
                  <p className="text-gray-300">{location.name}</p>
                  <p className="text-gray-400 text-sm">
                    Coordinates: {location.lat.toFixed(4)},{" "}
                    {location.lon.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Step 2: Select Date Range
              </h2>
              <p className="text-gray-300 mb-6">
                Choose the time period you want to analyze. You can select up to
                30 days in the future.
              </p>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                maxDays={30}
              />
              {dateRange.startDate && dateRange.endDate && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                  <p className="text-white font-medium">Selected Period:</p>
                  <p className="text-gray-300">
                    {new Date(dateRange.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(dateRange.endDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Duration:{" "}
                    {Math.ceil(
                      (new Date(dateRange.endDate).getTime() -
                        new Date(dateRange.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    ) + 1}{" "}
                    days
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Step 3: Set Weather Threshold
              </h2>
              <p className="text-gray-300 mb-6">
                Define the weather condition you want to analyze. Choose a
                parameter, comparison operator, and threshold value.
              </p>
              <ThresholdSetting value={threshold} onChange={setThreshold} />
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Step 4: Run Analysis
              </h2>
              <p className="text-gray-300 mb-8">
                Ready to analyze weather risks for your selected criteria.
                Review your settings and click the button below to start.
              </p>

              {/* Analysis Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-medium">{location.name}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Date Range</p>
                  <p className="text-white font-medium">
                    {new Date(dateRange.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(dateRange.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Threshold</p>
                  <p className="text-white font-medium">{threshold.label}</p>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium text-lg transition-colors flex items-center space-x-3 mx-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-6 w-6" />
                    <span>Start Analysis</span>
                  </>
                )}
              </button>
            </div>
          )}

          {currentStep === 5 && analysisResult && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Step 5: Analysis Results
                </h2>
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setAnalysisResult(null);
                    setError("");
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  New Analysis
                </button>
              </div>

              <ProbabilityCharts
                data={analysisResult.results.daily_probabilities}
                parameter={analysisResult.criteria.parameter}
                threshold={threshold.value} // Use original threshold with units
                operator={analysisResult.criteria.operator}
                unit={threshold.unit}
                overallProbability={analysisResult.results.overall_probability}
                riskLevel={analysisResult.results.risk_level}
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              Previous
            </button>

            <button
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
              disabled={!canProceed(currentStep)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {currentStep === 3 ? "Review & Analyze" : "Next"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
