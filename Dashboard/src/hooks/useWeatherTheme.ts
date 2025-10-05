import { useEffect } from 'react';
import { WeatherTheme, getWeatherTheme, getThemeClasses } from '../utils/weatherThemes';
import { weatherAnimationStyles } from '../utils/weatherAnimation';

interface WeatherData {
  condition: string;
  description: string;
}

export const useWeatherTheme = (weatherData: WeatherData) => {
  const theme = getWeatherTheme(weatherData.condition, weatherData.description);
  const themeClasses = getThemeClasses(theme);

  // Inject animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = weatherAnimationStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return { theme, themeClasses };
};