import { EnhancedReportForm } from '@/components/EnhancedReportForm';
import { crowdReportService, clusterReports, CrowdReport, ReportCluster } from '@/services/CrowdReportService';
import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { AlertTriangle, Filter, Layers, MapPin, Plus, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

type FilterType = 'all' | 'flood' | 'fire' | 'medical' | 'earthquake' | 'other';
type ViewMode = 'reports' | 'clusters' | 'heatmap';

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

export default function CrowdMapScreen() {
  const { setMode, setRedZone } = useAppStore();
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [clusters, setClusters] = useState<ReportCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('clusters');
  const [selectedCluster, setSelectedCluster] = useState<ReportCluster | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
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
      
      // Add some mock reports for demonstration
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
        },
        {
          id: '4',
          timestamp: Date.now() - 7200000,
          type: 'fire',
          details: 'Building fire reported',
          location: { latitude: 24.8500, longitude: 67.0000 },
          severity: 'HIGH',
          verificationCount: 2,
        },
        {
          id: '5',
          timestamp: Date.now() - 5400000,
          type: 'medical',
          details: 'Medical emergency',
          location: { latitude: 24.8800, longitude: 67.0200 },
          severity: 'HIGH',
          verificationCount: 1,
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

  // Filter reports by type
  const filteredReports = useMemo(() => {
    if (selectedFilter === 'all') return reports;
    return reports.filter((report) => report.type === selectedFilter);
  }, [reports, selectedFilter]);

  // Filter clusters by type
  const filteredClusters = useMemo(() => {
    if (selectedFilter === 'all') return clusters;
    return clusters.filter((cluster) => cluster.type === selectedFilter);
  }, [clusters, selectedFilter]);

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
    if (viewMode === 'clusters') {
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
    <View className="flex-1 bg-neutral-900">
      {/* Header */}
      <View className="bg-neutral-800 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white text-xl font-bold">Crowd Reports</Text>
          <Text className="text-neutral-400 text-xs">
            {filteredClusters.length} clusters • {filteredReports.length} reports
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={loading}
          className="bg-neutral-700 rounded-full p-2"
          style={{ minHeight: 44, minWidth: 44 }}
        >
          <RefreshCw
            size={20}
            color="white"
            style={loading ? { transform: [{ rotate: '180deg' }] } : undefined}
          />
        </TouchableOpacity>
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
        <View className="absolute top-4 right-4 bg-neutral-800 rounded-xl p-1 flex-row shadow-lg">
          {(['reports', 'clusters'] as ViewMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => handleViewModeChange(mode)}
              className={`px-4 py-2 rounded-lg ${
                viewMode === mode ? 'bg-blue-500' : 'bg-transparent'
              }`}
              style={{ minHeight: 44 }}
            >
              <Text className={`font-semibold text-sm ${
                viewMode === mode ? 'text-white' : 'text-neutral-400'
              }`}>
                {mode === 'reports' ? 'Reports' : 'Clusters'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="absolute bottom-4 left-0 right-0 px-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {INCIDENT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleFilterChange(category.id)}
              className={`px-4 py-2 rounded-full border ${
                selectedFilter === category.id
                  ? 'bg-white border-white'
                  : 'bg-neutral-800/90 border-neutral-600'
              }`}
              style={{ minHeight: 36 }}
            >
              <Text
                className={`font-semibold text-xs ${
                  selectedFilter === category.id
                    ? 'text-neutral-900'
                    : 'text-white'
                }`}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAB - Report Incident */}
        <TouchableOpacity
          onPress={handleReportIncident}
          className="absolute bottom-20 right-4 bg-red-500 rounded-full p-4 shadow-lg"
          style={{ minHeight: 56, minWidth: 56 }}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Cluster Details Modal */}
      <Modal
        visible={!!selectedCluster}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCluster(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-neutral-800 rounded-t-3xl p-6 pb-12 max-h-[80%]">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-neutral-600 rounded-full mb-4" />
              <Text className="text-white text-2xl font-bold mb-2">
                Cluster Details
              </Text>
            </View>

            {selectedCluster && (
              <>
                <View className="flex-row items-center mb-4">
                  <View
                    className="px-3 py-1 rounded-full mr-2"
                    style={{
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
                  <Text className="text-neutral-400 text-sm">
                    {selectedCluster.reports.length} reports
                  </Text>
                  <Text className="text-neutral-400 text-sm mx-2">•</Text>
                  <Text className="text-neutral-400 text-sm">
                    {Math.round(selectedCluster.confidence * 100)}% confidence
                  </Text>
                </View>

                <Text className="text-white text-lg font-semibold mb-2">
                  {selectedCluster.type.toUpperCase()} Incident
                </Text>
                <Text className="text-neutral-400 text-sm mb-4">
                  {new Date(selectedCluster.timestamp).toLocaleString()}
                </Text>

                <ScrollView className="max-h-64">
                  {selectedCluster.reports.map((report) => (
                    <View
                      key={report.id}
                      className="bg-neutral-700 rounded-xl p-3 mb-2"
                    >
                      <Text className="text-white text-sm mb-1">
                        {report.details}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-neutral-400 text-xs">
                          {new Date(report.timestamp).toLocaleTimeString()}
                        </Text>
                        {report.verified && (
                          <>
                            <Text className="text-neutral-400 text-xs mx-2">•</Text>
                            <Text className="text-green-400 text-xs">Verified</Text>
                          </>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => setSelectedCluster(null)}
                  className="bg-blue-500 rounded-xl py-4 mt-4 items-center"
                  style={{ minHeight: 60 }}
                >
                  <Text className="text-white font-bold text-lg">Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {loading && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      {/* Enhanced Report Form */}
      <EnhancedReportForm
        visible={showReportForm}
        onClose={() => setShowReportForm(false)}
        onSuccess={handleReportSuccess}
      />
    </View>
  );
}

