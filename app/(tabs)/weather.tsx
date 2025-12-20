import { ForecastDay, WeatherAlert, WeatherData, weatherService } from '@/services/WeatherService';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, Cloud, Droplet, Eye, Gauge, MapPin, RefreshCw, Sun, Thermometer, Wind } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'extreme':
      return '#DC2626';
    case 'high':
      return '#F59E0B';
    case 'moderate':
      return '#FBBF24';
    case 'low':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase();
  if (lower.includes('sun') || lower.includes('clear')) return Sun;
  if (lower.includes('cloud')) return Cloud;
  if (lower.includes('rain')) return Droplet;
  return Cloud;
};

interface WeatherCardProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  value: string;
  unit?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ icon: Icon, label, value, unit }) => (
  <View
    className="bg-white rounded-2xl p-4 items-center"
    style={{
      width: (width - 72) / 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}
  >
    <Icon size={24} color="#3B82F6" />
    <Text className="text-gray-500 text-xs mt-2 mb-1">{label}</Text>
    <View className="flex-row items-baseline">
      <Text className="text-gray-900 text-xl font-bold">{value}</Text>
      {unit && <Text className="text-gray-500 text-sm ml-1">{unit}</Text>}
    </View>
  </View>
);

export default function WeatherScreen() {
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      setLoading(true);
      const data = await weatherService.getWeatherForCurrentLocation();
      setWeather(data.weather);
      setForecast(data.forecast);
      setAlerts(data.alerts);
      setLocation(data.location);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadWeather();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!weather) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-gray-500 text-lg mb-4">Failed to load weather data</Text>
        <Pressable
          onPress={loadWeather}
          className="bg-blue-500 rounded-xl px-6 py-3"
          style={{ minHeight: 50 }}
        >
          <Text className="text-white font-bold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.condition);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pb-6 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Pressable
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              className="mr-3"
              style={{
                minHeight: 44,
                minWidth: 44,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={24} color="#374151" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-4xl font-bold text-gray-900 mb-2">Weather</Text>
              {location && (
                <View className="flex-row items-center">
                  <MapPin size={16} color="#6B7280" />
                  <Text className="text-gray-600 text-sm ml-1">
                    {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Pressable
            onPress={handleRefresh}
            className="bg-white rounded-full p-3"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <RefreshCw size={20} color="#3B82F6" />
          </Pressable>
        </View>

        {/* Current Weather */}
        <View className="px-6 mb-6">
          <View className="bg-blue-500 rounded-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-white text-sm opacity-90 mb-1">Today</Text>
                <Text className="text-white text-5xl font-bold">
                  {Math.round(weather.temperature)}°
                </Text>
                <Text className="text-white text-xl opacity-90 mt-1">
                  {weather.condition}
                </Text>
              </View>
              <WeatherIcon size={80} color="white" />
            </View>
            <View className="flex-row items-center mt-4">
              <Text className="text-white opacity-90">
                Feels like {Math.round(weather.feelsLike)}°
              </Text>
            </View>
          </View>
        </View>

        {/* Weather Metrics Grid */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Details</Text>
          <View className="flex-row flex-wrap justify-between gap-4">
            <WeatherCard
              icon={Droplet}
              label="Humidity"
              value={weather.humidity.toString()}
              unit="%"
            />
            <WeatherCard
              icon={Wind}
              label="Wind Speed"
              value={weather.windSpeed.toString()}
              unit="km/h"
            />
            <WeatherCard
              icon={Gauge}
              label="Pressure"
              value={weather.pressure.toString()}
              unit="hPa"
            />
            <WeatherCard
              icon={Eye}
              label="Visibility"
              value={weather.visibility.toString()}
              unit="km"
            />
            <WeatherCard
              icon={Sun}
              label="UV Index"
              value={weather.uvIndex.toString()}
            />
            <WeatherCard
              icon={Thermometer}
              label="Feels Like"
              value={Math.round(weather.feelsLike).toString()}
              unit="°"
            />
          </View>
        </View>

        {/* Weather Alerts */}
        {alerts.length > 0 && (
          <View className="px-6 mb-6">
            <View className="flex-row items-center mb-4">
              <AlertCircle size={20} color="#F59E0B" />
              <Text className="text-xl font-bold text-gray-900 ml-2">Alerts</Text>
            </View>
            {alerts.map((alert) => (
              <View
                key={alert.id}
                className="bg-white rounded-2xl p-4 mb-3"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: getSeverityColor(alert.severity),
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View className="flex-row items-center mb-2">
                  <View
                    className="px-3 py-1 rounded-full mr-2"
                    style={{
                      backgroundColor: getSeverityColor(alert.severity) + '20',
                    }}
                  >
                    <Text
                      className="text-xs font-bold capitalize"
                      style={{ color: getSeverityColor(alert.severity) }}
                    >
                      {alert.severity}
                    </Text>
                  </View>
                  <Text
                    className="text-xs font-semibold capitalize"
                    style={{ color: getSeverityColor(alert.severity) }}
                  >
                    {alert.type}
                  </Text>
                </View>
                <Text className="text-gray-900 text-lg font-semibold mb-1">
                  {alert.title}
                </Text>
                <Text className="text-gray-600 text-sm leading-5">
                  {alert.description}
                </Text>
                <Text className="text-gray-400 text-xs mt-2">
                  {new Date(alert.startTime).toLocaleString()} -{' '}
                  {new Date(alert.endTime).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 7-Day Forecast */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">7-Day Forecast</Text>
          {forecast.map((day, index) => {
            const DayIcon = getWeatherIcon(day.condition);
            const date = new Date(day.date);
            const dayName =
              index === 0
                ? 'Today'
                : date.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <View
                key={day.date}
                className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold mb-1">{dayName}</Text>
                  <Text className="text-gray-500 text-xs">
                    {date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <View className="flex-row items-center flex-1 justify-center">
                  <DayIcon size={32} color="#3B82F6" />
                  <Text className="text-gray-600 text-sm ml-3">{day.condition}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-gray-900 font-bold text-lg">
                    {Math.round(day.high)}°
                  </Text>
                  <Text className="text-gray-500 text-sm">{Math.round(day.low)}°</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

