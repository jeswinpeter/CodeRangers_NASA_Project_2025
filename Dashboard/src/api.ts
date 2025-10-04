import axios from "axios";

const api = axios.create({ 
  baseURL: "/api"  // Use proxy path configured in vite.config.ts
});

export async function getCurrent(lat: number, lon: number) {
  const { data } = await api.get("/weather/current", { params: { lat, lon } });
  return data;
}

export async function getForecast(lat: number, lon: number) {
  const { data } = await api.get("/weather/forecast", { params: { lat, lon } });
  return data;
}

export async function getMLPredict(lat: number, lon: number, days = 14) {
  const { data } = await api.get("/ml/predict", { params: { lat, lon, days } });
  return data;
}

export async function getHealthCheck() {
  const { data } = await api.get("/health");
  return data;
}