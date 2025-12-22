import { useEffect, useRef } from 'react';
import {
  realtimeService,
  RealtimeUpdate,
  UpdateType,
} from '@/services/RealtimeService';
import { notificationService } from '@/services/NotificationService';

export interface UseRealtimeUpdatesOptions {
  types: UpdateType[];
  onUpdate?: (update: RealtimeUpdate) => void;
  showNotifications?: boolean;
  notificationTitle?: (update: RealtimeUpdate) => string;
  notificationBody?: (update: RealtimeUpdate) => string;
}

/**
 * Hook for subscribing to real-time updates
 */
export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions) {
  const {
    types,
    onUpdate,
    showNotifications = true,
    notificationTitle,
    notificationBody,
  } = options;

  const onUpdateRef = useRef(onUpdate);
  const unsubscribeRefs = useRef<Array<() => void>>([]);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    // Subscribe to each update type
    const unsubscribes = types.map((type) => {
      return realtimeService.subscribe(type, (update: RealtimeUpdate) => {
        // Call the update callback
        if (onUpdateRef.current) {
          onUpdateRef.current(update);
        }

        // Show notification if enabled
        if (showNotifications) {
          const title = notificationTitle
            ? notificationTitle(update)
            : getDefaultNotificationTitle(update);
          const body = notificationBody
            ? notificationBody(update)
            : getDefaultNotificationBody(update);

          handleNotification(update, title, body);
        }
      });
    });

    unsubscribeRefs.current = unsubscribes;

    // Connect to service
    realtimeService.connect();

    // Cleanup
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      unsubscribeRefs.current = [];
    };
  }, [types.join(','), showNotifications]);

  return {
    isConnected: realtimeService.isServiceConnected(),
    connectionStatus: realtimeService.getConnectionStatus(),
  };
}

/**
 * Handle notification based on update type
 */
async function handleNotification(
  update: RealtimeUpdate,
  title: string,
  body: string
): Promise<void> {
  try {
    switch (update.type) {
      case 'alert':
        await notificationService.sendEmergencyAlert(title, body, update.data);
        break;
      case 'crowd_report':
        await notificationService.sendCrowdReportNotification(title, body, update.data);
        break;
      case 'volunteer_task':
        await notificationService.sendVolunteerTaskNotification(title, body, update.data);
        break;
      default:
        await notificationService.scheduleLocalNotification({
          type: 'system',
          title,
          body,
          data: update.data,
          priority: 'default',
        });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Get default notification title
 */
function getDefaultNotificationTitle(update: RealtimeUpdate): string {
  switch (update.type) {
    case 'alert':
      return 'Emergency Alert';
    case 'crowd_report':
      return 'New Report';
    case 'volunteer_task':
      return 'Volunteer Task Update';
    default:
      return 'Update';
  }
}

/**
 * Get default notification body
 */
function getDefaultNotificationBody(update: RealtimeUpdate): string {
  if (update.data?.message) {
    return update.data.message;
  }

  switch (update.type) {
    case 'alert':
      return 'A new emergency alert has been issued in your area.';
    case 'crowd_report':
      return 'A new incident has been reported nearby.';
    case 'volunteer_task':
      return 'A new volunteer task is available.';
    default:
      return 'You have a new update.';
  }
}

