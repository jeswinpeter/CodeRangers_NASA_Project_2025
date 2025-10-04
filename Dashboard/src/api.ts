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

export async function getForecast(lat: number, lon: number) {
  try {
    const { data } = await api.get("/weather/forecast", { params: { lat, lon } });
    return data;
  } catch (error) {
    console.error('Failed to get forecast:', error);
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

export async function getHealthCheck() {
  try {
    const { data } = await api.get("/health");
    return data;
  } catch (error) {
    console.error('Failed to check health:', error);
    throw error;
  }
}