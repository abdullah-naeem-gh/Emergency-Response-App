import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { List, MapPin } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RescueTask, tasksData } from '../../src/data/tasksData';
import { useAppStore } from '../../store/useAppStore';

type ViewMode = 'map' | 'list';

interface SelectedTask extends RescueTask {
  distance: number;
}

// Helper function to calculate distance between two coordinates (Haversine approximation)
const calculateDistance = (
  lat1: number,
  long1: number,
  lat2: number,
  long2: number
): number => {
  const latDiff = lat2 - lat1;
  const longDiff = long2 - long1;
  // Rough approximation: 1 degree ≈ 111km
  const distanceKm = Math.sqrt(latDiff * latDiff + longDiff * longDiff) * 111;
  return Math.round(distanceKm * 10) / 10; // Round to 1 decimal place
};

// Get marker color based on task type
const getMarkerColor = (type: RescueTask['type']): string => {
  switch (type) {
    case 'MEDICAL_EVAC':
      return '#FF3B30'; // Red
    case 'FOOD_DROP':
      return '#32D74B'; // Green
    case 'SANDBAG_DUTY':
      return '#FF9500'; // Orange
    default:
      return '#8E8E93'; // Gray
  }
};

// Get task type display name
const getTaskTypeName = (type: RescueTask['type']): string => {
  switch (type) {
    case 'MEDICAL_EVAC':
      return 'Medical Evacuation';
    case 'FOOD_DROP':
      return 'Food Drop';
    case 'SANDBAG_DUTY':
      return 'Sandbag Duty';
    default:
      return 'Task';
  }
};

export default function VolunteerScreen() {
  const { volunteerTasksDone, volunteerLevel, incrementVolunteerTasks } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedTask, setSelectedTask] = useState<SelectedTask | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Get open tasks only
  const openTasks = useMemo(() => {
    return tasksData.filter((task) => task.status === 'OPEN');
  }, []);

  // Calculate distances for all tasks
  const tasksWithDistance = useMemo(() => {
    if (!userLocation) return openTasks.map((task) => ({ ...task, distance: 0 }));
    
    return openTasks.map((task) => ({
      ...task,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.long,
        task.coords.lat,
        task.coords.long
      ),
    }));
  }, [openTasks, userLocation]);

  // Request location permission and get current location
  useEffect(() => {
    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermission(true);
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            lat: location.coords.latitude,
            long: location.coords.longitude,
          });
        } else {
          // Default to Karachi center if permission denied
          setUserLocation({ lat: 24.8607, long: 67.0011 });
        }
      } catch (error) {
        console.error('Error getting location:', error);
        // Default to Karachi center on error
        setUserLocation({ lat: 24.8607, long: 67.0011 });
      }
    };

    requestLocation();
  }, []);

  // Get initial region for map
  const initialRegion = useMemo(() => {
    if (userLocation) {
      return {
        latitude: userLocation.lat,
        longitude: userLocation.long,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    // Default to Karachi
    return {
      latitude: 24.8607,
      longitude: 67.0011,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [userLocation]);

  const handleMarkerPress = (task: SelectedTask) => {
    Haptics.selectionAsync();
    setSelectedTask(task);
  };

  const handleAcceptTask = async () => {
    if (!selectedTask) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Increment volunteer tasks
    incrementVolunteerTasks();
    
    Alert.alert(
      'Task Accepted!',
      `You've accepted the ${getTaskTypeName(selectedTask.type)} task. Thank you for helping!`,
      [{ text: 'OK', onPress: () => setSelectedTask(null) }]
    );
  };

  const toggleViewMode = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setViewMode((prev) => (prev === 'map' ? 'list' : 'map'));
    setSelectedTask(null); // Close bottom sheet when switching views
  };

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
        toolbarEnabled={false}>
        {tasksWithDistance.map((task) => (
          <Marker
            key={task.id}
            coordinate={{
              latitude: task.coords.lat,
              longitude: task.coords.long,
            }}
            pinColor={getMarkerColor(task.type)}
            onPress={() => handleMarkerPress(task)}
          />
        ))}
      </MapView>
    </View>
  );

  const renderListView = () => (
    <FlatList
      data={tasksWithDistance.sort((a, b) => a.distance - b.distance)}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => handleMarkerPress(item)}
          activeOpacity={0.7}>
          <View
            style={[
              styles.taskTypeIndicator,
              { backgroundColor: getMarkerColor(item.type) },
            ]}
          />
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle}>{getTaskTypeName(item.type)}</Text>
            <Text style={styles.listItemDistance}>
              {item.distance > 0 ? `${item.distance}km away` : 'Distance unknown'}
            </Text>
            <Text style={styles.listItemUrgency}>
              {item.urgency === 'HIGH' ? '🔴 High Urgency' : '🟡 Medium Urgency'}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );

  const renderBottomSheet = () => {
    if (!selectedTask) return null;

    return (
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHandle} />
        <Text style={styles.bottomSheetTitle}>
          Task: {getTaskTypeName(selectedTask.type)}
        </Text>
        <Text style={styles.bottomSheetDistance}>
          Distance: {selectedTask.distance > 0 ? `${selectedTask.distance}km` : 'Unknown'}
        </Text>
        <Text style={styles.bottomSheetUrgency}>
          Urgency: {selectedTask.urgency === 'HIGH' ? 'High' : 'Medium'}
        </Text>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAcceptTask}
          activeOpacity={0.8}>
          <Text style={styles.acceptButtonText}>Accept Task</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Volunteer Stats Pill */}
      <View style={styles.statsPill}>
        <Text style={styles.statsText}>
          Tasks Done: {volunteerTasksDone} | Level: {volunteerLevel}
        </Text>
      </View>

      {/* Map or List View */}
      {viewMode === 'map' ? renderMapView() : renderListView()}

      {/* Bottom Sheet Overlay */}
      {viewMode === 'map' && renderBottomSheet()}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleViewMode}
        activeOpacity={0.8}>
        {viewMode === 'map' ? (
          <List size={24} color="#FFFFFF" />
        ) : (
          <MapPin size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  statsPill: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingTop: 80, // Space for stats pill
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    alignItems: 'center',
  },
  taskTypeIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  listItemDistance: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  listItemUrgency: {
    fontSize: 12,
    color: '#FF9500',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#8E8E93',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bottomSheetDistance: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  bottomSheetUrgency: {
    fontSize: 14,
    color: '#FF9500',
    marginBottom: 20,
  },
  acceptButton: {
    backgroundColor: '#32D74B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 60,
  },
  acceptButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
});
