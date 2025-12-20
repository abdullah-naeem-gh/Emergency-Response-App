import * as Location from 'expo-location';

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
  icon?: string;
}

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon?: string;
  precipitation: number;
  windSpeed: number;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  startTime: number;
  endTime: number;
  type: 'rain' | 'wind' | 'temperature' | 'flood' | 'other';
}

/**
 * Mock Weather Service
 * In production, this would integrate with a real weather API (OpenWeatherMap, WeatherAPI, etc.)
 */
class WeatherService {
  /**
   * Get current weather for a location
   */
  async getCurrentWeather(
    latitude?: number,
    longitude?: number
  ): Promise<WeatherData> {
    // In production, fetch from API
    // For now, return mock data
    return {
      temperature: 28,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      windDirection: 180,
      pressure: 1013,
      visibility: 10,
      uvIndex: 6,
      feelsLike: 30,
      icon: 'partly-cloudy',
    };
  }

  /**
   * Get 7-day forecast
   */
  async getForecast(
    latitude?: number,
    longitude?: number
  ): Promise<ForecastDay[]> {
    // In production, fetch from API
    const forecast: ForecastDay[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      forecast.push({
        date: date.toISOString().split('T')[0],
        high: 30 + Math.floor(Math.random() * 5),
        low: 20 + Math.floor(Math.random() * 5),
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][
          Math.floor(Math.random() * 4)
        ],
        precipitation: Math.random() * 10,
        windSpeed: 8 + Math.random() * 8,
        icon: 'sunny',
      });
    }

    return forecast;
  }

  /**
   * Get weather alerts for a location
   */
  async getWeatherAlerts(
    latitude?: number,
    longitude?: number
  ): Promise<WeatherAlert[]> {
    // In production, fetch from API or NDMA
    return [
      {
        id: '1',
        title: 'Heavy Rainfall Warning',
        description:
          'Heavy rainfall expected in the next 24 hours. Stay indoors and avoid unnecessary travel.',
        severity: 'high',
        startTime: Date.now(),
        endTime: Date.now() + 86400000,
        type: 'rain',
      },
      {
        id: '2',
        title: 'High Temperature Alert',
        description: 'Temperatures expected to reach 35°C. Stay hydrated and avoid direct sunlight.',
        severity: 'moderate',
        startTime: Date.now(),
        endTime: Date.now() + 43200000,
        type: 'temperature',
      },
    ];
  }

  /**
   * Get user's current location and fetch weather
   */
  async getWeatherForCurrentLocation(): Promise<{
    weather: WeatherData;
    forecast: ForecastDay[];
    alerts: WeatherAlert[];
    location: { latitude: number; longitude: number };
  }> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      const [weather, forecast, alerts] = await Promise.all([
        this.getCurrentWeather(latitude, longitude),
        this.getForecast(latitude, longitude),
        this.getWeatherAlerts(latitude, longitude),
      ]);

      return {
        weather,
        forecast,
        alerts,
        location: { latitude, longitude },
      };
    } catch (error) {
      console.error('Error getting weather for current location:', error);
      // Return default data if location fails
      const [weather, forecast, alerts] = await Promise.all([
        this.getCurrentWeather(),
        this.getForecast(),
        this.getWeatherAlerts(),
      ]);

      return {
        weather,
        forecast,
        alerts,
        location: { latitude: 24.8607, longitude: 67.0011 }, // Karachi default
      };
    }
  }
}

export const weatherService = new WeatherService();

