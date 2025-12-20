import { crowdReportService, CrowdReport } from '@/services/CrowdReportService';
import { reportService } from '@/services/ReportService';
import * as Haptics from 'expo-haptics';
// Note: expo-image-picker needs to be installed: npx expo install expo-image-picker
// For now, photo feature is disabled if package is not available
let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch {
  // Package not installed
}
import * as Location from 'expo-location';
import { Camera, Image as ImageIcon, MapPin, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_MAX_HEIGHT = SCREEN_HEIGHT * 0.9;

interface EnhancedReportFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialType?: string;
}

interface IncidentCategory {
  id: string;
  label: string;
  color: string;
  icon: string;
}

const INCIDENT_CATEGORIES: IncidentCategory[] = [
  { id: 'flood', label: 'Flood', color: '#3B82F6', icon: '🌊' },
  { id: 'fire', label: 'Fire', color: '#F59E0B', icon: '🔥' },
  { id: 'medical', label: 'Medical', color: '#EF4444', icon: '🏥' },
  { id: 'earthquake', label: 'Earthquake', color: '#8B5CF6', icon: '🌍' },
  { id: 'other', label: 'Other', color: '#10B981', icon: '⚠️' },
];

const SEVERITY_OPTIONS = [
  { id: 'LOW', label: 'Low', color: '#10B981' },
  { id: 'MEDIUM', label: 'Medium', color: '#FBBF24' },
  { id: 'HIGH', label: 'High', color: '#F59E0B' },
  { id: 'CRITICAL', label: 'Critical', color: '#EF4444' },
];

export const EnhancedReportForm: React.FC<EnhancedReportFormProps> = ({
  visible,
  onClose,
  onSuccess,
  initialType,
}) => {
  const [selectedType, setSelectedType] = useState<string>(initialType || 'flood');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [affectedPeople, setAffectedPeople] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setDescription('');
      setAffectedPeople('');
      setPhoto(null);
      setSeverity('MEDIUM');
      setLocation(null);
      setSelectedType(initialType || 'flood');
    } else {
      // Set initial type when modal opens
      if (initialType) {
        setSelectedType(initialType);
      }
    }
  }, [visible, initialType]);

  const handleTypeSelect = (typeId: string) => {
    Haptics.selectionAsync();
    setSelectedType(typeId);
  };

  const handleSeveritySelect = (severityValue: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    Haptics.selectionAsync();
    setSeverity(severityValue);
  };

  const handleTakePhoto = async () => {
    if (!ImagePicker) {
      Alert.alert('Not Available', 'Image picker is not installed. Run: npx expo install expo-image-picker');
      return;
    }
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    if (!ImagePicker) {
      Alert.alert('Not Available', 'Image picker is not installed. Run: npx expo install expo-image-picker');
      return;
    }
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library permission is needed.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleGetLocation = async () => {
    try {
      setLocationLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to report your location.');
        setLocationLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Required', 'Please provide a description of the incident.');
      return;
    }

    if (!location) {
      Alert.alert('Required', 'Please get your location before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Create enhanced report
      const report: CrowdReport = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: selectedType,
        details: description,
        location,
        severity,
        affectedPeople: affectedPeople ? parseInt(affectedPeople, 10) : undefined,
        photoUrl: photo || undefined,
        verificationCount: 0,
        verified: false,
      };

      // Submit to crowd report service
      await crowdReportService.addReport(report);

      // Also submit to regular report service for offline queuing
      await reportService.sendReport({
        id: report.id,
        timestamp: report.timestamp,
        type: report.type,
        details: report.details,
        location: report.location,
      });

      // Reset form
      setDescription('');
      setAffectedPeople('');
      setPhoto(null);
      setSeverity('MEDIUM');
      setLocation(null);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Your report has been submitted successfully!');
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = INCIDENT_CATEGORIES.find((cat) => cat.id === selectedType);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Report Incident</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Incident Type */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Incident Type
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {INCIDENT_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleTypeSelect(category.id)}
                    className={`px-4 py-3 rounded-xl border-2 flex-row items-center ${
                      selectedType === category.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    style={{ minHeight: 60 }}
                  >
                    <Text className="text-2xl mr-2">{category.icon}</Text>
                    <Text
                      className={`font-semibold ${
                        selectedType === category.id
                          ? 'text-gray-900'
                          : 'text-gray-600'
                      }`}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Severity */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Severity Level
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {SEVERITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleSeveritySelect(option.id as any)}
                    className={`px-4 py-3 rounded-xl border-2 ${
                      severity === option.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    style={{
                      minHeight: 60,
                      borderColor: severity === option.id ? option.color : undefined,
                    }}
                  >
                    <Text
                      className={`font-semibold text-center ${
                        severity === option.id ? 'text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Description *
              </Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                placeholder="Describe what happened..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={{ minHeight: 100, textAlignVertical: 'top' }}
              />
            </View>

            {/* Affected People */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Number of People Affected (Optional)
              </Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                placeholder="Enter number"
                placeholderTextColor="#9CA3AF"
                value={affectedPeople}
                onChangeText={setAffectedPeople}
                keyboardType="number-pad"
                style={{ minHeight: 60 }}
              />
            </View>

            {/* Location */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Location *
              </Text>
              <TouchableOpacity
                onPress={handleGetLocation}
                disabled={locationLoading}
                className="bg-blue-50 rounded-xl px-4 py-4 flex-row items-center justify-between border border-blue-200"
                style={{ minHeight: 60 }}
              >
                <View className="flex-row items-center flex-1">
                  <MapPin size={20} color="#3B82F6" />
                  <Text className="text-gray-900 font-medium ml-3 flex-1">
                    {location
                      ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                      : 'Get Current Location'}
                  </Text>
                </View>
                {locationLoading && (
                  <View className="ml-2">
                    <Text className="text-blue-600">Loading...</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Photo */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Photo (Optional)
              </Text>
              {photo ? (
                <View className="relative">
                  <Image
                    source={{ uri: photo }}
                    className="w-full h-48 rounded-xl"
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => setPhoto(null)}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
                  >
                    <X size={20} color="white" />
                  </Pressable>
                </View>
              ) : (
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleTakePhoto}
                    className="flex-1 bg-gray-50 rounded-xl px-4 py-4 items-center justify-center border border-gray-200"
                    style={{ minHeight: 60 }}
                  >
                    <Camera size={24} color="#6B7280" />
                    <Text className="text-gray-700 font-medium mt-2">Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePickImage}
                    className="flex-1 bg-gray-50 rounded-xl px-4 py-4 items-center justify-center border border-gray-200"
                    style={{ minHeight: 60 }}
                  >
                    <ImageIcon size={24} color="#6B7280" />
                    <Text className="text-gray-700 font-medium mt-2">Choose Photo</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || !description.trim() || !location}
              className={`rounded-xl py-4 items-center justify-center mb-6 ${
                isSubmitting || !description.trim() || !location
                  ? 'bg-gray-300'
                  : 'bg-red-500'
              }`}
              style={{ minHeight: 60 }}
            >
              <Text className="text-white font-bold text-lg">
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: MODAL_MAX_HEIGHT,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
});

