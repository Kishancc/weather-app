'use client';

import { useState } from 'react';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';

export default function Home() {
  const [location, setLocation] = useState('');

  const handleSearch = (searchTerm: string) => {
    setLocation(searchTerm);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-pink-50">
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
        {location && <WeatherDisplay location={location} />}
      </div>
    </main>
  );
}
