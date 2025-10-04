import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  minDate?: string;
  maxDate?: string;
  maxDays?: number;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  maxDays = 30,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const defaultMinDate = minDate || today.toISOString().split("T")[0];
  const defaultMaxDate =
    maxDate ||
    new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
      .toISOString()
      .split("T")[0];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateInRange = (date: string) => {
    if (!value.startDate) return false;
    if (!value.endDate) return date === value.startDate;
    return date >= value.startDate && date <= value.endDate;
  };

  const isDateDisabled = (date: string) => {
    const dateObj = new Date(date);
    const minDateObj = new Date(defaultMinDate);
    const maxDateObj = new Date(defaultMaxDate);

    if (dateObj < minDateObj || dateObj > maxDateObj) return true;

    // If we have a start date but no end date, disable dates that would create a range > maxDays
    if (value.startDate && !value.endDate) {
      const startDateObj = new Date(value.startDate);
      const daysDiff = Math.abs(
        (dateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff > maxDays;
    }

    return false;
  };

  const handleDateClick = (date: string) => {
    if (isDateDisabled(date)) return;

    if (!value.startDate || (value.startDate && value.endDate)) {
      // Start new range
      onChange({ startDate: date, endDate: "" });
    } else {
      // Complete the range
      const startDateObj = new Date(value.startDate);
      const endDateObj = new Date(date);

      if (endDateObj >= startDateObj) {
        onChange({ startDate: value.startDate, endDate: date });
        setShowPicker(false);
      } else {
        onChange({ startDate: date, endDate: value.startDate });
        setShowPicker(false);
      }
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const dateString = date.toISOString().split("T")[0];
      const isDisabled = isDateDisabled(dateString);
      const isInRange = isDateInRange(dateString);
      const isStart = dateString === value.startDate;
      const isEnd = dateString === value.endDate;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(dateString)}
          disabled={isDisabled}
          className={`
            p-2 text-sm rounded-md transition-colors
            ${
              isDisabled
                ? "text-gray-500 cursor-not-allowed"
                : "text-white hover:bg-white/20 cursor-pointer"
            }
            ${isInRange && !isDisabled ? "bg-blue-500/50" : ""}
            ${(isStart || isEnd) && !isDisabled ? "bg-blue-600 font-bold" : ""}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const getQuickRanges = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextTwoWeeks = new Date(today);
    nextTwoWeeks.setDate(nextTwoWeeks.getDate() + 14);

    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return [
      {
        label: "Next 7 days",
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: nextWeek.toISOString().split("T")[0],
      },
      {
        label: "Next 14 days",
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: nextTwoWeeks.toISOString().split("T")[0],
      },
      {
        label: "Next 30 days",
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: nextMonth.toISOString().split("T")[0],
      },
    ];
  };

  const handleQuickRange = (range: { startDate: string; endDate: string }) => {
    onChange(range);
    setShowPicker(false);
  };

  const getDayCount = () => {
    if (!value.startDate || !value.endDate) return 0;
    const start = new Date(value.startDate);
    const end = new Date(value.endDate);
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-full flex items-center space-x-3 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <Calendar className="h-5 w-5 text-blue-400" />
        <div className="flex-1 text-left">
          {value.startDate && value.endDate ? (
            <div>
              <span className="font-medium">
                {formatDate(value.startDate)} - {formatDate(value.endDate)}
              </span>
              <span className="text-gray-300 text-sm ml-2">
                ({getDayCount()} days)
              </span>
            </div>
          ) : value.startDate ? (
            <span className="text-gray-300">
              From {formatDate(value.startDate)} - Select end date
            </span>
          ) : (
            <span className="text-gray-300">Select date range</span>
          )}
        </div>
      </button>

      {showPicker && (
        <div className="absolute z-50 mt-2 p-4 bg-gray-800/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl w-full min-w-80">
          {/* Quick Range Buttons */}
          <div className="mb-4">
            <p className="text-gray-300 text-sm font-medium mb-2">
              Quick Select
            </p>
            <div className="flex flex-wrap gap-2">
              {getQuickRanges().map((range, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickRange(range)}
                  className="px-3 py-1 text-sm bg-blue-600/20 text-blue-300 rounded-md hover:bg-blue-600/30 transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-1 text-gray-300 hover:text-white hover:bg-white/10 rounded"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-white font-medium">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={() => navigateMonth("next")}
              className="p-1 text-gray-300 hover:text-white hover:bg-white/10 rounded"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-gray-400 text-sm font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <div className="text-gray-300 text-sm">
              {value.startDate && value.endDate && (
                <span>Selected: {getDayCount()} days</span>
              )}
            </div>
            <button
              onClick={() => setShowPicker(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
