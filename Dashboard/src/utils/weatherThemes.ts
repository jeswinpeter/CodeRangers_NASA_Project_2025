export type WeatherTheme = 'sunny' | 'rainy' | 'thunderstorm' | 'cloudy';

export interface ThemeClasses {
  background: string;
  header: string;
  card: string;
}

export const getWeatherTheme = (condition: string, description: string): WeatherTheme => {
  const condLower = condition.toLowerCase();
  const descLower = description.toLowerCase();
  
  if (condLower.includes('rain') || descLower.includes('rain')) {
    return 'rainy';
  } else if (condLower.includes('thunder') || condLower.includes('storm') || descLower.includes('thunder')) {
    return 'thunderstorm';
  } else if (condLower.includes('cloud') || descLower.includes('cloud')) {
    return 'cloudy';
  } else {
    return 'sunny';
  }
};

export const getThemeClasses = (theme: WeatherTheme): ThemeClasses => {
  switch (theme) {
    case 'rainy':
      return {
        background: 'bg-gradient-to-br from-slate-600 via-blue-700 to-slate-800',
        header: 'bg-slate-800/30',
        card: 'bg-slate-700/30'
      };
    case 'thunderstorm':
      return {
        background: 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-950',
        header: 'bg-gray-900/40',
        card: 'bg-gray-800/40'
      };
    case 'cloudy':
      return {
        background: 'bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600',
        header: 'bg-gray-600/30',
        card: 'bg-gray-500/30'
      };
    default: // sunny
      return {
        background: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600',
        header: 'bg-white/20',
        card: 'bg-white/30'
      };
  }
};