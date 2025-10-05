import axios from "axios";

const api = axios.create({ 
  baseURL: "/api",  // Use proxy path configured in vite.config.ts
  timeout: 10000,   // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Making API request:', request.method?.toUpperCase(), request.url, request.params);
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API response received:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

export async function getCurrent(lat: number, lon: number) {
  try {
    const { data } = await api.get("/weather/current", { params: { lat, lon } });
    return data;
  } catch (error) {
    console.error('Failed to get current weather:', error);
    throw error;
  }
}

export async function getForecast(lat: number, lon: number, days = 14) {
  try {
    const { data } = await api.get("/weather/forecast", { params: { lat, lon, days } });
    return data;
  } catch (error) {
    console.error('Failed to get forecast:', error);
    throw error;
  }
}

export async function getHourlyForecast(lat: number, lon: number, hours = 48) {
  try {
    const { data } = await api.get("/weather/forecast/hourly", { params: { lat, lon, hours } });
    return data;
  } catch (error) {
    console.error('Failed to get hourly forecast:', error);
    throw error;
  }
}

export async function getWeatherAtTime(lat: number, lon: number, datetime: string) {
  try {
    const { data } = await api.get("/weather/at-time", { 
      params: { lat, lon, datetime_str: datetime } 
    });
    return data;
  } catch (error) {
    console.error('Failed to get weather at time:', error);
    throw error;
  }
}

export async function getMLPredict(lat: number, lon: number, days = 14) {
  try {
    const { data } = await api.get("/ml/predict", { params: { lat, lon, days } });
    return data;
  } catch (error) {
    console.error('Failed to get ML prediction:', error);
    throw error;
  }
}

export async function getProbabilityAnalysis(
  lat: number, 
  lon: number, 
  threshold: number,
  parameter: string = 'temperature',
  operator: string = '>',
  startDate?: string,
  endDate?: string,
  days?: number
) {
  try {
    const params: any = { lat, lon, threshold, parameter, operator };
    
    if (startDate && endDate) {
      params.start_date = startDate;
      params.end_date = endDate;
    } else if (days) {
      params.days = days;
    }
    
    const { data } = await api.get("/ml/probability", { params });
    return data;
  } catch (error) {
    console.error('Failed to get probability analysis:', error);
    throw error;
  }
}

export async function analyzeWeatherRisk(
  lat: number,
  lon: number,
  locationName: string,
  threshold: number,
  parameter: string,
  operator: string,
  startDate: string,
  endDate: string
) {
  try {
    const { data } = await api.post("/ml/analyze", null, {
      params: {
        lat,
        lon,
        location_name: locationName,
        threshold,
        parameter,
        operator,
        start_date: startDate,
        end_date: endDate
      }
    });
    return data;
  } catch (error) {
    console.error('Failed to analyze weather risk:', error);
    throw error;
  }
}

export async function getHealthCheck() {
  try {
    const { data } = await api.get("/health");
    return data;
  } catch (error) {
    console.error('Failed to check health:', error);
    throw error;
  }
}