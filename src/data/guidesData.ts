export interface Guide {
  id: string;
  title: string;
  category: 'FIRST_AID' | 'EVACUATION' | 'SURVIVAL';
  tags: string[];
  steps: Array<{
    stepNumber: number;
    text: string;
    imageUrl: string;
  }>;
  isOfflineReady: boolean;
}

export const guidesData: Guide[] = [
  {
    id: 'guide-001',
    title: 'CPR for Drowning Victim',
    category: 'FIRST_AID',
    tags: ['CPR', 'drowning', 'resuscitation', 'emergency', 'breathing', 'cardiac'],
    steps: [
      {
        stepNumber: 1,
        text: 'Check for responsiveness. Tap the victim\'s shoulder and shout "Are you okay?"',
        imageUrl: 'https://example.com/cpr-step1.jpg',
      },
      {
        stepNumber: 2,
        text: 'Call for emergency help immediately. Dial 1122 or 115 while starting CPR.',
        imageUrl: 'https://example.com/cpr-step2.jpg',
      },
      {
        stepNumber: 3,
        text: 'Open the airway. Tilt the head back and lift the chin to clear the airway.',
        imageUrl: 'https://example.com/cpr-step3.jpg',
      },
      {
        stepNumber: 4,
        text: 'Check for breathing. Look, listen, and feel for breath for 10 seconds.',
        imageUrl: 'https://example.com/cpr-step4.jpg',
      },
      {
        stepNumber: 5,
        text: 'If not breathing, give 2 rescue breaths. Pinch nose, cover mouth, and blow until chest rises.',
        imageUrl: 'https://example.com/cpr-step5.jpg',
      },
      {
        stepNumber: 6,
        text: 'Begin chest compressions. Place hands on center of chest, push hard and fast (100-120 compressions per minute).',
        imageUrl: 'https://example.com/cpr-step6.jpg',
      },
      {
        stepNumber: 7,
        text: 'Continue cycles of 30 compressions and 2 breaths until help arrives or victim shows signs of life.',
        imageUrl: 'https://example.com/cpr-step7.jpg',
      },
    ],
    isOfflineReady: true,
  },
  {
    id: 'guide-002',
    title: 'Fracture Binding and Immobilization',
    category: 'FIRST_AID',
    tags: ['fracture', 'broken bone', 'splint', 'immobilization', 'injury'],
    steps: [
      {
        stepNumber: 1,
        text: 'Do not move the victim unless in immediate danger. Keep the injured area still.',
        imageUrl: 'https://example.com/fracture-step1.jpg',
      },
      {
        stepNumber: 2,
        text: 'Check for bleeding. Apply direct pressure with clean cloth if bleeding is present.',
        imageUrl: 'https://example.com/fracture-step2.jpg',
      },
      {
        stepNumber: 3,
        text: 'Create a splint using available materials (boards, rolled newspapers, or clothing).',
        imageUrl: 'https://example.com/fracture-step3.jpg',
      },
      {
        stepNumber: 4,
        text: 'Place splint on both sides of the fracture. Ensure it extends beyond the joints above and below.',
        imageUrl: 'https://example.com/fracture-step4.jpg',
      },
      {
        stepNumber: 5,
        text: 'Secure the splint with bandages, cloth strips, or belts. Tie firmly but not too tight.',
        imageUrl: 'https://example.com/fracture-step5.jpg',
      },
      {
        stepNumber: 6,
        text: 'Check circulation below the injury. Ensure fingers/toes remain warm and have feeling.',
        imageUrl: 'https://example.com/fracture-step6.jpg',
      },
      {
        stepNumber: 7,
        text: 'Keep the injured area elevated if possible. Apply ice wrapped in cloth to reduce swelling.',
        imageUrl: 'https://example.com/fracture-step7.jpg',
      },
      {
        stepNumber: 8,
        text: 'Seek medical attention immediately. Do not attempt to realign the bone.',
        imageUrl: 'https://example.com/fracture-step8.jpg',
      },
    ],
    isOfflineReady: true,
  },
  {
    id: 'guide-003',
    title: 'Snake Bite Treatment',
    category: 'FIRST_AID',
    tags: ['snake bite', 'venom', 'poison', 'wildlife', 'emergency'],
    steps: [
      {
        stepNumber: 1,
        text: 'Stay calm and keep the victim still. Movement increases venom spread through the bloodstream.',
        imageUrl: 'https://example.com/snake-step1.jpg',
      },
      {
        stepNumber: 2,
        text: 'Remove tight clothing or jewelry near the bite area before swelling occurs.',
        imageUrl: 'https://example.com/snake-step2.jpg',
      },
      {
        stepNumber: 3,
        text: 'Keep the bite area below heart level to slow venom circulation.',
        imageUrl: 'https://example.com/snake-step3.jpg',
      },
      {
        stepNumber: 4,
        text: 'Clean the wound gently with soap and water if available. Do not use alcohol.',
        imageUrl: 'https://example.com/snake-step4.jpg',
      },
      {
        stepNumber: 5,
        text: 'Cover the bite with a clean, dry dressing. Do not apply ice or tourniquet.',
        imageUrl: 'https://example.com/snake-step5.jpg',
      },
      {
        stepNumber: 6,
        text: 'Note the snake\'s appearance if safe to do so. This helps identify antivenom needed.',
        imageUrl: 'https://example.com/snake-step6.jpg',
      },
      {
        stepNumber: 7,
        text: 'Seek immediate medical attention. Call 1122 or 115. Antivenom may be required.',
        imageUrl: 'https://example.com/snake-step7.jpg',
      },
      {
        stepNumber: 8,
        text: 'Monitor breathing and heart rate. Be prepared to perform CPR if victim stops breathing.',
        imageUrl: 'https://example.com/snake-step8.jpg',
      },
    ],
    isOfflineReady: true,
  },
  {
    id: 'guide-004',
    title: 'Fire Exit Strategies',
    category: 'EVACUATION',
    tags: ['fire', 'evacuation', 'escape', 'safety', 'emergency exit'],
    steps: [
      {
        stepNumber: 1,
        text: 'Stay calm and alert. Do not panic. Assess the situation quickly.',
        imageUrl: 'https://example.com/fire-step1.jpg',
      },
      {
        stepNumber: 2,
        text: 'Check door handles before opening. If hot, do not open. Find alternative exit.',
        imageUrl: 'https://example.com/fire-step2.jpg',
      },
      {
        stepNumber: 3,
        text: 'Stay low to the ground. Smoke rises, so crawl if necessary. Cover nose and mouth with wet cloth.',
        imageUrl: 'https://example.com/fire-step3.jpg',
      },
      {
        stepNumber: 4,
        text: 'Use stairs, never elevators during a fire. Elevators may trap you or malfunction.',
        imageUrl: 'https://example.com/fire-step4.jpg',
      },
      {
        stepNumber: 5,
        text: 'Close doors behind you as you exit to slow fire spread.',
        imageUrl: 'https://example.com/fire-step5.jpg',
      },
      {
        stepNumber: 6,
        text: 'If trapped, seal gaps under doors with wet towels. Signal for help from windows.',
        imageUrl: 'https://example.com/fire-step6.jpg',
      },
      {
        stepNumber: 7,
        text: 'Once outside, move to a safe distance. Do not re-enter the building.',
        imageUrl: 'https://example.com/fire-step7.jpg',
      },
      {
        stepNumber: 8,
        text: 'Call emergency services (15 or 1122) once safe. Account for all family members.',
        imageUrl: 'https://example.com/fire-step8.jpg',
      },
    ],
    isOfflineReady: true,
  },
  {
    id: 'guide-005',
    title: 'Flood Water Wading Safety',
    category: 'SURVIVAL',
    tags: ['flood', 'water', 'safety', 'monsoon', 'survival'],
    steps: [
      {
        stepNumber: 1,
        text: 'Avoid wading through flood water if possible. Just 6 inches of moving water can knock you down.',
        imageUrl: 'https://example.com/flood-step1.jpg',
      },
      {
        stepNumber: 2,
        text: 'If you must wade, use a stick or pole to test ground depth and stability ahead of you.',
        imageUrl: 'https://example.com/flood-step2.jpg',
      },
      {
        stepNumber: 3,
        text: 'Wear sturdy shoes. Never go barefoot. Hidden debris, glass, and sharp objects are common.',
        imageUrl: 'https://example.com/flood-step3.jpg',
      },
      {
        stepNumber: 4,
        text: 'Move slowly and carefully. Fast-moving water can be deceptively powerful.',
        imageUrl: 'https://example.com/flood-step4.jpg',
      },
      {
        stepNumber: 5,
        text: 'Avoid electrical wires and poles. Flood water can conduct electricity from downed power lines.',
        imageUrl: 'https://example.com/flood-step5.jpg',
      },
      {
        stepNumber: 6,
        text: 'Do not attempt to drive through flooded areas. Turn around, don\'t drown. Most flood deaths occur in vehicles.',
        imageUrl: 'https://example.com/flood-step6.jpg',
      },
      {
        stepNumber: 7,
        text: 'After wading, wash thoroughly with clean water and soap. Flood water may contain sewage and contaminants.',
        imageUrl: 'https://example.com/flood-step7.jpg',
      },
      {
        stepNumber: 8,
        text: 'Watch for signs of infection. Seek medical attention if you develop fever, rashes, or wounds.',
        imageUrl: 'https://example.com/flood-step8.jpg',
      },
    ],
    isOfflineReady: true,
  },
];

