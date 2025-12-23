import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useTranslation } from '@/hooks/useTranslation';
import { useTextInputStyles } from '@/utils/i18n';
import { crowdReportService, CrowdReport } from '@/services/CrowdReportService';
import { PredictiveService } from '@/services/PredictiveService';
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

// These will be translated in the component
const INCIDENT_CATEGORIES_IDS = ['flood', 'fire', 'medical', 'earthquake', 'other'] as const;
const SEVERITY_OPTIONS_IDS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const EnhancedReportForm: React.FC<EnhancedReportFormProps> = ({
  visible,
  onClose,
  onSuccess,
  initialType,
}) => {
  const { themeColors } = useAccessibility();
  const { t } = useTranslation();
  const textInputStyles = useTextInputStyles();

  const INCIDENT_CATEGORIES: IncidentCategory[] = [
    { id: 'flood', label: t('report.flood'), color: '#3B82F6', icon: '🌊' },
    { id: 'fire', label: t('report.fire'), color: '#F59E0B', icon: '🔥' },
    { id: 'medical', label: t('report.medical'), color: '#EF4444', icon: '🏥' },
    { id: 'earthquake', label: t('report.earthquake'), color: '#8B5CF6', icon: '🌍' },
    { id: 'other', label: t('report.other'), color: '#10B981', icon: '⚠️' },
  ];

  const SEVERITY_OPTIONS = [
    { id: 'LOW', label: t('report.low'), color: '#10B981' },
    { id: 'MEDIUM', label: t('report.medium'), color: '#FBBF24' },
    { id: 'HIGH', label: t('report.high'), color: '#F59E0B' },
    { id: 'CRITICAL', label: t('report.critical'), color: '#EF4444' },
  ];
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
      Alert.alert(t('report.notAvailable'), t('report.imagePickerNotInstalled'));
      return;
    }
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('report.permissionRequired'), t('report.cameraPermission') || 'Camera permission is needed to take photos.');
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
      Alert.alert(t('common.error'), t('report.photoError') || 'Failed to take photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    if (!ImagePicker) {
      Alert.alert(t('report.notAvailable'), t('report.imagePickerNotInstalled'));
      return;
    }
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('report.permissionRequired'), t('report.photoLibraryPermission') || 'Photo library permission is needed.');
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
      Alert.alert(t('common.error'), t('report.imageError') || 'Failed to pick image. Please try again.');
    }
  };

  const handleGetLocation = async () => {
    try {
      setLocationLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('report.locationPermissionDenied'), t('report.locationPermissionMessage'));
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
      Alert.alert(t('common.error'), t('report.locationError') || 'Failed to get your location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(t('common.error'), t('report.descriptionRequired') || 'Please provide a description of the incident.');
      return;
    }

    if (!location) {
      Alert.alert(t('common.error'), t('report.locationRequired') || 'Please get your location before submitting.');
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

      // Submit to Predictive Service (MongoDB Backend)
      await PredictiveService.submitReport(
        report.type,
        report.details,
        report.location.latitude,
        report.location.longitude
      );

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
      Alert.alert(t('report.success'), t('report.successMessage'));
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert(t('report.error'), t('report.errorMessage'));
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
        <View style={[styles.modalContainer, { backgroundColor: themeColors.card }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
            <ThemedText className="text-2xl font-bold">{t('report.title')}</ThemedText>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={themeColors.text} />
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
              <ThemedText className="text-base font-semibold mb-3">
                {t('report.incidentType')}
              </ThemedText>
              <View className="flex-row flex-wrap gap-3">
                {INCIDENT_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleTypeSelect(category.id)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: selectedType === category.id ? themeColors.background : themeColors.card,
                      borderColor: selectedType === category.id ? themeColors.text : themeColors.border,
                      minHeight: 60,
                    }}
                  >
                    <Text style={{ fontSize: 24, marginRight: 8 }}>{category.icon}</Text>
                    <ThemedText
                      className="font-semibold"
                      style={{ color: selectedType === category.id ? themeColors.text : themeColors.text, opacity: selectedType === category.id ? 1 : 0.7 }}
                    >
                      {category.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Severity */}
            <View className="mb-6">
              <ThemedText className="text-base font-semibold mb-3">
                {t('report.severityLevel')}
              </ThemedText>
              <View className="flex-row flex-wrap gap-3">
                {SEVERITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleSeveritySelect(option.id as any)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 2,
                      minHeight: 60,
                      backgroundColor: severity === option.id ? themeColors.background : themeColors.card,
                      borderColor: severity === option.id ? option.color : themeColors.border,
                    }}
                  >
                    <ThemedText
                      className="font-semibold text-center"
                      style={{ color: severity === option.id ? option.color : themeColors.text, opacity: severity === option.id ? 1 : 0.7 }}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View className="mb-6">
              <ThemedText className="text-base font-semibold mb-3">
                {t('report.description')} *
              </ThemedText>
              <TextInput
                style={[
                  {
                    backgroundColor: themeColors.background,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: themeColors.text,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    minHeight: 100,
                    textAlignVertical: 'top',
                  },
                  textInputStyles,
                ]}
                placeholder={t('report.descriptionPlaceholder')}
                placeholderTextColor={themeColors.text + '80'}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Affected People */}
            <View className="mb-6">
              <ThemedText className="text-base font-semibold mb-3">
                {t('report.affectedPeople')}
              </ThemedText>
              <TextInput
                style={[
                  {
                    backgroundColor: themeColors.background,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: themeColors.text,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    minHeight: 60,
                  },
                  textInputStyles,
                ]}
                placeholder={t('report.affectedPeoplePlaceholder')}
                placeholderTextColor={themeColors.text + '80'}
                value={affectedPeople}
                onChangeText={setAffectedPeople}
                keyboardType="number-pad"
              />
            </View>

            {/* Location */}
            <View className="mb-6">
              <ThemedText className="text-base font-semibold mb-3">
                {t('report.location')} *
              </ThemedText>
              <TouchableOpacity
                onPress={handleGetLocation}
                disabled={locationLoading}
                style={{
                  backgroundColor: themeColors.primary + '20',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: themeColors.primary + '40',
                  minHeight: 60,
                }}
              >
                <View className="flex-row items-center flex-1">
                  <MapPin size={20} color={themeColors.primary} />
                  <ThemedText className="font-medium ml-3 flex-1">
                    {location
                      ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                      : t('report.getCurrentLocation')}
                  </ThemedText>
                </View>
                {locationLoading && (
                  <View className="ml-2">
                    <ThemedText style={{ color: themeColors.primary }}>{t('report.loading')}</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Photo */}
            <View className="mb-6">
              <ThemedText className="text-base font-semibold mb-3">
                {t('report.photo')}
              </ThemedText>
              {photo ? (
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: photo }}
                    style={{ width: '100%', height: 192, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => setPhoto(null)}
                    style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 9999, padding: 8 }}
                  >
                    <X size={20} color="white" />
                  </Pressable>
                </View>
              ) : (
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleTakePhoto}
                    style={{
                      flex: 1,
                      backgroundColor: themeColors.background,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: themeColors.border,
                      minHeight: 60,
                    }}
                  >
                    <Camera size={24} color={themeColors.text} style={{ opacity: 0.7 }} />
                    <ThemedText className="font-medium mt-2" style={{ opacity: 0.7 }}>{t('report.takePhoto')}</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePickImage}
                    style={{
                      flex: 1,
                      backgroundColor: themeColors.background,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: themeColors.border,
                      minHeight: 60,
                    }}
                  >
                    <ImageIcon size={24} color={themeColors.text} style={{ opacity: 0.7 }} />
                    <ThemedText className="font-medium mt-2" style={{ opacity: 0.7 }}>{t('report.choosePhoto')}</ThemedText>
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
                {isSubmitting ? t('report.submitting') : t('report.submit')}
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

