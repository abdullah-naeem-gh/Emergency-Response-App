export interface EmergencyKitItem {
  id: string;
  name: string;
  category: 'food' | 'water' | 'medical' | 'tools' | 'documents' | 'other';
  quantity: number;
  checked: boolean;
  priority: 'essential' | 'recommended' | 'optional';
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface EmergencyPlan {
  meetingPoint: string;
  meetingPointLocation?: { latitude: number; longitude: number };
  evacuationRoute?: string;
  familyMembers: FamilyMember[];
  emergencyContacts: FamilyMember[];
  notes?: string;
}

export interface PreparednessQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const DEFAULT_KIT_ITEMS: EmergencyKitItem[] = [
  // Food
  { id: '1', name: 'Non-perishable food (3-day supply)', category: 'food', quantity: 1, checked: false, priority: 'essential' },
  { id: '2', name: 'Canned goods', category: 'food', quantity: 10, checked: false, priority: 'essential' },
  { id: '3', name: 'Energy bars', category: 'food', quantity: 12, checked: false, priority: 'recommended' },
  { id: '4', name: 'Dried fruits and nuts', category: 'food', quantity: 5, checked: false, priority: 'recommended' },
  
  // Water
  { id: '5', name: 'Water (1 gallon per person per day)', category: 'water', quantity: 3, checked: false, priority: 'essential' },
  { id: '6', name: 'Water purification tablets', category: 'water', quantity: 1, checked: false, priority: 'recommended' },
  
  // Medical
  { id: '7', name: 'First aid kit', category: 'medical', quantity: 1, checked: false, priority: 'essential' },
  { id: '8', name: 'Prescription medications', category: 'medical', quantity: 1, checked: false, priority: 'essential' },
  { id: '9', name: 'Bandages and gauze', category: 'medical', quantity: 1, checked: false, priority: 'essential' },
  { id: '10', name: 'Antiseptic wipes', category: 'medical', quantity: 1, checked: false, priority: 'essential' },
  { id: '11', name: 'Pain relievers', category: 'medical', quantity: 1, checked: false, priority: 'recommended' },
  
  // Tools
  { id: '12', name: 'Flashlight with extra batteries', category: 'tools', quantity: 1, checked: false, priority: 'essential' },
  { id: '13', name: 'Multi-tool or Swiss Army knife', category: 'tools', quantity: 1, checked: false, priority: 'recommended' },
  { id: '14', name: 'Whistle', category: 'tools', quantity: 1, checked: false, priority: 'essential' },
  { id: '15', name: 'Duct tape', category: 'tools', quantity: 1, checked: false, priority: 'recommended' },
  { id: '16', name: 'Rope or cord', category: 'tools', quantity: 1, checked: false, priority: 'optional' },
  
  // Documents
  { id: '17', name: 'Important documents (ID, insurance)', category: 'documents', quantity: 1, checked: false, priority: 'essential' },
  { id: '18', name: 'Emergency contact list', category: 'documents', quantity: 1, checked: false, priority: 'essential' },
  { id: '19', name: 'Cash (small denominations)', category: 'documents', quantity: 1, checked: false, priority: 'recommended' },
  
  // Other
  { id: '20', name: 'Portable phone charger', category: 'other', quantity: 1, checked: false, priority: 'essential' },
  { id: '21', name: 'Blankets or sleeping bags', category: 'other', quantity: 2, checked: false, priority: 'recommended' },
  { id: '22', name: 'Change of clothes', category: 'other', quantity: 1, checked: false, priority: 'recommended' },
  { id: '23', name: 'Personal hygiene items', category: 'other', quantity: 1, checked: false, priority: 'recommended' },
];

const PREPAREDNESS_QUIZ: PreparednessQuiz[] = [
  {
    id: '1',
    question: 'How much water should you store per person per day?',
    options: ['1 quart', '1 gallon', '2 gallons', '3 gallons'],
    correctAnswer: 1,
    explanation: 'You should store at least 1 gallon of water per person per day for drinking and sanitation.',
  },
  {
    id: '2',
    question: 'How long should your emergency food supply last?',
    options: ['1 day', '3 days', '1 week', '2 weeks'],
    correctAnswer: 1,
    explanation: 'A minimum 3-day supply is recommended, but 2 weeks is ideal for extended emergencies.',
  },
  {
    id: '3',
    question: 'What is the most important item in your emergency kit?',
    options: ['Food', 'Water', 'First aid kit', 'Flashlight'],
    correctAnswer: 1,
    explanation: 'Water is the most critical item as humans can survive only 3 days without water.',
  },
  {
    id: '4',
    question: 'Where should you store your emergency kit?',
    options: ['In the garage', 'In an easily accessible location', 'In the basement', 'Outside'],
    correctAnswer: 1,
    explanation: 'Store your kit in an easily accessible location where all family members know where to find it.',
  },
  {
    id: '5',
    question: 'How often should you check and update your emergency kit?',
    options: ['Monthly', 'Every 3 months', 'Every 6 months', 'Annually'],
    correctAnswer: 2,
    explanation: 'Check your emergency kit every 6 months to replace expired items and update contents.',
  },
];

class PreparednessService {
  private kitItems: EmergencyKitItem[] = [...DEFAULT_KIT_ITEMS];
  private emergencyPlan: EmergencyPlan | null = null;

  /**
   * Get all emergency kit items
   */
  getKitItems(): EmergencyKitItem[] {
    return this.kitItems;
  }

  /**
   * Get kit items by category
   */
  getKitItemsByCategory(category: EmergencyKitItem['category']): EmergencyKitItem[] {
    return this.kitItems.filter((item) => item.category === category);
  }

  /**
   * Toggle item checked status
   */
  toggleKitItem(itemId: string): void {
    const item = this.kitItems.find((i) => i.id === itemId);
    if (item) {
      item.checked = !item.checked;
    }
  }

  /**
   * Update item quantity
   */
  updateItemQuantity(itemId: string, quantity: number): void {
    const item = this.kitItems.find((i) => i.id === itemId);
    if (item) {
      item.quantity = Math.max(0, quantity);
    }
  }

  /**
   * Get kit completion percentage
   */
  getKitCompletion(): number {
    if (this.kitItems.length === 0) return 0;
    const essentialItems = this.kitItems.filter((item) => item.priority === 'essential');
    if (essentialItems.length === 0) return 0;
    const checkedEssential = essentialItems.filter((item) => item.checked).length;
    return Math.round((checkedEssential / essentialItems.length) * 100);
  }

  /**
   * Get preparedness score
   */
  getPreparednessScore(): number {
    const kitScore = this.getKitCompletion();
    const planScore = this.emergencyPlan ? 50 : 0;
    return Math.round((kitScore * 0.6) + (planScore * 0.4));
  }

  /**
   * Get emergency plan
   */
  getEmergencyPlan(): EmergencyPlan | null {
    return this.emergencyPlan;
  }

  /**
   * Save emergency plan
   */
  saveEmergencyPlan(plan: EmergencyPlan): void {
    this.emergencyPlan = plan;
  }

  /**
   * Get preparedness quiz
   */
  getQuiz(): PreparednessQuiz[] {
    return PREPAREDNESS_QUIZ;
  }

  /**
   * Calculate quiz score
   */
  calculateQuizScore(answers: { [questionId: string]: number }): {
    score: number;
    total: number;
    percentage: number;
  } {
    let correct = 0;
    const total = PREPAREDNESS_QUIZ.length;

    PREPAREDNESS_QUIZ.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });

    return {
      score: correct,
      total,
      percentage: Math.round((correct / total) * 100),
    };
  }
}

export const preparednessService = new PreparednessService();

