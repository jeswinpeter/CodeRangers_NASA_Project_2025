import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, X } from "lucide-react";
import {
  searchLocations,
  LocationResult,
  POPULAR_LOCATIONS,
  reverseGeocode,
} from "../services/geocoding";

interface LocationSearchProps {
  value: { lat: number; lon: number; name?: string };
  onChange: (location: { lat: number; lon: number; name: string }) => void;
  placeholder?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  onChange,
  placeholder = "Search any city, town, or village worldwide (e.g., Phoenix, Barcelona, Kyoto)",
}) => {
  const [query, setQuery] = useState(value.name || "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setShowPopular(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reverse geocode current coordinates if no name is provided
  useEffect(() => {
    if (!value.name && value.lat && value.lon) {
      reverseGeocode(value.lat, value.lon).then((name) => {
        setQuery(name);
      });
    }
  }, [value.lat, value.lon, value.name]);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchLocations(searchQuery);
      setResults(searchResults);
      setShowResults(true);
      setShowPopular(false);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Clear previous timeout
    if ((window as any).searchTimeout) {
      clearTimeout((window as any).searchTimeout);
    }

    // Debounce search with shorter delay for better UX
    (window as any).searchTimeout = setTimeout(
      () => handleSearch(newQuery),
      200
    );
  };

  const handleLocationSelect = (location: LocationResult) => {
    setQuery(location.display_name);
    onChange({
      lat: location.lat,
      lon: location.lon,
      name: location.display_name,
    });
    setShowResults(false);
    setShowPopular(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    setShowPopular(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (!query.trim()) {
      setShowPopular(true);
    } else if (results.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          <div className="px-4 py-2 border-b border-white/10">
            <p className="text-gray-300 text-sm font-medium">
              Found {results.length} location{results.length !== 1 ? "s" : ""}
            </p>
          </div>
          {results.map((location, index) => (
            <button
              key={index}
              onClick={() => handleLocationSelect(location)}
              className="w-full px-4 py-3 text-left hover:bg-white/10 border-b border-white/10 last:border-b-0 focus:outline-none focus:bg-white/10 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-white font-medium truncate">
                      {location.name}
                    </p>
                    {location.type && (
                      <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 text-xs rounded-full flex-shrink-0">
                        {location.type}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm truncate mt-0.5">
                    {location.display_name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-400 text-xs">
                      {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                    </p>
                    {location.country && (
                      <p className="text-gray-400 text-xs">
                        {location.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showResults && results.length === 0 && !loading && query.length > 1 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl">
          <div className="px-4 py-6 text-center">
            <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-300 font-medium">No locations found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try searching for a different city, town, or location name
            </p>
          </div>
        </div>
      )}

      {/* Popular Locations */}
      {showPopular && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl">
          <div className="px-4 py-2 border-b border-white/10">
            <p className="text-gray-300 text-sm font-medium">
              Popular Locations
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {POPULAR_LOCATIONS.map((location, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(location)}
                className="w-full px-4 py-3 text-left hover:bg-white/10 border-b border-white/10 last:border-b-0 focus:outline-none focus:bg-white/10"
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{location.name}</p>
                    <p className="text-gray-400 text-xs">
                      {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
