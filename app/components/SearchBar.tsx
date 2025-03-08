'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  onSearch: (location: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a city..."
          className="w-full px-6 py-4 text-lg rounded-full border-2 border-gray-200 
                   bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-400
                   focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100
                   transition-all duration-300 pl-14 pr-6 shadow-sm"
        />
        <button
          type="submit"
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full
                   text-gray-400 hover:text-gray-600 transition-colors duration-300
                   focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <MagnifyingGlassIcon className="h-6 w-6" />
        </button>
      </div>
    </form>
  );
} 