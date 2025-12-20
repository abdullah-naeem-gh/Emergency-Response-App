import { Report } from './ReportService';

export interface CrowdReport extends Report {
  userId?: string;
  photoUrl?: string;
  videoUrl?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedPeople?: number;
  verified?: boolean;
  verificationCount?: number;
}

export interface ReportCluster {
  id: string;
  center: { latitude: number; longitude: number };
  reports: CrowdReport[];
  confidence: number; // 0-1, based on report count and verification
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: number;
  radius: number; // meters
}

const CLUSTER_RADIUS = 500; // meters
const MIN_REPORTS_FOR_CLUSTER = 3;
const CONFIDENCE_THRESHOLD = 0.7; // For triggering predictive mode

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Cluster reports by location and type
 */
export function clusterReports(reports: CrowdReport[]): ReportCluster[] {
  if (reports.length === 0) return [];

  const clusters: ReportCluster[] = [];
  const processed = new Set<string>();

  for (const report of reports) {
    if (!report.location || processed.has(report.id)) continue;

    // Find all reports within cluster radius
    const nearbyReports: CrowdReport[] = [report];
    
    for (const otherReport of reports) {
      if (
        otherReport.id !== report.id &&
        otherReport.location &&
        otherReport.type === report.type &&
        !processed.has(otherReport.id)
      ) {
        const distance = calculateDistance(
          report.location.latitude,
          report.location.longitude,
          otherReport.location.latitude,
          otherReport.location.longitude
        );

        if (distance <= CLUSTER_RADIUS) {
          nearbyReports.push(otherReport);
        }
      }
    }

    // Only create cluster if we have minimum reports
    if (nearbyReports.length >= MIN_REPORTS_FOR_CLUSTER) {
      // Calculate cluster center (average of all locations)
      const centerLat =
        nearbyReports.reduce(
          (sum, r) => sum + (r.location?.latitude || 0),
          0
        ) / nearbyReports.length;
      const centerLon =
        nearbyReports.reduce(
          (sum, r) => sum + (r.location?.longitude || 0),
          0
        ) / nearbyReports.length;

      // Calculate confidence based on report count and verification
      const verifiedCount = nearbyReports.filter((r) => r.verified).length;
      const verificationCount = nearbyReports.reduce(
        (sum, r) => sum + (r.verificationCount || 0),
        0
      );
      const baseConfidence = Math.min(1, nearbyReports.length / 10); // Max at 10 reports
      const verificationBonus = (verificationCount / nearbyReports.length) * 0.3;
      const confidence = Math.min(1, baseConfidence + verificationBonus);

      // Determine overall severity (highest severity in cluster)
      const severities: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = [
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL',
      ];
      const maxSeverityIndex = Math.max(
        ...nearbyReports.map((r) =>
          r.severity
            ? severities.indexOf(r.severity)
            : 0
        )
      );
      const severity = severities[maxSeverityIndex] || 'MEDIUM';

      // Calculate cluster radius (max distance from center)
      const maxDistance = Math.max(
        ...nearbyReports.map((r) =>
          r.location
            ? calculateDistance(
                centerLat,
                centerLon,
                r.location.latitude,
                r.location.longitude
              )
            : 0
        )
      );

      const cluster: ReportCluster = {
        id: `cluster-${report.id}`,
        center: { latitude: centerLat, longitude: centerLon },
        reports: nearbyReports,
        confidence,
        type: report.type,
        severity,
        timestamp: Math.max(...nearbyReports.map((r) => r.timestamp)),
        radius: Math.max(maxDistance, CLUSTER_RADIUS / 2),
      };

      clusters.push(cluster);

      // Mark all reports in cluster as processed
      nearbyReports.forEach((r) => processed.add(r.id));
    }
  }

  return clusters;
}

/**
 * Get high-confidence clusters that should trigger predictive mode
 */
export function getHighConfidenceClusters(
  clusters: ReportCluster[]
): ReportCluster[] {
  return clusters.filter((cluster) => cluster.confidence >= CONFIDENCE_THRESHOLD);
}

/**
 * Check if a location is in a high-confidence cluster
 */
export function isInHighConfidenceZone(
  latitude: number,
  longitude: number,
  clusters: ReportCluster[]
): ReportCluster | null {
  const highConfidenceClusters = getHighConfidenceClusters(clusters);
  
  for (const cluster of highConfidenceClusters) {
    const distance = calculateDistance(
      latitude,
      longitude,
      cluster.center.latitude,
      cluster.center.longitude
    );

    if (distance <= cluster.radius) {
      return cluster;
    }
  }

  return null;
}

/**
 * Get heatmap data for visualization
 */
export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number; // 0-1
}

export function generateHeatmapData(
  reports: CrowdReport[],
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }
): HeatmapPoint[] {
  const gridSize = 50; // 50x50 grid
  const latStep = (bounds.north - bounds.south) / gridSize;
  const lonStep = (bounds.east - bounds.west) / gridSize;

  const heatmap: HeatmapPoint[] = [];

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const lat = bounds.south + i * latStep;
      const lon = bounds.west + j * lonStep;

      // Count reports within a small radius of this grid point
      let count = 0;
      for (const report of reports) {
        if (!report.location) continue;

        const distance = calculateDistance(
          lat,
          lon,
          report.location.latitude,
          report.location.longitude
        );

        // Count reports within 200m
        if (distance <= 200) {
          count++;
        }
      }

      // Normalize intensity (0-1)
      const intensity = Math.min(1, count / 10);

      if (intensity > 0) {
        heatmap.push({
          latitude: lat,
          longitude: lon,
          intensity,
        });
      }
    }
  }

  return heatmap;
}

/**
 * Mock service for crowd reports (will be replaced with real API)
 */
class CrowdReportService {
  private mockReports: CrowdReport[] = [];

  /**
   * Get all crowd reports (mock implementation)
   */
  async getAllReports(): Promise<CrowdReport[]> {
    // In real implementation, fetch from API
    // For now, return mock data + any local reports
    return this.mockReports;
  }

  /**
   * Get reports within a bounding box
   */
  async getReportsInBounds(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<CrowdReport[]> {
    const allReports = await this.getAllReports();
    return allReports.filter((report) => {
      if (!report.location) return false;
      const { latitude, longitude } = report.location;
      return (
        latitude >= bounds.south &&
        latitude <= bounds.north &&
        longitude >= bounds.west &&
        longitude <= bounds.east
      );
    });
  }

  /**
   * Add a new crowd report
   */
  async addReport(report: CrowdReport): Promise<void> {
    // In real implementation, send to API
    this.mockReports.push(report);
  }

  /**
   * Verify a report (user confirms an existing report)
   */
  async verifyReport(reportId: string): Promise<void> {
    const report = this.mockReports.find((r) => r.id === reportId);
    if (report) {
      report.verificationCount = (report.verificationCount || 0) + 1;
      if (report.verificationCount >= 3) {
        report.verified = true;
      }
    }
  }
}

export const crowdReportService = new CrowdReportService();

