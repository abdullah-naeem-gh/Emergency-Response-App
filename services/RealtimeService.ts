import NetInfo from '@react-native-community/netinfo';

export type UpdateType = 'alert' | 'crowd_report' | 'volunteer_task' | 'system';

export interface RealtimeUpdate {
  id: string;
  type: UpdateType;
  timestamp: number;
  data: any;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export type UpdateCallback = (update: RealtimeUpdate) => void;

class RealtimeService {
  private ws: WebSocket | null = null;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private subscribers: Map<UpdateType, Set<UpdateCallback>> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private useWebSocket = true; // Toggle between WebSocket and polling
  private pollingIntervalMs = 5000; // 5 seconds
  private consecutiveFailures = 0;
  private maxConsecutiveFailures = 3; // Stop polling after 3 consecutive failures

  private readonly WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'wss://api.muhafiz.app/ws';
  private readonly API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.muhafiz.app';

  /**
   * Subscribe to real-time updates
   */
  subscribe(type: UpdateType, callback: UpdateCallback): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)!.add(callback);

    // Auto-connect if not connected
    if (!this.isConnected) {
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(type);
      if (callbacks) {
        callbacks.delete(callback);
        // Disconnect if no more subscribers
        if (this.subscribers.size === 0 || Array.from(this.subscribers.values()).every(s => s.size === 0)) {
          this.disconnect();
        }
      }
    };
  }

  /**
   * Connect to real-time service
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      console.warn('No network connection, cannot connect to real-time service');
      return;
    }

    if (this.useWebSocket) {
      await this.connectWebSocket();
    } else {
      this.startPolling();
    }
  }

  /**
   * Connect via WebSocket
   */
  private async connectWebSocket(): Promise<void> {
    try {
      this.ws = new WebSocket(this.WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.authenticate();
      };

      this.ws.onmessage = (event) => {
        try {
          const update: RealtimeUpdate = JSON.parse(event.data);
          this.handleUpdate(update);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.isConnected = false;
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      // Fallback to polling
      this.useWebSocket = false;
      this.startPolling();
    }
  }

  /**
   * Start polling as fallback
   */
  private startPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // Initial fetch
    this.fetchUpdates();

    // Set up polling interval
    this.pollingInterval = setInterval(() => {
      this.fetchUpdates();
    }, this.pollingIntervalMs);

    this.isConnected = true;
  }

  /**
   * Fetch updates via HTTP polling
   */
  private async fetchUpdates(): Promise<void> {
    try {
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        return;
      }

      // Stop polling if we've had too many consecutive failures
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        return;
      }

      // Get subscribed types
      const subscribedTypes = Array.from(this.subscribers.keys());
      if (subscribedTypes.length === 0) return;

      // Fetch updates for subscribed types
      const response = await fetch(
        `${this.API_URL}/api/realtime/updates?types=${subscribedTypes.join(',')}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add auth token if available
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const updates: RealtimeUpdate[] = await response.json();
      updates.forEach((update) => this.handleUpdate(update));
      
      // Reset failure counter on success
      this.consecutiveFailures = 0;
    } catch (error) {
      this.consecutiveFailures++;
      
      // Only log error on first failure or if it's not a network error
      if (this.consecutiveFailures === 1) {
        // Silently handle expected network failures in development
        if (error instanceof TypeError && error.message === 'Network request failed') {
          // Suppress repeated network errors - this is expected when API is not available
          return;
        }
        console.warn('Realtime service unavailable - running in offline mode');
      }
      
      // Stop polling after max failures
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        if (this.pollingInterval) {
          clearInterval(this.pollingInterval);
          this.pollingInterval = null;
        }
        this.isConnected = false;
      }
    }
  }

  /**
   * Authenticate WebSocket connection
   */
  private authenticate(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Send authentication message
    const authMessage = {
      type: 'auth',
      deviceId: this.getDeviceId(),
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(authMessage));
  }

  /**
   * Handle incoming update
   */
  private handleUpdate(update: RealtimeUpdate): void {
    const callbacks = this.subscribers.get(update.type);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(update);
        } catch (error) {
          console.error('Error in update callback:', error);
        }
      });
    }

    // Also notify 'all' subscribers if any
    const allCallbacks = this.subscribers.get('system' as UpdateType);
    if (allCallbacks) {
      allCallbacks.forEach((callback) => {
        try {
          callback(update);
        } catch (error) {
          console.error('Error in update callback:', error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnect attempts reached, falling back to polling');
      this.useWebSocket = false;
      this.startPolling();
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connectWebSocket();
    }, delay);
  }

  /**
   * Disconnect from real-time service
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isConnected = false;
  }

  /**
   * Send message via WebSocket
   */
  send(type: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data, timestamp: Date.now() }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Get device ID for authentication
   */
  private getDeviceId(): string {
    // In production, get from secure storage
    return 'device-' + Date.now();
  }

  /**
   * Check if connected
   */
  isServiceConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (this.isConnected) return 'connected';
    if (this.reconnectAttempts > 0) return 'connecting';
    return 'disconnected';
  }
}

export const realtimeService = new RealtimeService();

