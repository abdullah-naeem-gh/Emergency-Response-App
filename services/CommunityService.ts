
export interface SafetyCheckIn {
  id: string;
  userId: string;
  timestamp: number;
  location: { latitude: number; longitude: number };
  status: 'safe' | 'needs_help' | 'evacuating';
  message?: string;
  familyMembers?: string[];
}

export interface ResourceRequest {
  id: string;
  userId: string;
  type: 'food' | 'water' | 'medical' | 'shelter' | 'transport' | 'other';
  title: string;
  description: string;
  location: { latitude: number; longitude: number };
  urgency: 'low' | 'medium' | 'high' | 'critical';
  quantity?: string;
  timestamp: number;
  status: 'open' | 'fulfilled' | 'cancelled';
  fulfilledBy?: string;
}

export interface ResourceOffer {
  id: string;
  userId: string;
  type: 'food' | 'water' | 'medical' | 'shelter' | 'transport' | 'other';
  title: string;
  description: string;
  location: { latitude: number; longitude: number };
  quantity?: string;
  availableUntil?: number;
  timestamp: number;
  status: 'available' | 'claimed' | 'cancelled';
  claimedBy?: string;
}

export interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
  location?: { latitude: number; longitude: number };
  type: 'message' | 'announcement' | 'alert';
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  lastCheckIn?: SafetyCheckIn;
  lastSeenLocation?: { latitude: number; longitude: number };
  status: 'safe' | 'unknown' | 'needs_help';
}

/**
 * Mock Community Service
 * In production, this would integrate with a real backend for community features
 */
class CommunityService {
  private checkIns: SafetyCheckIn[] = [];
  private resourceRequests: ResourceRequest[] = [];
  private resourceOffers: ResourceOffer[] = [];
  private messages: CommunityMessage[] = [];
  private familyMembers: FamilyMember[] = [];

  /**
   * Submit a safety check-in
   */
  async submitCheckIn(checkIn: Omit<SafetyCheckIn, 'id' | 'timestamp'>): Promise<SafetyCheckIn> {
    const newCheckIn: SafetyCheckIn = {
      ...checkIn,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    this.checkIns.push(newCheckIn);
    return newCheckIn;
  }

  /**
   * Get recent check-ins
   */
  async getRecentCheckIns(limit: number = 20): Promise<SafetyCheckIn[]> {
    return this.checkIns
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get user's last check-in
   */
  async getLastCheckIn(userId: string): Promise<SafetyCheckIn | null> {
    const userCheckIns = this.checkIns
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
    return userCheckIns[0] || null;
  }

  /**
   * Create a resource request
   */
  async createResourceRequest(
    request: Omit<ResourceRequest, 'id' | 'timestamp' | 'status'>
  ): Promise<ResourceRequest> {
    const newRequest: ResourceRequest = {
      ...request,
      id: Date.now().toString(),
      timestamp: Date.now(),
      status: 'open',
    };
    this.resourceRequests.push(newRequest);
    return newRequest;
  }

  /**
   * Get nearby resource requests
   */
  async getNearbyResourceRequests(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<ResourceRequest[]> {
    const requests = this.resourceRequests
      .filter((r) => r.status === 'open')
      .map((r) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          r.location.latitude,
          r.location.longitude
        );
        return { ...r, distance };
      })
      .filter((r) => (r.distance || 0) <= radiusKm * 1000)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return requests;
  }

  /**
   * Create a resource offer
   */
  async createResourceOffer(
    offer: Omit<ResourceOffer, 'id' | 'timestamp' | 'status'>
  ): Promise<ResourceOffer> {
    const newOffer: ResourceOffer = {
      ...offer,
      id: Date.now().toString(),
      timestamp: Date.now(),
      status: 'available',
    };
    this.resourceOffers.push(newOffer);
    return newOffer;
  }

  /**
   * Get nearby resource offers
   */
  async getNearbyResourceOffers(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<ResourceOffer[]> {
    const offers = this.resourceOffers
      .filter((o) => o.status === 'available')
      .map((o) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          o.location.latitude,
          o.location.longitude
        );
        return { ...o, distance };
      })
      .filter((o) => (o.distance || 0) <= radiusKm * 1000)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return offers;
  }

  /**
   * Fulfill a resource request
   */
  async fulfillRequest(requestId: string, userId: string): Promise<void> {
    const request = this.resourceRequests.find((r) => r.id === requestId);
    if (request) {
      request.status = 'fulfilled';
      request.fulfilledBy = userId;
    }
  }

  /**
   * Claim a resource offer
   */
  async claimOffer(offerId: string, userId: string): Promise<void> {
    const offer = this.resourceOffers.find((o) => o.id === offerId);
    if (offer) {
      offer.status = 'claimed';
      offer.claimedBy = userId;
    }
  }

  /**
   * Send a community message
   */
  async sendMessage(
    message: Omit<CommunityMessage, 'id' | 'timestamp'>
  ): Promise<CommunityMessage> {
    const newMessage: CommunityMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  /**
   * Get recent community messages
   */
  async getRecentMessages(limit: number = 50): Promise<CommunityMessage[]> {
    return this.messages
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get family members
   */
  async getFamilyMembers(): Promise<FamilyMember[]> {
    return this.familyMembers;
  }

  /**
   * Add family member
   */
  async addFamilyMember(member: Omit<FamilyMember, 'id'>): Promise<FamilyMember> {
    const newMember: FamilyMember = {
      ...member,
      id: Date.now().toString(),
    };
    this.familyMembers.push(newMember);
    return newMember;
  }

  /**
   * Update family member status
   */
  async updateFamilyMemberStatus(
    memberId: string,
    checkIn: SafetyCheckIn
  ): Promise<void> {
    const member = this.familyMembers.find((m) => m.id === memberId);
    if (member) {
      member.lastCheckIn = checkIn;
      member.lastSeenLocation = checkIn.location;
      member.status = checkIn.status === 'safe' ? 'safe' : 'needs_help';
    }
  }

  /**
   * Calculate distance between two coordinates
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

export const communityService = new CommunityService();

