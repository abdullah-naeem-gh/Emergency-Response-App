export interface EmergencyContact {
  id: string;
  name: string;
  category: 'AMBULANCE' | 'POLICE' | 'DISASTER_SQUAD';
  phone: string;
  city: 'ALL' | 'KARACHI' | 'LAHORE' | 'ISLAMABAD' | 'QUETTA' | 'PESHAWAR';
  is24_7: boolean;
}

export const contactsData: EmergencyContact[] = [
  // National Emergency Services (ALL cities)
  {
    id: 'contact-001',
    name: 'Rescue 1122',
    category: 'DISASTER_SQUAD',
    phone: '1122',
    city: 'ALL',
    is24_7: true,
  },
  {
    id: 'contact-002',
    name: 'Police Emergency',
    category: 'POLICE',
    phone: '15',
    city: 'ALL',
    is24_7: true,
  },
  {
    id: 'contact-003',
    name: 'Edhi Foundation',
    category: 'AMBULANCE',
    phone: '115',
    city: 'ALL',
    is24_7: true,
  },
  {
    id: 'contact-004',
    name: 'Chippa Welfare Association',
    category: 'AMBULANCE',
    phone: '1020',
    city: 'ALL',
    is24_7: true,
  },
  {
    id: 'contact-005',
    name: 'Rangers Helpline',
    category: 'POLICE',
    phone: '1100',
    city: 'ALL',
    is24_7: true,
  },

  // Karachi Specific
  {
    id: 'contact-006',
    name: 'Edhi Karachi',
    category: 'AMBULANCE',
    phone: '021-111-115-115',
    city: 'KARACHI',
    is24_7: true,
  },
  {
    id: 'contact-007',
    name: 'Chippa Karachi',
    category: 'AMBULANCE',
    phone: '021-1020',
    city: 'KARACHI',
    is24_7: true,
  },
  {
    id: 'contact-008',
    name: 'Karachi Police',
    category: 'POLICE',
    phone: '021-15',
    city: 'KARACHI',
    is24_7: true,
  },
  {
    id: 'contact-009',
    name: 'Sindh Rangers',
    category: 'POLICE',
    phone: '021-99202600',
    city: 'KARACHI',
    is24_7: true,
  },
  {
    id: 'contact-010',
    name: 'Jinnah Hospital Emergency',
    category: 'AMBULANCE',
    phone: '021-99201245',
    city: 'KARACHI',
    is24_7: true,
  },
  {
    id: 'contact-011',
    name: 'Civil Hospital Karachi',
    category: 'AMBULANCE',
    phone: '021-99215700',
    city: 'KARACHI',
    is24_7: true,
  },

  // Lahore Specific
  {
    id: 'contact-012',
    name: 'Edhi Lahore',
    category: 'AMBULANCE',
    phone: '042-111-115-115',
    city: 'LAHORE',
    is24_7: true,
  },
  {
    id: 'contact-013',
    name: 'Lahore Police',
    category: 'POLICE',
    phone: '042-15',
    city: 'LAHORE',
    is24_7: true,
  },
  {
    id: 'contact-014',
    name: 'Rescue 1122 Lahore',
    category: 'DISASTER_SQUAD',
    phone: '042-1122',
    city: 'LAHORE',
    is24_7: true,
  },
  {
    id: 'contact-015',
    name: 'Services Hospital Lahore',
    category: 'AMBULANCE',
    phone: '042-9200123',
    city: 'LAHORE',
    is24_7: true,
  },
  {
    id: 'contact-016',
    name: 'Jinnah Hospital Lahore',
    category: 'AMBULANCE',
    phone: '042-9200124',
    city: 'LAHORE',
    is24_7: true,
  },

  // Islamabad Specific
  {
    id: 'contact-017',
    name: 'Edhi Islamabad',
    category: 'AMBULANCE',
    phone: '051-111-115-115',
    city: 'ISLAMABAD',
    is24_7: true,
  },
  {
    id: 'contact-018',
    name: 'Islamabad Police',
    category: 'POLICE',
    phone: '051-15',
    city: 'ISLAMABAD',
    is24_7: true,
  },
  {
    id: 'contact-019',
    name: 'Rescue 1122 Islamabad',
    category: 'DISASTER_SQUAD',
    phone: '051-1122',
    city: 'ISLAMABAD',
    is24_7: true,
  },
  {
    id: 'contact-020',
    name: 'PIMS Hospital Emergency',
    category: 'AMBULANCE',
    phone: '051-9261170',
    city: 'ISLAMABAD',
    is24_7: true,
  },
  {
    id: 'contact-021',
    name: 'Shifa International Hospital',
    category: 'AMBULANCE',
    phone: '051-8464646',
    city: 'ISLAMABAD',
    is24_7: true,
  },

  // Quetta Specific
  {
    id: 'contact-022',
    name: 'Edhi Quetta',
    category: 'AMBULANCE',
    phone: '081-111-115-115',
    city: 'QUETTA',
    is24_7: true,
  },
  {
    id: 'contact-023',
    name: 'Quetta Police',
    category: 'POLICE',
    phone: '081-15',
    city: 'QUETTA',
    is24_7: true,
  },
  {
    id: 'contact-024',
    name: 'Rescue 1122 Quetta',
    category: 'DISASTER_SQUAD',
    phone: '081-1122',
    city: 'QUETTA',
    is24_7: true,
  },
  {
    id: 'contact-025',
    name: 'Civil Hospital Quetta',
    category: 'AMBULANCE',
    phone: '081-9201700',
    city: 'QUETTA',
    is24_7: true,
  },

  // Peshawar Specific
  {
    id: 'contact-026',
    name: 'Edhi Peshawar',
    category: 'AMBULANCE',
    phone: '091-111-115-115',
    city: 'PESHAWAR',
    is24_7: true,
  },
  {
    id: 'contact-027',
    name: 'Peshawar Police',
    category: 'POLICE',
    phone: '091-15',
    city: 'PESHAWAR',
    is24_7: true,
  },
  {
    id: 'contact-028',
    name: 'Rescue 1122 Peshawar',
    category: 'DISASTER_SQUAD',
    phone: '091-1122',
    city: 'PESHAWAR',
    is24_7: true,
  },
  {
    id: 'contact-029',
    name: 'Lady Reading Hospital',
    category: 'AMBULANCE',
    phone: '091-9216770',
    city: 'PESHAWAR',
    is24_7: true,
  },
  {
    id: 'contact-030',
    name: 'Khyber Teaching Hospital',
    category: 'AMBULANCE',
    phone: '091-9217451',
    city: 'PESHAWAR',
    is24_7: true,
  },
];

