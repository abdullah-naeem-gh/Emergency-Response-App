import { EnhancedTask, TeamMessage, volunteerService } from '@/services/VolunteerService';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import {
  CheckCircle,
  List,
  MapPin,
  MessageCircle,
  Navigation,
  PlayCircle,
  Send,
  X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { RescueTask, tasksData } from '../../src/data/tasksData';
import { useAppStore } from '../../store/useAppStore';

type ViewMode = 'map' | 'list';

interface SelectedTask {
  id: string;
  type: RescueTask['type'];
  coords: { lat: number; long: number };
  urgency: RescueTask['urgency'];
  distance: number;
  status?: string;
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

type TaskViewMode = 'open' | 'my_tasks';

export default function VolunteerScreen() {
  const { volunteerTasksDone, volunteerLevel, incrementVolunteerTasks } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [taskViewMode, setTaskViewMode] = useState<TaskViewMode>('open');
  const [selectedTask, setSelectedTask] = useState<SelectedTask | null>(null);
  const [myTasks, setMyTasks] = useState<EnhancedTask[]>([]);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showTeamChat, setShowTeamChat] = useState(false);
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; estimatedTime: number } | null>(null);

  const loadMyTasks = useCallback(async () => {
    const tasks = await volunteerService.getUserTasks('current-user');
    setMyTasks(tasks);
  }, []);

  const loadTeamMessages = useCallback(async () => {
    if (!selectedTask) return;
    const messages = await volunteerService.getTeamMessages(selectedTask.id);
    setTeamMessages(messages);
  }, [selectedTask]);

  const loadRouteInfo = useCallback(async () => {
    if (!selectedTask || !userLocation) return;
    const route = await volunteerService.getNavigationRoute(
      userLocation.lat,
      userLocation.long,
      selectedTask.coords.lat,
      selectedTask.coords.long
    );
    setRouteInfo(route);
  }, [selectedTask, userLocation]);

  useEffect(() => {
    loadMyTasks();
  }, [loadMyTasks]);

  useEffect(() => {
    if (showTeamChat) {
      loadTeamMessages();
    }
  }, [showTeamChat, loadTeamMessages]);

  useEffect(() => {
    if (selectedTask && userLocation) {
      loadRouteInfo();
    }
  }, [selectedTask, userLocation, loadRouteInfo]);

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
    
    const enhancedTask = await volunteerService.acceptTask(selectedTask.id, 'current-user');
    if (enhancedTask) {
      incrementVolunteerTasks();
      await loadMyTasks();
      Alert.alert(
        'Task Accepted!',
        `You've accepted the ${getTaskTypeName(selectedTask.type)} task. Thank you for helping!`,
        [{ text: 'OK', onPress: () => {
          setSelectedTask(null);
          setTaskViewMode('my_tasks');
        }}]
      );
    }
  };

  const handleUpdateTaskStatus = async (newStatus: 'IN_PROGRESS' | 'COMPLETED') => {
    if (!selectedTask) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await volunteerService.updateTaskStatus(selectedTask.id, newStatus, taskNotes);
    await loadMyTasks();
    setShowTaskDetails(false);
    setTaskNotes('');
    if (newStatus === 'COMPLETED') {
      incrementVolunteerTasks();
      Alert.alert('Success', 'Task marked as completed!');
    }
  };

  const handleOpenNavigation = async () => {
    if (!selectedTask || !userLocation) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.long}/${selectedTask.coords.lat},${selectedTask.coords.long}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Could not open navigation app');
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim() || !selectedTask) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await volunteerService.sendTeamMessage({
      userId: 'current-user',
      userName: 'You',
      message: chatMessage,
      taskId: selectedTask.id,
      type: 'message',
    });
    setChatMessage('');
    await loadTeamMessages();
  };

  const toggleViewMode = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setViewMode((prev) => (prev === 'map' ? 'list' : 'map'));
    setSelectedTask(null); // Close bottom sheet when switching views
  };


  const displayTasks = useMemo(() => {
    if (taskViewMode === 'open') {
      return tasksWithDistance;
    }
    return myTasks.map((t) => ({
      id: t.id,
      type: t.type,
      coords: t.coords,
      urgency: t.urgency,
      distance: userLocation
        ? calculateDistance(userLocation.lat, userLocation.long, t.coords.lat, t.coords.long)
        : 0,
      status: t.status,
    }));
  }, [taskViewMode, tasksWithDistance, myTasks, userLocation]);

  const renderBottomSheet = () => {
    if (!selectedTask) return null;

    const isMyTask = myTasks.some((t) => t.id === selectedTask.id);
    const currentTask = myTasks.find((t) => t.id === selectedTask.id);

    return (
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHandle} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.bottomSheetTitle}>
            Task: {getTaskTypeName(selectedTask.type)}
          </Text>
          <Text style={styles.bottomSheetDistance}>
            Distance: {selectedTask.distance > 0 ? `${selectedTask.distance}km` : 'Unknown'}
          </Text>
          {routeInfo && (
            <Text style={styles.bottomSheetDistance}>
              ETA: {Math.round(routeInfo.estimatedTime)} minutes
            </Text>
          )}
          <Text style={styles.bottomSheetUrgency}>
            Urgency: {selectedTask.urgency === 'HIGH' ? 'High' : 'Medium'}
          </Text>

          {isMyTask && currentTask && (
            <>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  Status: {currentTask.status.replace('_', ' ')}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                {currentTask.status === 'ACCEPTED' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
                    onPress={() => handleUpdateTaskStatus('IN_PROGRESS')}
                    activeOpacity={0.8}>
                    <PlayCircle size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Start Task</Text>
                  </TouchableOpacity>
                )}
                {currentTask.status === 'IN_PROGRESS' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#32D74B' }]}
                    onPress={() => setShowTaskDetails(true)}
                    activeOpacity={0.8}>
                    <CheckCircle size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Complete Task</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#5856D6' }]}
                  onPress={handleOpenNavigation}
                  activeOpacity={0.8}>
                  <Navigation size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Navigate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
                  onPress={() => setShowTeamChat(true)}
                  activeOpacity={0.8}>
                  <MessageCircle size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Team Chat</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {!isMyTask && (
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAcceptTask}
              activeOpacity={0.8}>
              <Text style={styles.acceptButtonText}>Accept Task</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Volunteer Stats Pill */}
      <View style={[styles.statsPill, { top: 8 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.statsText}>
            Tasks Done: {volunteerTasksDone} | Level: {volunteerLevel}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setTaskViewMode('open');
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: taskViewMode === 'open' ? '#007AFF' : 'transparent',
              }}>
              <Text style={[styles.statsText, { fontSize: 12, color: taskViewMode === 'open' ? '#FFFFFF' : '#000000' }]}>
                Open
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setTaskViewMode('my_tasks');
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: taskViewMode === 'my_tasks' ? '#007AFF' : 'transparent',
              }}>
              <Text style={[styles.statsText, { fontSize: 12, color: taskViewMode === 'my_tasks' ? '#FFFFFF' : '#000000' }]}>
                My Tasks ({myTasks.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Map or List View */}
      {viewMode === 'map' ? (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={locationPermission}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          provider={PROVIDER_GOOGLE}>
          {displayTasks.map((task) => (
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
          {selectedTask && userLocation && routeInfo && (
            <Polyline
              coordinates={[
                { latitude: userLocation.lat, longitude: userLocation.long },
                { latitude: selectedTask.coords.lat, longitude: selectedTask.coords.long },
              ]}
              strokeColor="#007AFF"
              strokeWidth={3}
            />
          )}
        </MapView>
      ) : (
        <FlatList
          data={displayTasks.sort((a, b) => a.distance - b.distance)}
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
                {item.status && (
                  <Text style={styles.listItemStatus}>
                    Status: {item.status.replace('_', ' ')}
                  </Text>
                )}
                <Text style={styles.listItemUrgency}>
                  {item.urgency === 'HIGH' ? '🔴 High Urgency' : '🟡 Medium Urgency'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

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

      {/* Task Details Modal */}
      <Modal
        visible={showTaskDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTaskDetails(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Task</Text>
              <TouchableOpacity onPress={() => setShowTaskDetails(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Add completion notes..."
              placeholderTextColor="#8E8E93"
              value={taskNotes}
              onChangeText={setTaskNotes}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleUpdateTaskStatus('COMPLETED')}
              activeOpacity={0.8}>
              <Text style={styles.completeButtonText}>Mark as Completed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Team Chat Modal */}
      <Modal
        visible={showTeamChat}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTeamChat(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Team Chat</Text>
              <TouchableOpacity onPress={() => setShowTeamChat(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.chatContainer}>
              {teamMessages.slice().reverse().map((msg) => (
                <View key={msg.id} style={styles.chatMessage}>
                  <Text style={styles.chatUserName}>{msg.userName}</Text>
                  <Text style={styles.chatMessageText}>{msg.message}</Text>
                  <Text style={styles.chatTime}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message..."
                placeholderTextColor="#8E8E93"
                value={chatMessage}
                onChangeText={setChatMessage}
                onSubmitEditing={handleSendChatMessage}
              />
              <TouchableOpacity
                onPress={handleSendChatMessage}
                disabled={!chatMessage.trim()}
                style={[styles.sendButton, !chatMessage.trim() && { opacity: 0.5 }]}>
                <Send size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  map: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    minHeight: 50,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#5856D6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  completeButton: {
    backgroundColor: '#32D74B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 60,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  chatContainer: {
    maxHeight: 400,
    marginBottom: 16,
  },
  chatMessage: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  chatUserName: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  chatMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  chatTime: {
    color: '#8E8E93',
    fontSize: 12,
  },
  chatInputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
  listItemStatus: {
    fontSize: 12,
    color: '#5856D6',
    marginTop: 4,
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
