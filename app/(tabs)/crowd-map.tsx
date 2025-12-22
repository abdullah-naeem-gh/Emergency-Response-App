import { AnimatedPressable } from '@/components/AnimatedPressable';
import { EnhancedReportForm } from '@/components/EnhancedReportForm';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import { clusterReports, CrowdReport, crowdReportService, generateHeatmapData, ReportCluster } from '@/services/CrowdReportService';
import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Clock, Plus, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

type FilterType = 'all' | 'flood' | 'fire' | 'medical' | 'earthquake' | 'other';
type ViewMode = 'reports' | 'clusters' | 'heatmap';
type TimeFilter = 'all' | 'hour' | 'day' | 'week';

interface IncidentCategory {
  id: FilterType;
  label: string;
  color: string;
}

const INCIDENT_CATEGORIES: IncidentCategory[] = [
  { id: 'all', label: 'All', color: '#6B7280' },
  { id: 'flood', label: 'Flood', color: '#3B82F6' },
  { id: 'fire', label: 'Fire', color: '#F59E0B' },
  { id: 'medical', label: 'Medical', color: '#EF4444' },
  { id: 'earthquake', label: 'Earthquake', color: '#8B5CF6' },
  { id: 'other', label: 'Other', color: '#10B981' },
];

const getSeverityColor = (severity?: string): string => {
  switch (severity) {
    case 'CRITICAL':
      return '#DC2626';
    case 'HIGH':
      return '#F59E0B';
    case 'MEDIUM':
      return '#FBBF24';
    case 'LOW':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: 'week', label: 'Week' },
  { id: 'day', label: 'Day' },
  { id: 'hour', label: 'Hour' },
];

const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'resolved':
      return '#10B981';
    case 'verified':
      return '#3B82F6';
    case 'sent':
      return '#F59E0B';
    case 'pending':
      return '#6B7280';
    default:
      return '#6B7280';
  }
};

export default function CrowdMapScreen() {
  const { setMode, setRedZone } = useAppStore();
  const { themeColors } = useAccessibility();
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [clusters, setClusters] = useState<ReportCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('clusters');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedCluster, setSelectedCluster] = useState<ReportCluster | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 24.8607, // Karachi default
    longitude: 67.0011,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  // Load reports and clusters
  useEffect(() => {
    loadReports();
  }, []);

  // Get user location
  useEffect(() => {
    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const coords = {
            lat: location.coords.latitude,
            long: location.coords.longitude,
          };
          setUserLocation(coords);
          setMapRegion({
            latitude: coords.lat,
            longitude: coords.long,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };
    requestLocation();
  }, []);

  // Check if user is in high-confidence zone
  useEffect(() => {
    if (userLocation && clusters.length > 0) {
      const highConfidenceCluster = clusters.find((cluster) => {
        const distance = Math.sqrt(
          Math.pow(cluster.center.latitude - userLocation.lat, 2) +
          Math.pow(cluster.center.longitude - userLocation.long, 2)
        ) * 111000; // Convert to meters
        return distance <= cluster.radius && cluster.confidence >= 0.7;
      });

      if (highConfidenceCluster) {
        setMode('PREDICTIVE');
        setRedZone(true);
      }
    }
  }, [userLocation, clusters, setMode, setRedZone]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const allReports = await crowdReportService.getAllReports();
      
      // Add some mock reports for demonstration with status
      const mockReports: CrowdReport[] = [
        {
          id: '1',
          timestamp: Date.now() - 3600000,
          type: 'flood',
          details: 'Water level rising in Malir River',
          location: { latitude: 24.8707, longitude: 67.0111 },
          severity: 'HIGH',
          verificationCount: 5,
          verified: true,
          status: 'verified',
        },
        {
          id: '2',
          timestamp: Date.now() - 1800000,
          type: 'flood',
          details: 'Road blocked due to flooding',
          location: { latitude: 24.8750, longitude: 67.0150 },
          severity: 'MEDIUM',
          verificationCount: 3,
          verified: true,
          status: 'verified',
        },
        {
          id: '3',
          timestamp: Date.now() - 900000,
          type: 'flood',
          details: 'Severe waterlogging in area',
          location: { latitude: 24.8720, longitude: 67.0120 },
          severity: 'CRITICAL',
          verificationCount: 8,
          verified: true,
          status: 'verified',
        },
        {
          id: '4',
          timestamp: Date.now() - 7200000,
          type: 'fire',
          details: 'Building fire reported',
          location: { latitude: 24.8500, longitude: 67.0000 },
          severity: 'HIGH',
          verificationCount: 2,
          status: 'sent',
        },
        {
          id: '5',
          timestamp: Date.now() - 5400000,
          type: 'medical',
          details: 'Medical emergency',
          location: { latitude: 24.8800, longitude: 67.0200 },
          severity: 'HIGH',
          verificationCount: 1,
          status: 'pending',
        },
      ];

      const combinedReports = [...allReports, ...mockReports];
      setReports(combinedReports);

      // Generate clusters
      const reportClusters = clusterReports(combinedReports);
      setClusters(reportClusters);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter reports by type and time
  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((report) => report.type === selectedFilter);
    }

    // Filter by time
    if (timeFilter !== 'all') {
      const now = Date.now();
      let cutoffTime: number;
      switch (timeFilter) {
        case 'hour':
          cutoffTime = now - 3600000;
          break;
        case 'day':
          cutoffTime = now - 86400000;
          break;
        case 'week':
          cutoffTime = now - 604800000;
          break;
        default:
          return filtered;
      }
      filtered = filtered.filter((report) => report.timestamp >= cutoffTime);
    }

    return filtered;
  }, [reports, selectedFilter, timeFilter]);

  // Filter clusters by type
  const filteredClusters = useMemo(() => {
    if (selectedFilter === 'all') return clusters;
    return clusters.filter((cluster) => cluster.type === selectedFilter);
  }, [clusters, selectedFilter]);

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    if (viewMode !== 'heatmap' || !mapRegion) return [];
    
    const bounds = {
      north: mapRegion.latitude + mapRegion.latitudeDelta / 2,
      south: mapRegion.latitude - mapRegion.latitudeDelta / 2,
      east: mapRegion.longitude + mapRegion.longitudeDelta / 2,
      west: mapRegion.longitude - mapRegion.longitudeDelta / 2,
    };

    return generateHeatmapData(filteredReports, bounds);
  }, [viewMode, filteredReports, mapRegion]);

  const handleRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadReports();
  };

  const handleFilterChange = (filter: FilterType) => {
    Haptics.selectionAsync();
    setSelectedFilter(filter);
    setSelectedCluster(null);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    Haptics.selectionAsync();
    setViewMode(mode);
    setSelectedCluster(null);
  };

  const handleTimeFilterChange = (filter: TimeFilter) => {
    Haptics.selectionAsync();
    setTimeFilter(filter);
    setShowTimeFilter(false);
  };

  const handleClusterPress = (cluster: ReportCluster) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCluster(cluster);
  };

  const handleReportIncident = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowReportForm(true);
  };

  const handleReportSuccess = () => {
    loadReports(); // Refresh reports after submission
  };

  const renderMarkers = () => {
    if (viewMode === 'heatmap') {
      // Render heatmap circles
      return heatmapData.map((point, index) => {
        const opacity = point.intensity * 0.6;
        const radius = point.intensity * 500; // Scale radius based on intensity
        
        return (
          <Circle
            key={`heatmap-${index}`}
            center={{ latitude: point.latitude, longitude: point.longitude }}
            radius={radius}
            fillColor={`rgba(239, 68, 68, ${opacity})`}
            strokeColor="transparent"
          />
        );
      });
    } else if (viewMode === 'clusters') {
      return filteredClusters.map((cluster) => (
        <React.Fragment key={cluster.id}>
          <Marker
            coordinate={cluster.center}
            onPress={() => handleClusterPress(cluster)}
            pinColor={getSeverityColor(cluster.severity)}
          >
            <View className="items-center justify-center">
              <View
                className="rounded-full items-center justify-center border-2 border-white"
                style={{
                  backgroundColor: getSeverityColor(cluster.severity),
                  width: 40,
                  height: 40,
                }}
              >
                <Text className="text-white font-bold text-xs">
                  {cluster.reports.length}
                </Text>
              </View>
            </View>
          </Marker>
          {cluster.confidence >= 0.7 && (
            <Circle
              center={cluster.center}
              radius={cluster.radius}
              fillColor={`${getSeverityColor(cluster.severity)}40`}
              strokeColor={getSeverityColor(cluster.severity)}
              strokeWidth={2}
            />
          )}
        </React.Fragment>
      ));
    } else {
      // Show individual reports
      return filteredReports
        .filter((report) => report.location)
        .map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.location!.latitude,
              longitude: report.location!.longitude,
            }}
            pinColor={getSeverityColor(report.severity)}
          />
        ));
    }
  };

  return (
    <ThemedView className="flex-1">
      {/* Header */}
      <View 
        style={{ 
          backgroundColor: themeColors.card, 
          paddingHorizontal: 16, 
          paddingVertical: 12, 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: themeColors.border,
        }}
      >
        <View className="flex-1">
          <ThemedText className="text-xl font-bold">Crowd Reports</ThemedText>
          <ThemedText className="text-xs" style={{ opacity: 0.7 }}>
            {filteredClusters.length} clusters • {filteredReports.length} reports
          </ThemedText>
        </View>
        <AnimatedPressable
          onPress={handleRefresh}
          disabled={loading}
          style={{ 
            backgroundColor: themeColors.border, 
            borderRadius: 9999, 
            padding: 8, 
            minHeight: 44, 
            minWidth: 44 
          }}
          hapticFeedback={true}
          hapticStyle={Haptics.ImpactFeedbackStyle.Light}
        >
          <RefreshCw
            size={20}
            color={themeColors.text}
            style={loading ? { transform: [{ rotate: '180deg' }] } : undefined}
          />
        </AnimatedPressable>
      </View>

      {/* Map */}
      <View className="flex-1">
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={!!userLocation}
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          {renderMarkers()}
          {userLocation && (
            <Circle
              center={{ latitude: userLocation.lat, longitude: userLocation.long }}
              radius={500}
              fillColor="rgba(59, 130, 246, 0.1)"
              strokeColor="#3B82F6"
              strokeWidth={1}
            />
          )}
        </MapView>

        {/* View Mode Toggle */}
        <View 
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: themeColors.card,
            borderRadius: 12,
            padding: 4,
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: 1,
            borderColor: themeColors.border,
          }}
        >
          {(['reports', 'clusters', 'heatmap'] as ViewMode[]).map((mode) => (
            <AnimatedPressable
              key={mode}
              onPress={() => handleViewModeChange(mode)}
              style={{ 
                paddingHorizontal: 12, 
                paddingVertical: 8, 
                borderRadius: 8,
                backgroundColor: viewMode === mode ? themeColors.primary : 'transparent',
                minHeight: 44 
              }}
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Light}
            >
              <ThemedText 
                className="font-semibold text-xs"
                style={{ 
                  color: viewMode === mode ? '#FFFFFF' : themeColors.text,
                  opacity: viewMode === mode ? 1 : 0.7,
                }}
              >
                {mode === 'reports' ? 'Reports' : mode === 'clusters' ? 'Clusters' : 'Heat'}
              </ThemedText>
            </AnimatedPressable>
          ))}
        </View>

        {/* Time Filter Button */}
        <AnimatedPressable
          onPress={() => setShowTimeFilter(true)}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            backgroundColor: themeColors.card,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            minHeight: 44,
            borderWidth: 1,
            borderColor: themeColors.border,
          }}
          hapticFeedback={true}
          hapticStyle={Haptics.ImpactFeedbackStyle.Light}
        >
          <Clock size={16} color={themeColors.text} />
          <ThemedText className="font-semibold text-sm ml-2">
            {TIME_FILTERS.find(f => f.id === timeFilter)?.label || 'All Time'}
          </ThemedText>
        </AnimatedPressable>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            position: 'absolute',
            bottom: 16,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
          }}
          contentContainerStyle={{ gap: 8 }}
        >
          {INCIDENT_CATEGORIES.map((category) => (
            <AnimatedPressable
              key={category.id}
              onPress={() => handleFilterChange(category.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 9999,
                borderWidth: 1,
                backgroundColor: selectedFilter === category.id
                  ? themeColors.background
                  : themeColors.card + 'E6',
                borderColor: selectedFilter === category.id
                  ? themeColors.border
                  : themeColors.border,
                minHeight: 36,
              }}
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Light}
            >
              <ThemedText
                className="font-semibold text-xs"
                style={{
                  color: selectedFilter === category.id
                    ? themeColors.text
                    : themeColors.text,
                }}
              >
                {category.label}
              </ThemedText>
            </AnimatedPressable>
          ))}
        </ScrollView>

        {/* FAB - Report Incident */}
        <AnimatedPressable
          onPress={handleReportIncident}
          className="absolute bottom-20 right-4 bg-red-500 rounded-full p-4 shadow-lg"
          style={{ minHeight: 56, minWidth: 56 }}
          hapticFeedback={true}
          hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
        >
          <Plus size={24} color="white" />
        </AnimatedPressable>
      </View>

      {/* Cluster Details Modal */}
      <Modal
        visible={!!selectedCluster}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCluster(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: themeColors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, maxHeight: '80%' }}>
            <View className="items-center mb-4">
              <View style={{ width: 48, height: 4, backgroundColor: themeColors.border, borderRadius: 9999, marginBottom: 16 }} />
              <ThemedText className="text-2xl font-bold mb-2">
                Cluster Details
              </ThemedText>
            </View>

            {selectedCluster && (
              <>
                <View className="flex-row items-center mb-4">
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 9999,
                      marginRight: 8,
                      backgroundColor: getSeverityColor(selectedCluster.severity) + '20',
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: getSeverityColor(selectedCluster.severity),
                      }}
                    >
                      {selectedCluster.severity}
                    </Text>
                  </View>
                  <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                    {selectedCluster.reports.length} reports
                  </ThemedText>
                  <ThemedText className="text-sm mx-2" style={{ opacity: 0.7 }}>•</ThemedText>
                  <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                    {Math.round(selectedCluster.confidence * 100)}% confidence
                  </ThemedText>
                </View>

                <ThemedText className="text-lg font-semibold mb-2">
                  {selectedCluster.type.toUpperCase()} Incident
                </ThemedText>
                <ThemedText className="text-sm mb-4" style={{ opacity: 0.7 }}>
                  {new Date(selectedCluster.timestamp).toLocaleString()}
                </ThemedText>

                <ScrollView style={{ maxHeight: 256 }}>
                  {selectedCluster.reports.map((report) => (
                    <View
                      key={report.id}
                      style={{
                        backgroundColor: themeColors.background,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: themeColors.border,
                      }}
                    >
                      <ThemedText className="text-sm mb-1">
                        {report.details}
                      </ThemedText>
                      <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <ThemedText className="text-xs" style={{ opacity: 0.7 }}>
                          {new Date(report.timestamp).toLocaleTimeString()}
                        </ThemedText>
                        {report.verified && (
                          <>
                            <ThemedText className="text-xs mx-2" style={{ opacity: 0.7 }}>•</ThemedText>
                            <Text className="text-green-400 text-xs">Verified</Text>
                          </>
                          )}
                        </View>
                        {report.status && (
                          <View
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 9999,
                              backgroundColor: getStatusColor(report.status) + '20',
                            }}
                          >
                            <Text
                              className="text-xs font-semibold capitalize"
                              style={{ color: getStatusColor(report.status) }}
                            >
                              {report.status}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => setSelectedCluster(null)}
                  style={{
                    backgroundColor: themeColors.primary,
                    borderRadius: 12,
                    paddingVertical: 16,
                    marginTop: 16,
                    alignItems: 'center',
                    minHeight: 60,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      )}

      {/* Time Filter Modal */}
      <Modal
        visible={showTimeFilter}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeFilter(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setShowTimeFilter(false)}
        >
          <View style={{ backgroundColor: themeColors.card, borderRadius: 16, padding: 16, width: 256, borderWidth: 1, borderColor: themeColors.border }}>
            <ThemedText className="text-lg font-bold mb-4">Time Filter</ThemedText>
            {TIME_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => handleTimeFilterChange(filter.id)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  marginBottom: 8,
                  backgroundColor: timeFilter === filter.id ? themeColors.primary : themeColors.background,
                  minHeight: 50,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                }}
              >
                <ThemedText className="font-semibold" style={{ color: timeFilter === filter.id ? '#FFFFFF' : themeColors.text }}>
                  {filter.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Enhanced Report Form */}
      <EnhancedReportForm
        visible={showReportForm}
        onClose={() => setShowReportForm(false)}
        onSuccess={handleReportSuccess}
      />
    </ThemedView>
  );
}

