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
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'Call for emergency help immediately. Dial 1122 or 115 while starting CPR.',
        imageUrl: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'Open the airway. Tilt the head back and lift the chin to clear the airway.',
        imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'Check for breathing. Look, listen, and feel for breath for 10 seconds.',
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'If not breathing, give 2 rescue breaths. Pinch nose, cover mouth, and blow until chest rises.',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'Begin chest compressions. Place hands on center of chest, push hard and fast (100-120 compressions per minute).',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'Continue cycles of 30 compressions and 2 breaths until help arrives or victim shows signs of life.',
        imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&auto=format&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'Check for bleeding. Apply direct pressure with clean cloth if bleeding is present.',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'Create a splint using available materials (boards, rolled newspapers, or clothing).',
        imageUrl: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'Place splint on both sides of the fracture. Ensure it extends beyond the joints above and below.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'Secure the splint with bandages, cloth strips, or belts. Tie firmly but not too tight.',
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'Check circulation below the injury. Ensure fingers/toes remain warm and have feeling.',
        imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'Keep the injured area elevated if possible. Apply ice wrapped in cloth to reduce swelling.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 8,
        text: 'Seek medical attention immediately. Do not attempt to realign the bone.',
        imageUrl: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=800&auto=format&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'Remove tight clothing or jewelry near the bite area before swelling occurs.',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'Keep the bite area below heart level to slow venom circulation.',
        imageUrl: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'Clean the wound gently with soap and water if available. Do not use alcohol.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'Cover the bite with a clean, dry dressing. Do not apply ice or tourniquet.',
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'Note the snake\'s appearance if safe to do so. This helps identify antivenom needed.',
        imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'Seek immediate medical attention. Call 1122 or 115. Antivenom may be required.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 8,
        text: 'Monitor breathing and heart rate. Be prepared to perform CPR if victim stops breathing.',
        imageUrl: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=800&auto=format&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'Check door handles before opening. If hot, do not open. Find alternative exit.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'Stay low to the ground. Smoke rises, so crawl if necessary. Cover nose and mouth with wet cloth.',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'Use stairs, never elevators during a fire. Elevators may trap you or malfunction.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'Close doors behind you as you exit to slow fire spread.',
        imageUrl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'If trapped, seal gaps under doors with wet towels. Signal for help from windows.',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'Once outside, move to a safe distance. Do not re-enter the building.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 8,
        text: 'Call emergency services (15 or 1122) once safe. Account for all family members.',
        imageUrl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&auto=format&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'If you must wade, use a stick or pole to test ground depth and stability ahead of you.',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'Wear sturdy shoes. Never go barefoot. Hidden debris, glass, and sharp objects are common.',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'Move slowly and carefully. Fast-moving water can be deceptively powerful.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'Avoid electrical wires and poles. Flood water can conduct electricity from downed power lines.',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'Do not attempt to drive through flooded areas. Turn around, don\'t drown. Most flood deaths occur in vehicles.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'After wading, wash thoroughly with clean water and soap. Flood water may contain sewage and contaminants.',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 8,
        text: 'Watch for signs of infection. Seek medical attention if you develop fever, rashes, or wounds.',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
      },
    ],
    isOfflineReady: true,
  },
  {
    id: 'guide-006',
    title: 'Earthquake Safety Protocol',
    category: 'EVACUATION',
    tags: ['earthquake', 'seismic', 'safety', 'evacuation', 'natural disaster'],
    steps: [
      {
        stepNumber: 1,
        text: 'Drop, Cover, and Hold On. Drop to your hands and knees, cover your head and neck, and hold onto sturdy furniture.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'Stay away from windows, glass, and heavy objects that could fall. Move to an interior wall or doorway.',
        imageUrl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'If outdoors, move to an open area away from buildings, trees, and power lines. Stay low to the ground.',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'If in a vehicle, pull over to a safe location and stay inside. Avoid bridges and overpasses.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'After shaking stops, check for injuries. Provide first aid to yourself and others if needed.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'Check for gas leaks. If you smell gas, turn off the main valve and evacuate immediately.',
        imageUrl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'Be prepared for aftershocks. Stay away from damaged buildings and follow official instructions.',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 8,
        text: 'Use text messages instead of phone calls to communicate. Phone lines may be overwhelmed.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
    ],
    isOfflineReady: true,
  },
  {
    id: 'guide-007',
    title: 'Heat Stroke Emergency Treatment',
    category: 'FIRST_AID',
    tags: ['heat stroke', 'hyperthermia', 'heat exhaustion', 'emergency', 'medical'],
    steps: [
      {
        stepNumber: 1,
        text: 'Move the person to a cool, shaded area immediately. Remove excess clothing and accessories.',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'Call emergency services (1122 or 115) immediately. Heat stroke is a medical emergency.',
        imageUrl: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'Cool the person rapidly. Apply cool, wet cloths to the head, neck, armpits, and groin areas.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'If available, immerse in cool water or use a garden hose to spray cool water on the body.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'Monitor body temperature. Continue cooling until body temperature drops to 101-102°F (38-39°C).',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'Do not give the person anything to drink if they are unconscious or confused.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'If conscious and alert, provide cool water or sports drinks to rehydrate slowly.',
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 8,
        text: 'Stay with the person until medical help arrives. Monitor breathing and consciousness.',
        imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&auto=format&fit=crop',
      },
    ],
    isOfflineReady: true,
  },
  {
    id: 'guide-008',
    title: 'Building Evacuation Procedures',
    category: 'EVACUATION',
    tags: ['evacuation', 'building', 'safety', 'emergency exit', 'fire safety'],
    steps: [
      {
        stepNumber: 1,
        text: 'Know your building\'s evacuation plan. Identify all exits and emergency assembly points.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'When alarm sounds, remain calm. Do not use elevators. Use stairs only.',
        imageUrl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'Close doors behind you as you exit. This helps contain fire and smoke.',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'Stay low if smoke is present. Crawl on hands and knees, covering your mouth with a cloth.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'Feel doors before opening. If hot, do not open. Find an alternative route.',
        imageUrl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'Assist others if safe to do so. Help elderly, disabled, or injured persons evacuate.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'Proceed to the designated assembly point. Do not re-enter the building.',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 8,
        text: 'Account for all personnel. Report missing persons to emergency responders.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
    ],
    isOfflineReady: true,
  },
  {
    id: 'guide-009',
    title: 'Water Purification Methods',
    category: 'SURVIVAL',
    tags: ['water', 'purification', 'survival', 'clean water', 'emergency'],
    steps: [
      {
        stepNumber: 1,
        text: 'Boil water for at least 1 minute (3 minutes at high altitude). This kills most pathogens.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'Use water purification tablets. Follow package instructions for proper dosage and wait time.',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'Filter water through clean cloth or coffee filter to remove large particles and sediment.',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'Use portable water filters with 0.1 micron or smaller pores to remove bacteria and protozoa.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'Add 8 drops of unscented household bleach per gallon of water. Wait 30 minutes before drinking.',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'Use UV light purifiers if available. Follow manufacturer instructions for exposure time.',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'Store purified water in clean, covered containers. Label with date of purification.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 8,
        text: 'Test water quality if possible. Clear, odorless water is generally safer than cloudy or smelly water.',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
      },
    ],
    isOfflineReady: true,
  },
  {
    id: 'guide-010',
    title: 'Emergency Shelter Building',
    category: 'SURVIVAL',
    tags: ['shelter', 'survival', 'emergency', 'outdoor', 'protection'],
    steps: [
      {
        stepNumber: 1,
        text: 'Choose a safe location. Avoid low areas, flood zones, and areas with falling hazards.',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'Find or create a windbreak. Use natural features like rocks, trees, or build a wall.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'Build a lean-to shelter. Prop a large branch against a tree or rock at a 45-degree angle.',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'Cover the frame with leaves, branches, or a tarp. Layer materials for better insulation.',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'Create a raised bed. Use branches, leaves, or clothing to keep yourself off the cold ground.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'Seal gaps to prevent wind and rain. Use additional branches, leaves, or available materials.',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'Make the shelter small enough to retain body heat but large enough to lie down comfortably.',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 8,
        text: 'Test the shelter before dark. Make improvements and ensure it will protect you from the elements.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
    ],
    isOfflineReady: true,
  },
  {
    id: 'guide-011',
    title: 'Basic Wound Care and Dressing',
    category: 'FIRST_AID',
    tags: ['wound', 'first aid', 'bleeding', 'dressing', 'medical'],
    steps: [
      {
        stepNumber: 1,
        text: 'Wash your hands thoroughly with soap and water before treating any wound.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'Stop the bleeding by applying direct pressure with a clean cloth or bandage.',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'Clean the wound gently with clean water. Remove dirt and debris if visible.',
        imageUrl: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'Apply an antiseptic solution if available. Avoid hydrogen peroxide on deep wounds.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'Cover the wound with a sterile bandage or clean cloth. Secure with medical tape.',
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'Change the dressing daily or when it becomes wet or dirty. Keep the wound clean and dry.',
        imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'Watch for signs of infection: redness, swelling, pus, or increased pain. Seek medical help if these occur.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 8,
        text: 'For deep wounds or severe bleeding, seek immediate medical attention. Apply pressure and elevate the wound.',
        imageUrl: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=800&auto=format&fit=crop',
      },
    ],
    isOfflineReady: true,
  },
  {
    id: 'guide-012',
    title: 'Power Outage Survival Guide',
    category: 'SURVIVAL',
    tags: ['power outage', 'blackout', 'survival', 'emergency', 'preparedness'],
    steps: [
      {
        stepNumber: 1,
        text: 'Keep flashlights and batteries readily available. Avoid using candles to prevent fire hazards.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'Unplug sensitive electronics to protect them from power surges when electricity returns.',
        imageUrl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'Keep refrigerator and freezer doors closed. Food will stay cold for 4 hours in fridge, 48 hours in freezer.',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'Use battery-powered or hand-crank radios to stay informed about the situation and updates.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'Conserve phone battery. Use power-saving mode and limit phone use to essential communications only.',
        imageUrl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'Stay hydrated. Drink plenty of water, especially in hot weather without air conditioning.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'Check on neighbors, especially elderly or those with medical equipment requiring electricity.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 8,
        text: 'Have an emergency kit ready with water, non-perishable food, first aid supplies, and medications.',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop',
      },
    ],
    isOfflineReady: true,
  },
  {
    id: 'guide-013',
    title: 'Tsunami Evacuation Safety',
    category: 'EVACUATION',
    tags: ['tsunami', 'evacuation', 'coastal', 'natural disaster', 'safety'],
    steps: [
      {
        stepNumber: 1,
        text: 'If you feel a strong earthquake near the coast, immediately move to higher ground or inland.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 2,
        text: 'Watch for natural warning signs: unusual ocean behavior, rapid water retreat, or loud ocean roar.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 3,
        text: 'Evacuate immediately. Do not wait for official warnings. Every second counts.',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 4,
        text: 'Move to high ground at least 100 feet (30 meters) above sea level or 2 miles (3 km) inland.',
        imageUrl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 5,
        text: 'Never go to the beach to watch a tsunami. If you can see the wave, you are too close to escape.',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 6,
        text: 'If caught in water, grab onto something that floats. Hold on tightly and protect your head.',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 7,
        text: 'Stay away from the coast until officials declare it safe. Multiple waves may follow the first.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      },
      {
        stepNumber: 8,
        text: 'After the tsunami, avoid flood waters. They may contain dangerous debris, sewage, or downed power lines.',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
      },
    ],
    isOfflineReady: true,
  },
];

