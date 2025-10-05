import React from 'react';
import { WeatherTheme } from '../utils/weatherThemes';

interface WeatherBackgroundProps {
  theme: WeatherTheme;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ theme }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Sunny Animation */}
      {theme === 'sunny' && (
        <div className="absolute top-8 right-8 w-[16rem] h-[16rem] bg-yellow-300 rounded-full sun-glow pulse-orb"></div>
      )}

      {/* Rainy Animation */}
      {theme === 'rainy' && (
        <>
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute rain-drop animate-rain"
              style={{
                left: `${(i * 2.5 + Math.random() * 2)}%`,
                top: `-${Math.random() * 10}%`,
                width: '3px',
                height: `${24 + Math.random() * 36}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.7 + Math.random() * 0.6}s`
              }}
            ></div>
          ))}
          <div className="absolute inset-0 bg-blue-900/20"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-400/40 to-transparent"></div>
        </>
      )}

      {/* Thunderstorm Animation */}
      {theme === 'thunderstorm' && (
        <>
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="absolute lightning-flash"
              style={{
                height: `${window.innerHeight * (0.5 + Math.random() * 0.4)}px`,
                top: `-${Math.random() * 10}vh`,
                left: `${5 + Math.random() * 90}%`,
                animationDelay: `${i * 0.8 + Math.random() * 1.5}s`,
                animationDuration: `${5 + Math.random() * 3}s`,
                transform: `scaleY(0.1) translateY(-50%) rotate(${Math.random() * 30 - 15}deg)`,
              }}
            ></div>
          ))}

          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute rain-drop animate-rain"
              style={{
                left: `${(i * 1.6 + Math.random() * 2)}%`,
                top: `-${Math.random() * 15}%`,
                width: '4px',
                height: `${30 + Math.random() * 50}px`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${0.4 + Math.random() * 0.4}s`,
                opacity: 0.9
              }}
            ></div>
          ))}
          
          <div className="absolute top-0 left-0 w-full h-full bg-gray-900/50 thunder-cloud" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gray-800/40 thunder-cloud-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -top-1/4 left-1/4 w-[120vw] h-[120vh] bg-gray-800/30 rounded-full blur-3xl animate-cloud" style={{ animationDuration: '70s', animationDelay: '0s' }}></div>
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pulse-orb"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-400/30 to-transparent"></div>
        </>
      )}

      {/* Cloudy Animation */}
      {theme === 'cloudy' && (
        <>
          <div className="absolute top-10 left-10 w-96 h-44 bg-white/30 rounded-full animate-cloud"></div>
          <div className="absolute top-32 right-20 w-[28rem] h-56 bg-white/20 rounded-full animate-cloud-slow"></div>
          <div className="absolute top-48 left-1/3 w-80 h-40 bg-white/35 rounded-full animate-cloud" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-44 bg-white/30 rounded-full animate-cloud-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-400/30 to-transparent"></div>
        </>
      )}
    </div>
  );
};