'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeatherDisplayProps {
  location: string;
}

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{ description: string; icon: string }>;
  dt: number;
}

interface ForecastData {
  list: Array<WeatherData>;
}

interface GeoResponse {
  lat: number;
  lon: number;
}

interface TooltipContext {
  parsed: {
    y: number;
  };
}

export default function WeatherDisplay({ location }: WeatherDisplayProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        if (!API_KEY) {
          throw new Error('API key is missing. Please check your .env.local file.');
        }

        setLoading(true);
        setError('');

        // Get coordinates first
        const geoResponse = await axios.get<GeoResponse[]>(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
            location
          )}&limit=1&appid=${API_KEY}`
        );

        if (!geoResponse.data.length) {
          throw new Error('Location not found');
        }

        const { lat, lon } = geoResponse.data[0];

        // Get current weather
        const weatherResponse = await axios.get<WeatherData>(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        // Get 5-day forecast with 3-hour intervals
        const forecastResponse = await axios.get<ForecastData>(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        setWeatherData(weatherResponse.data);
        setForecastData(forecastResponse.data);
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number }; message?: string };
        if (axiosError.response?.status === 401) {
          setError('Invalid API key. Please check your .env.local file.');
        } else if (axiosError.response?.status === 404) {
          setError('Location not found. Please try another location.');
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to fetch weather data. Please try again.');
        }
        console.error('Error fetching weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchWeatherData();
    }
  }, [location, API_KEY]);

  const createChartData = (data: WeatherData[], title: string, colors: { border: string; background: string }) => ({
    labels: data.map((item) => format(new Date(item.dt * 1000), 'MMM d HH:mm')),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: data.map((item) => item.main.temp),
        borderColor: colors.border,
        backgroundColor: colors.background,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: colors.border,
        pointBorderColor: colors.border,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors.border,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
      },
    ],
  });

  const chartOptions = (title: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: 'rgba(31, 41, 55, 0.9)',
        font: {
          size: 16,
          family: 'system-ui',
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: 'rgba(31, 41, 55, 0.9)',
        bodyColor: 'rgba(31, 41, 55, 0.9)',
        padding: 12,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function(context: TooltipContext) {
            return `Temperature: ${context.parsed.y.toFixed(1)}°C`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(31, 41, 55, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(31, 41, 55, 0.8)',
          font: {
            size: 11,
            family: 'system-ui',
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: 'linear' as const,
        grid: {
          color: 'rgba(31, 41, 55, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(31, 41, 55, 0.8)',
          font: {
            size: 11,
            family: 'system-ui',
          },
          callback: function(tickValue: number | string) {
            return typeof tickValue === 'number' ? tickValue + '°C' : tickValue;
          }
        },
        beginAtZero: false,
      },
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 backdrop-blur-md rounded-lg p-6 text-center text-red-500 border border-red-200">
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  if (!weatherData || !forecastData) {
    return null;
  }

  // Get past data points (first half of the forecast data)
  const pastData = [weatherData, ...forecastData.list.slice(0, 7)];
  
  // Get future data points (second half of the forecast data)
  const futureData = forecastData.list.slice(-8);

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          Current Weather in {location}
        </h2>
        <div className="flex items-center gap-4 bg-white/80 rounded-lg p-4 shadow-sm">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-blue-50 rounded-full blur-xl"></div>
            <Image
              src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
              alt={weatherData.weather[0].description}
              className="relative z-10"
              width={96}
              height={96}
              priority
            />
          </div>
          <div>
            <p className="text-6xl font-bold text-gray-800 mb-2">
              {Math.round(weatherData.main.temp)}°C
            </p>
            <p className="text-xl text-gray-600 capitalize">
              {weatherData.weather[0].description}
            </p>
            <div className="flex gap-4 mt-2 text-gray-500">
              <p>H: {Math.round(weatherData.main.temp_max)}°C</p>
              <p>L: {Math.round(weatherData.main.temp_min)}°C</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[300px] bg-white/80 rounded-lg p-6 shadow-sm">
          <Line 
            options={chartOptions('Recent Temperature Trend')} 
            data={createChartData(
              pastData,
              'Recent',
              { 
                border: 'rgba(59, 130, 246, 0.8)',
                background: 'rgba(59, 130, 246, 0.1)'
              }
            )} 
          />
        </div>
        <div className="h-[300px] bg-white/80 rounded-lg p-6 shadow-sm">
          <Line 
            options={chartOptions('Temperature Forecast')} 
            data={createChartData(
              futureData,
              'Forecast',
              {
                border: 'rgba(244, 63, 94, 0.8)',
                background: 'rgba(244, 63, 94, 0.1)'
              }
            )} 
          />
        </div>
      </div>
    </div>
  );
} 