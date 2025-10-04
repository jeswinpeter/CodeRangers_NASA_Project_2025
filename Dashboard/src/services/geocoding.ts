// Location search and geocoding service
export interface LocationResult {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
  type?: string;
  importance?: number;
}

// Using Nominatim (OpenStreetMap) for free geocoding
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Alternative geocoding service for better coverage
const PHOTON_BASE_URL = 'https://photon.komoot.io';

// Helper function to search with Photon API (alternative service)
async function searchWithPhoton(query: string): Promise<LocationResult[]> {
  try {
    const response = await fetch(
      `${PHOTON_BASE_URL}/api?q=${encodeURIComponent(query)}&limit=10&layer=city,locality,district,county`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    return data.features?.map((feature: any) => ({
      name: feature.properties.name || feature.properties.city || feature.properties.locality,
      display_name: [
        feature.properties.name || feature.properties.city || feature.properties.locality,
        feature.properties.district,
        feature.properties.state,
        feature.properties.country
      ].filter(Boolean).join(', '),
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
      country: feature.properties.country,
      state: feature.properties.state,
      type: feature.properties.osm_value || 'city',
      importance: 0.5,
    })) || [];
  } catch (error) {
    console.error('Photon geocoding error:', error);
    return [];
  }
}

export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    // Run multiple searches in parallel for better coverage
    const [nominatimResults, photonResults] = await Promise.allSettled([
      searchWithNominatim(query),
      searchWithPhoton(query)
    ]);

    let allResults: LocationResult[] = [];

    // Combine results from both services
    if (nominatimResults.status === 'fulfilled') {
      allResults.push(...nominatimResults.value);
    }

    if (photonResults.status === 'fulfilled') {
      allResults.push(...photonResults.value);
    }

    // Remove duplicates based on proximity (within ~100m)
    const uniqueResults = allResults.filter((result, index, self) =>
      index === self.findIndex(r => 
        Math.abs(r.lat - result.lat) < 0.001 && Math.abs(r.lon - result.lon) < 0.001
      )
    );

    // Sort by importance and relevance
    return uniqueResults
      .sort((a, b) => {
        // Prioritize exact name matches
        const aExactMatch = a.name.toLowerCase() === query.toLowerCase() ? 1 : 0;
        const bExactMatch = b.name.toLowerCase() === query.toLowerCase() ? 1 : 0;
        if (aExactMatch !== bExactMatch) return bExactMatch - aExactMatch;
        
        // Then by importance
        return (b.importance || 0) - (a.importance || 0);
      })
      .slice(0, 15);

  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

// Enhanced Nominatim search with better parameters
async function searchWithNominatim(query: string): Promise<LocationResult[]> {
  try {
    // First, try to search for populated places (cities, towns, villages)
    const populatedPlacesResponse = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&limit=15&q=${encodeURIComponent(query)}&addressdetails=1&featuretype=settlement&class=place`
    );

    let results: LocationResult[] = [];

    if (populatedPlacesResponse.ok) {
      const populatedData = await populatedPlacesResponse.json();
      results = populatedData.map((item: any) => ({
        name: item.address?.city || item.address?.town || item.address?.village || item.display_name.split(',')[0],
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        country: item.address?.country,
        state: item.address?.state || item.address?.region,
        type: item.type || 'place',
        importance: item.importance || 0,
      }));
    }

    // If we don't have enough results, do a broader search
    if (results.length < 5) {
      const broadResponse = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=json&limit=20&q=${encodeURIComponent(query)}&addressdetails=1`
      );

      if (broadResponse.ok) {
        const broadData = await broadResponse.json();
        const additionalResults = broadData
          .filter((item: any) => 
            // Filter for populated places and administrative areas
            item.type === 'city' || 
            item.type === 'town' || 
            item.type === 'village' || 
            item.type === 'hamlet' || 
            item.type === 'municipality' || 
            item.type === 'administrative' ||
            item.class === 'place' ||
            item.class === 'boundary'
          )
          .map((item: any) => ({
            name: item.address?.city || 
                  item.address?.town || 
                  item.address?.village || 
                  item.address?.municipality ||
                  item.display_name.split(',')[0],
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            country: item.address?.country,
            state: item.address?.state || item.address?.region,
            type: item.type || 'place',
            importance: item.importance || 0,
          }));

        // Combine results and remove duplicates
        const combinedResults = [...results, ...additionalResults];
        const uniqueResults = combinedResults.filter((result, index, self) =>
          index === self.findIndex(r => 
            Math.abs(r.lat - result.lat) < 0.001 && Math.abs(r.lon - result.lon) < 0.001
          )
        );

        results = uniqueResults;
      }
    }

    return results;

  } catch (error) {
    console.error('Nominatim geocoding error:', error);
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

// Popular locations for quick access - mix of major cities and interesting smaller places
export const POPULAR_LOCATIONS: LocationResult[] = [
  { name: 'Phoenix, Arizona', display_name: 'Phoenix, Arizona, USA', lat: 33.4484, lon: -112.0740, type: 'city' },
  { name: 'New York City', display_name: 'New York City, New York, USA', lat: 40.7128, lon: -74.0060, type: 'city' },
  { name: 'Los Angeles', display_name: 'Los Angeles, California, USA', lat: 34.0522, lon: -118.2437, type: 'city' },
  { name: 'Barcelona', display_name: 'Barcelona, Catalonia, Spain', lat: 41.3851, lon: 2.1734, type: 'city' },
  { name: 'Kyoto', display_name: 'Kyoto, Japan', lat: 35.0116, lon: 135.7681, type: 'city' },
  { name: 'Cape Town', display_name: 'Cape Town, South Africa', lat: -33.9249, lon: 18.4241, type: 'city' },
  { name: 'Reykjavik', display_name: 'Reykjavik, Iceland', lat: 64.1466, lon: -21.9426, type: 'city' },
  { name: 'Aspen', display_name: 'Aspen, Colorado, USA', lat: 39.1911, lon: -106.8175, type: 'town' },
  { name: 'Banff', display_name: 'Banff, Alberta, Canada', lat: 51.1784, lon: -115.5708, type: 'town' },
  { name: 'Hallstatt', display_name: 'Hallstatt, Austria', lat: 47.5623, lon: 13.6493, type: 'village' },
];