// Simple location search API for the main app
export interface LocationResult {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
}

export async function simpleLocationSearch(query: string): Promise<LocationResult[]> {
  if (!query.trim() || query.length < 2) {
    return [];
  }

  try {
    // Use Nominatim API for reliable results
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=10&q=${encodeURIComponent(query)}&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    
    return data
      .filter((item: any) => 
        // Filter for populated places
        item.type === 'city' || 
        item.type === 'town' || 
        item.type === 'village' || 
        item.type === 'hamlet' || 
        item.type === 'municipality' || 
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
      }))
      .slice(0, 8); // Limit to 8 results

  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
}