'use client';

import { useState } from 'react';
import WeatherDisplay from './components/WeatherDisplay';
import SearchBar from './components/SearchBar';

export default function Home() {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);

  const handleSearch = async (searchLocation: string) => {
    setLocation(searchLocation);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-rose-100 to-amber-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 drop-shadow-sm">
            Weather Forecast
          </h1>
          <p className="text-gray-600 text-lg">
            Enter a location to get detailed weather information
          </p>
        </div>
        <SearchBar onSearch={handleSearch} />
        {location && (
          <div className="animate-slide-up">
            <WeatherDisplay location={location} />
          </div>
        )}
      </div>
    </main>
  );
}
