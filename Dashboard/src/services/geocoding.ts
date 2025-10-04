// Location search and geocoding service
export interface LocationResult {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
}

// Using Nominatim (OpenStreetMap) for free geocoding
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&limit=5&q=${encodeURIComponent(query)}&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    
    return data.map((item: any) => ({
      name: item.display_name.split(',')[0], // First part of display name
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      country: item.address?.country,
      state: item.address?.state,
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

// Reverse geocoding - get location name from coordinates
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

// Popular locations for quick access
export const POPULAR_LOCATIONS: LocationResult[] = [
  { name: 'Phoenix, Arizona', display_name: 'Phoenix, Arizona, USA', lat: 33.4484, lon: -112.0740 },
  { name: 'New York City', display_name: 'New York City, New York, USA', lat: 40.7128, lon: -74.0060 },
  { name: 'Los Angeles', display_name: 'Los Angeles, California, USA', lat: 34.0522, lon: -118.2437 },
  { name: 'Miami', display_name: 'Miami, Florida, USA', lat: 25.7617, lon: -80.1918 },
  { name: 'Denver', display_name: 'Denver, Colorado, USA', lat: 39.7392, lon: -104.9903 },
  { name: 'London', display_name: 'London, England, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', display_name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', display_name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
];