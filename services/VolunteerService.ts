import { RescueTask } from '@/src/data/tasksData';

export type TaskStatus = 'OPEN' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface EnhancedTask extends RescueTask {
  acceptedBy?: string;
  acceptedAt?: number;
  status: TaskStatus;
  notes?: string;
  photoProof?: string;
  completedAt?: number;
  assignedTeam?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  level: string;
  status: 'available' | 'busy' | 'offline';
  currentTask?: string;
}

export interface TeamMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
  taskId?: string;
  type: 'message' | 'task_update' | 'system';
}

class VolunteerService {
  private tasks: EnhancedTask[] = [];
  private teamMembers: TeamMember[] = [];
  private teamMessages: TeamMessage[] = [];

  /**
   * Accept a task
   */
  async acceptTask(taskId: string, userId: string): Promise<EnhancedTask | null> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task && task.status === 'OPEN') {
      task.status = 'ACCEPTED';
      task.acceptedBy = userId;
      task.acceptedAt = Date.now();
      return task;
    }
    return null;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    notes?: string,
    photoProof?: string
  ): Promise<EnhancedTask | null> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      if (notes) task.notes = notes;
      if (photoProof) task.photoProof = photoProof;
      if (status === 'COMPLETED') {
        task.completedAt = Date.now();
      }
      return task;
    }
    return null;
  }

  /**
   * Get user's accepted tasks
   */
  async getUserTasks(userId: string): Promise<EnhancedTask[]> {
    return this.tasks.filter(
      (t) => t.acceptedBy === userId && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
    );
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<EnhancedTask | null> {
    return this.tasks.find((t) => t.id === taskId) || null;
  }

  /**
   * Send team message
   */
  async sendTeamMessage(
    message: Omit<TeamMessage, 'id' | 'timestamp'>
  ): Promise<TeamMessage> {
    const newMessage: TeamMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    this.teamMessages.push(newMessage);
    return newMessage;
  }

  /**
   * Get team messages
   */
  async getTeamMessages(taskId?: string, limit: number = 50): Promise<TeamMessage[]> {
    let messages = this.teamMessages;
    if (taskId) {
      messages = messages.filter((m) => m.taskId === taskId);
    }
    return messages.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Get team members
   */
  async getTeamMembers(): Promise<TeamMember[]> {
    return this.teamMembers;
  }

  /**
   * Get navigation route to task
   */
  async getNavigationRoute(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number
  ): Promise<{
    distance: number; // meters
    estimatedTime: number; // minutes
    waypoints?: { latitude: number; longitude: number }[];
  }> {
    // In production, use routing API
    const distance = this.calculateDistance(startLat, startLon, endLat, endLon);
    const estimatedTime = Math.round((distance / 1000 / 5) * 60); // Assume 5 km/h walking speed

    return {
      distance,
      estimatedTime,
    };
  }

  /**
   * Calculate distance between coordinates
   */
  private calculateDistance(
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
}

export const volunteerService = new VolunteerService();

