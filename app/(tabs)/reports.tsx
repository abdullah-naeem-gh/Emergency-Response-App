import { AnimatedPressable } from '@/components/AnimatedPressable';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import { CrowdReport, crowdReportService, ReportStatus } from '@/services/CrowdReportService';
import { reportService } from '@/services/ReportService';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock, Edit, MapPin, Trash2, XCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const getStatusIcon = (status?: ReportStatus) => {
  switch (status) {
    case 'resolved':
      return CheckCircle;
    case 'verified':
      return CheckCircle;
    case 'sent':
      return Clock;
    case 'pending':
      return Clock;
    case 'failed':
      return XCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status?: ReportStatus): string => {
  switch (status) {
    case 'resolved':
      return '#10B981';
    case 'verified':
      return '#3B82F6';
    case 'sent':
      return '#F59E0B';
    case 'pending':
      return '#6B7280';
    case 'failed':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getStatusLabel = (status?: ReportStatus): string => {
  switch (status) {
    case 'resolved':
      return 'Resolved';
    case 'verified':
      return 'Verified';
    case 'sent':
      return 'Sent';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
};

interface ReportCardProps {
  report: CrowdReport;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onPress, onEdit, onDelete }) => {
  const { themeColors } = useAccessibility();
  const StatusIcon = getStatusIcon(report.status);
  const statusColor = getStatusColor(report.status);
  const statusLabel = getStatusLabel(report.status);

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'flood':
        return '#3B82F6';
      case 'fire':
        return '#F59E0B';
      case 'medical':
        return '#EF4444';
      case 'earthquake':
        return '#8B5CF6';
      default:
        return '#10B981';
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      style={{
        backgroundColor: themeColors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: themeColors.border,
      }}
      hapticFeedback={true}
      hapticStyle={Haptics.ImpactFeedbackStyle.Light}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View
              className="px-3 py-1 rounded-full mr-2"
              style={{ backgroundColor: getTypeColor(report.type) + '20' }}
            >
              <Text
                className="text-xs font-bold capitalize"
                style={{ color: getTypeColor(report.type) }}
              >
                {report.type}
              </Text>
            </View>
            {report.severity && (
              <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: statusColor + '20' }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: statusColor }}
                >
                  {report.severity}
                </Text>
              </View>
            )}
          </View>
          <ThemedText className="text-base font-semibold mb-1">
            {report.details}
          </ThemedText>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <StatusIcon size={16} color={statusColor} />
          <Text
            className="text-sm font-medium ml-2"
            style={{ color: statusColor }}
          >
            {statusLabel}
          </Text>
          {report.location && (
            <>
              <Text className="text-gray-400 text-sm mx-2">•</Text>
              <MapPin size={14} color="#6B7280" />
              <Text className="text-gray-500 text-xs ml-1">
                {report.location.latitude.toFixed(3)}, {report.location.longitude.toFixed(3)}
              </Text>
            </>
          )}
        </View>
        <View className="flex-row items-center">
          {onEdit && (
            <AnimatedPressable
              onPress={onEdit}
              className="p-2 mr-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Light}
            >
              <Edit size={18} color="#6B7280" />
            </AnimatedPressable>
          )}
          {onDelete && (
            <AnimatedPressable
              onPress={onDelete}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
            >
              <Trash2 size={18} color="#EF4444" />
            </AnimatedPressable>
          )}
        </View>
      </View>

      <ThemedText className="text-xs mt-2" style={{ opacity: 0.6 }}>
        {new Date(report.timestamp).toLocaleString()}
      </ThemedText>
    </AnimatedPressable>
  );
};

export default function ReportsHistoryScreen() {
  const router = useRouter();
  const { themeColors } = useAccessibility();
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<CrowdReport | null>(null);
  const [filter, setFilter] = useState<ReportStatus | 'all'>('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const crowdReports = await crowdReportService.getAllReports();
      const pendingReports = await reportService.getPendingReports();
      
      // Combine and sort by timestamp (newest first)
      const allReports = [...crowdReports, ...pendingReports].sort(
        (a, b) => b.timestamp - a.timestamp
      );
      
      setReports(allReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  const handleReportPress = async (report: CrowdReport) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReport(report);
  };

  const handleDelete = async (report: CrowdReport) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // In real implementation, delete from service
            setReports(reports.filter((r) => r.id !== report.id));
            Alert.alert('Success', 'Report deleted successfully');
          },
        },
      ]
    );
  };

  const handleFilterChange = (newFilter: ReportStatus | 'all') => {
    Haptics.selectionAsync();
    setFilter(newFilter);
  };

  const FILTER_OPTIONS: { id: ReportStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'sent', label: 'Sent' },
    { id: 'verified', label: 'Verified' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'failed', label: 'Failed' },
  ];

  if (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={themeColors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      {/* Header */}
      <View style={{ backgroundColor: themeColors.card, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}>
        <View className="flex-row items-center mb-3">
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
            <ArrowLeft size={24} color={themeColors.text} />
          </Pressable>
          <View className="flex-1">
            <ThemedText className="text-4xl font-bold mb-2">
              Report History
            </ThemedText>
            <ThemedText className="text-base" style={{ opacity: 0.7 }}>
              {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: themeColors.card, paddingHorizontal: 24, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: themeColors.border }}
        contentContainerStyle={{ gap: 8, paddingRight: 24 }}
      >
        {FILTER_OPTIONS.map((option) => {
          const StatusIcon = getStatusIcon(option.id === 'all' ? undefined : option.id);
          const statusColor = getStatusColor(option.id === 'all' ? undefined : option.id);
          
          return (
            <AnimatedPressable
              key={option.id}
              onPress={() => handleFilterChange(option.id)}
              style={{
                borderRadius: 9999,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
                height: 36,
                backgroundColor: filter === option.id ? themeColors.background : themeColors.card,
                borderWidth: filter === option.id ? 2 : 1,
                borderColor: filter === option.id ? statusColor : themeColors.border,
                flexShrink: 0,
              }}
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Light}
            >
              {option.id !== 'all' && (
                <StatusIcon size={14} color={statusColor} style={{ marginRight: 6 }} />
              )}
              <Text
                className="text-sm font-semibold"
                style={{
                  color: filter === option.id ? statusColor : '#6B7280',
                }}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>

      {/* Reports List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredReports.length === 0 ? (
          <View className="items-center justify-center py-20">
            <ThemedText className="text-lg font-semibold mb-2" style={{ opacity: 0.6 }}>
              No reports found
            </ThemedText>
            <ThemedText className="text-sm text-center" style={{ opacity: 0.7 }}>
              {filter === 'all'
                ? 'You haven\'t submitted any reports yet'
                : `No reports with status "${getStatusLabel(filter as ReportStatus)}"`}
            </ThemedText>
          </View>
        ) : (
          filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onPress={() => handleReportPress(report)}
              onDelete={() => handleDelete(report)}
            />
          ))
        )}
      </ScrollView>

      {/* Report Detail Modal */}
      <Modal
        visible={!!selectedReport}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReport(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: themeColors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, maxHeight: '90%' }}>
            <View className="items-center mb-4">
              <View style={{ width: 48, height: 4, backgroundColor: themeColors.border, borderRadius: 9999, marginBottom: 16 }} />
              <ThemedText className="text-2xl font-bold mb-2">
                Report Details
              </ThemedText>
            </View>

            {selectedReport && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mb-4">
                  <ThemedText className="text-sm mb-1" style={{ opacity: 0.7 }}>Type</ThemedText>
                  <ThemedText className="text-lg font-semibold capitalize">
                    {selectedReport.type}
                  </ThemedText>
                </View>

                <View className="mb-4">
                  <ThemedText className="text-sm mb-1" style={{ opacity: 0.7 }}>Status</ThemedText>
                  <View className="flex-row items-center">
                    {(() => {
                      const StatusIcon = getStatusIcon(selectedReport.status);
                      const statusColor = getStatusColor(selectedReport.status);
                      return (
                        <>
                          <StatusIcon size={20} color={statusColor} />
                          <Text
                            className="text-lg font-semibold ml-2"
                            style={{ color: statusColor }}
                          >
                            {getStatusLabel(selectedReport.status)}
                          </Text>
                        </>
                      );
                    })()}
                  </View>
                </View>

                <View className="mb-4">
                  <ThemedText className="text-sm mb-1" style={{ opacity: 0.7 }}>Description</ThemedText>
                  <ThemedText className="text-base leading-6">
                    {selectedReport.details}
                  </ThemedText>
                </View>

                {selectedReport.severity && (
                  <View className="mb-4">
                    <ThemedText className="text-sm mb-1" style={{ opacity: 0.7 }}>Severity</ThemedText>
                    <ThemedText className="text-base font-semibold">
                      {selectedReport.severity}
                    </ThemedText>
                  </View>
                )}

                {selectedReport.location && (
                  <View className="mb-4">
                    <ThemedText className="text-sm mb-1" style={{ opacity: 0.7 }}>Location</ThemedText>
                    <View className="flex-row items-center">
                      <MapPin size={16} color={themeColors.text} style={{ opacity: 0.7 }} />
                      <ThemedText className="text-base ml-2">
                        {selectedReport.location.latitude.toFixed(6)},{' '}
                        {selectedReport.location.longitude.toFixed(6)}
                      </ThemedText>
                    </View>
                  </View>
                )}

                <View className="mb-4">
                  <ThemedText className="text-sm mb-1" style={{ opacity: 0.7 }}>Submitted</ThemedText>
                  <ThemedText className="text-base">
                    {new Date(selectedReport.timestamp).toLocaleString()}
                  </ThemedText>
                </View>

                {selectedReport.affectedPeople && (
                  <View className="mb-4">
                    <ThemedText className="text-sm mb-1" style={{ opacity: 0.7 }}>
                      People Affected
                    </ThemedText>
                    <ThemedText className="text-base font-semibold">
                      {selectedReport.affectedPeople}
                    </ThemedText>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setSelectedReport(null)}
                  style={{ backgroundColor: themeColors.primary, borderRadius: 12, paddingVertical: 16, marginTop: 16, alignItems: 'center', minHeight: 60 }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

