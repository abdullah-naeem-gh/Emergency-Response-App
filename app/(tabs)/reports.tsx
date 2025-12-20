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
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
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
          <Text className="text-gray-900 text-base font-semibold mb-1">
            {report.details}
          </Text>
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
            <Pressable
              onPress={onEdit}
              className="p-2 mr-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Edit size={18} color="#6B7280" />
            </Pressable>
          )}
          {onDelete && (
            <Pressable
              onPress={onDelete}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={18} color="#EF4444" />
            </Pressable>
          )}
        </View>
      </View>

      <Text className="text-gray-400 text-xs mt-2">
        {new Date(report.timestamp).toLocaleString()}
      </Text>
    </Pressable>
  );
};

export default function ReportsHistoryScreen() {
  const router = useRouter();
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
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-4">
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
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-4xl font-bold text-gray-900 mb-2">
              Report History
            </Text>
            <Text className="text-gray-600 text-base">
              {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white px-6 py-3 border-b border-gray-200"
        contentContainerStyle={{ gap: 8, paddingRight: 24 }}
      >
        {FILTER_OPTIONS.map((option) => {
          const StatusIcon = getStatusIcon(option.id === 'all' ? undefined : option.id);
          const statusColor = getStatusColor(option.id === 'all' ? undefined : option.id);
          
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleFilterChange(option.id)}
              className={`rounded-full flex-row items-center justify-center ${
                filter === option.id ? 'bg-gray-100' : 'bg-white'
              }`}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                height: 36,
                borderWidth: filter === option.id ? 2 : 1,
                borderColor: filter === option.id ? statusColor : '#E5E7EB',
                flexShrink: 0,
              }}
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
            </TouchableOpacity>
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
            <Text className="text-gray-400 text-lg font-semibold mb-2">
              No reports found
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              {filter === 'all'
                ? 'You haven\'t submitted any reports yet'
                : `No reports with status "${getStatusLabel(filter as ReportStatus)}"`}
            </Text>
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
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-12 max-h-[90%]">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 rounded-full mb-4" />
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Report Details
              </Text>
            </View>

            {selectedReport && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mb-4">
                  <Text className="text-gray-500 text-sm mb-1">Type</Text>
                  <Text className="text-gray-900 text-lg font-semibold capitalize">
                    {selectedReport.type}
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-gray-500 text-sm mb-1">Status</Text>
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
                  <Text className="text-gray-500 text-sm mb-1">Description</Text>
                  <Text className="text-gray-900 text-base leading-6">
                    {selectedReport.details}
                  </Text>
                </View>

                {selectedReport.severity && (
                  <View className="mb-4">
                    <Text className="text-gray-500 text-sm mb-1">Severity</Text>
                    <Text className="text-gray-900 text-base font-semibold">
                      {selectedReport.severity}
                    </Text>
                  </View>
                )}

                {selectedReport.location && (
                  <View className="mb-4">
                    <Text className="text-gray-500 text-sm mb-1">Location</Text>
                    <View className="flex-row items-center">
                      <MapPin size={16} color="#6B7280" />
                      <Text className="text-gray-900 text-base ml-2">
                        {selectedReport.location.latitude.toFixed(6)},{' '}
                        {selectedReport.location.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>
                )}

                <View className="mb-4">
                  <Text className="text-gray-500 text-sm mb-1">Submitted</Text>
                  <Text className="text-gray-900 text-base">
                    {new Date(selectedReport.timestamp).toLocaleString()}
                  </Text>
                </View>

                {selectedReport.affectedPeople && (
                  <View className="mb-4">
                    <Text className="text-gray-500 text-sm mb-1">
                      People Affected
                    </Text>
                    <Text className="text-gray-900 text-base font-semibold">
                      {selectedReport.affectedPeople}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setSelectedReport(null)}
                  className="bg-blue-500 rounded-xl py-4 mt-4 items-center"
                  style={{ minHeight: 60 }}
                >
                  <Text className="text-white font-bold text-lg">Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

