import { EvacuationRoute, evacuationService, ShelterLocation } from '@/services/EvacuationService';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

const getStatusColor = (status: EvacuationRoute['status']): string => {
  switch (status) {
    case 'safe':
      return '#10B981';
    case 'moderate':
      return '#F59E0B';
    case 'unsafe':
      return '#EF4444';
    case 'blocked':
      return '#DC2626';
    default:
      return '#6B7280';
  }
};

const getShelterTypeColor = (type: ShelterLocation['type']): string => {
  switch (type) {
    case 'shelter':
      return '#3B82F6';
    case 'hospital':
      return '#EF4444';
    case 'safe_zone':
      return '#10B981';
    case 'evacuation_center':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
};

const getShelterTypeIcon = (type: ShelterLocation['type']) => {
  switch (type) {
    case 'hospital':
      return '🏥';
    case 'safe_zone':
      return '🛡️';
    case 'evacuation_center':
      return '📍';
    default:
      return '🏠';
  }
};

export default function EvacuationScreen() {
  const router = useRouter();
  const [shelters, setShelters] = useState<ShelterLocation[]>([]);
  const [routes, setRoutes] = useState<EvacuationRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShelter, setSelectedShelter] = useState<ShelterLocation | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<EvacuationRoute | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await evacuationService.getSheltersForCurrentLocation();
      setShelters(data.shelters);
      setUserLocation(data.userLocation);
      
      if (data.userLocation) {
        setMapRegion({
          latitude: data.userLocation.latitude,
          longitude: data.userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error('Error loading evacuation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShelterSelect = async (shelter: ShelterLocation) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedShelter(shelter);
    
    if (userLocation) {
      const evacuationRoutes = await evacuationService.getEvacuationRoutes(
        userLocation.latitude,
        userLocation.longitude,
        shelter.location.latitude,
        shelter.location.longitude
      );
      setRoutes(evacuationRoutes);
    }
  };

  const handleRouteSelect = (route: EvacuationRoute) => {
    Haptics.selectionAsync();
    setSelectedRoute(route);
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
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
              <Text className="text-4xl font-bold text-gray-900 mb-1">Evacuation</Text>
              <Text className="text-gray-600 text-sm">{shelters.length} shelters nearby</Text>
            </View>
          </View>
          <Pressable
            onPress={loadData}
            className="bg-gray-100 rounded-full p-3"
            style={{
              minHeight: 44,
              minWidth: 44,
            }}
          >
            <RefreshCw size={20} color="#374151" />
          </Pressable>
        </View>
      </View>

      {/* Map View */}
      <View className="flex-1">
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={!!userLocation}
          showsMyLocationButton={false}
        >
          {/* User Location Circle */}
          {userLocation && (
            <Circle
              center={userLocation}
              radius={500}
              fillColor="rgba(59, 130, 246, 0.1)"
              strokeColor="#3B82F6"
              strokeWidth={2}
            />
          )}

          {/* Shelter Markers */}
          {shelters.map((shelter) => (
            <Marker
              key={shelter.id}
              coordinate={shelter.location}
              onPress={() => handleShelterSelect(shelter)}
            >
              <View className="items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center border-2 border-white"
                  style={{
                    backgroundColor: getShelterTypeColor(shelter.type),
                  }}
                >
                  <Text className="text-2xl">{getShelterTypeIcon(shelter.type)}</Text>
                </View>
                <Text className="text-xs font-semibold text-gray-900 mt-1 bg-white px-2 py-0.5 rounded">
                  {shelter.name}
                </Text>
              </View>
            </Marker>
          ))}

          {/* Selected Route */}
          {selectedRoute && userLocation && selectedShelter && (
            <Polyline
              coordinates={[
                userLocation,
                ...(selectedRoute.waypoints || []),
                selectedShelter.location,
              ]}
              strokeColor={getStatusColor(selectedRoute.status)}
              strokeWidth={4}
            />
          )}
        </MapView>

        {/* Shelter List Bottom Sheet */}
        {selectedShelter && (
          <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-gray-200 max-h-[60%]">
            <View className="px-6 py-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-gray-900">{selectedShelter.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <View
                      className="px-2 py-1 rounded-full mr-2"
                      style={{
                        backgroundColor: getShelterTypeColor(selectedShelter.type) + '20',
                      }}
                    >
                      <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: getShelterTypeColor(selectedShelter.type) }}
                      >
                        {selectedShelter.type.replace('_', ' ')}
                      </Text>
                    </View>
                    {selectedShelter.distance && (
                      <Text className="text-gray-600 text-sm">
                        {formatDistance(selectedShelter.distance)} away
                      </Text>
                    )}
                  </View>
                </View>
                <Pressable
                  onPress={() => setSelectedShelter(null)}
                  className="bg-gray-100 rounded-full p-2"
                  style={{ minHeight: 44, minWidth: 44 }}
                >
                  <Text className="text-gray-600 font-bold">✕</Text>
                </Pressable>
              </View>

              {/* Capacity Info */}
              {selectedShelter.capacity && (
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <Text className="text-sm font-semibold text-gray-900 mb-2">Capacity</Text>
                  <View className="flex-row items-center">
                    <View className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <View
                        className="bg-blue-500 h-full rounded-full"
                        style={{
                          width: `${((selectedShelter.currentOccupancy || 0) / selectedShelter.capacity) * 100}%`,
                        }}
                      />
                    </View>
                    <Text className="text-sm font-semibold text-gray-700">
                      {selectedShelter.currentOccupancy || 0}/{selectedShelter.capacity}
                    </Text>
                  </View>
                </View>
              )}

              {/* Facilities */}
              {selectedShelter.facilities.length > 0 && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-900 mb-2">Facilities</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {selectedShelter.facilities.map((facility, index) => (
                      <View
                        key={index}
                        className="bg-blue-50 px-3 py-1 rounded-full"
                      >
                        <Text className="text-xs font-medium text-blue-700">{facility}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Routes */}
              {routes.length > 0 && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-900 mb-3">Evacuation Routes</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                    {routes.map((route) => (
                      <TouchableOpacity
                        key={route.id}
                        onPress={() => handleRouteSelect(route)}
                        className={`bg-white rounded-xl p-4 border-2 ${
                          selectedRoute?.id === route.id ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        style={{ width: 200, minHeight: 120 }}
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-base font-semibold text-gray-900">{route.name}</Text>
                          <View
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getStatusColor(route.status) }}
                          />
                        </View>
                        <Text className="text-gray-600 text-sm mb-1">
                          {formatDistance(route.distance)} • {formatTime(route.estimatedTime)}
                        </Text>
                        <View className="flex-row items-center">
                          <Text
                            className="text-xs font-semibold capitalize"
                            style={{ color: getStatusColor(route.status) }}
                          >
                            {route.status}
                          </Text>
                          {route.obstacles && route.obstacles.length > 0 && (
                            <>
                              <Text className="text-gray-400 text-xs mx-2">•</Text>
                              <AlertTriangle size={12} color="#F59E0B" />
                              <Text className="text-xs text-gray-600 ml-1">
                                {route.obstacles.length} obstacle{route.obstacles.length > 1 ? 's' : ''}
                              </Text>
                            </>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Contact */}
              {selectedShelter.contact && (
                <TouchableOpacity
                  className="bg-blue-500 rounded-xl py-4 items-center"
                  style={{ minHeight: 60 }}
                >
                  <Text className="text-white font-bold text-lg">Call Shelter</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Shelter List (when no shelter selected) */}
        {!selectedShelter && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="absolute bottom-4 left-0 right-0 px-4"
            contentContainerStyle={{ gap: 12, paddingRight: 24 }}
          >
            {shelters.map((shelter) => (
              <TouchableOpacity
                key={shelter.id}
                onPress={() => handleShelterSelect(shelter)}
                className="bg-white rounded-xl p-4 border border-gray-200"
                style={{
                  width: 280,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View className="flex-row items-center mb-2">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{
                      backgroundColor: getShelterTypeColor(shelter.type) + '20',
                    }}
                  >
                    <Text className="text-xl">{getShelterTypeIcon(shelter.type)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                      {shelter.name}
                    </Text>
                    {shelter.distance && (
                      <Text className="text-gray-600 text-xs">
                        {formatDistance(shelter.distance)} away
                      </Text>
                    )}
                  </View>
                </View>
                {shelter.capacity && (
                  <View className="flex-row items-center">
                    <View className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
                      <View
                        className="bg-blue-500 h-full rounded-full"
                        style={{
                          width: `${((shelter.currentOccupancy || 0) / shelter.capacity) * 100}%`,
                        }}
                      />
                    </View>
                    <Text className="text-xs text-gray-600">
                      {shelter.currentOccupancy || 0}/{shelter.capacity}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

