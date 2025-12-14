export interface NewsItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  location: string;
  timestamp: string;
  source: 'NDMA' | 'Met Dept' | 'Crowdsourced';
  content: string;
}

export const alertsData: NewsItem[] = [
  // Critical Flood Warnings in Sindh
  {
    id: 'alert-001',
    title: 'Flash Flood Warning in Malir, Karachi',
    severity: 'CRITICAL',
    location: 'Karachi, Sindh',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: 'NDMA',
    content: 'Heavy rainfall expected in Malir district. All residents in low-lying areas are advised to evacuate immediately. Water levels rising rapidly in Malir River.',
  },
  {
    id: 'alert-002',
    title: 'River Indus Overflow Alert - Hyderabad',
    severity: 'CRITICAL',
    location: 'Hyderabad, Sindh',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    source: 'NDMA',
    content: 'River Indus water levels have exceeded danger mark. Evacuation orders issued for areas near the riverbank. Emergency shelters set up at Hyderabad Stadium.',
  },
  {
    id: 'alert-003',
    title: 'Urban Flooding in Clifton, Karachi',
    severity: 'CRITICAL',
    location: 'Karachi, Sindh',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    source: 'Crowdsourced',
    content: 'Severe waterlogging reported in Clifton Block 9. Main roads blocked. Avoid travel. Multiple vehicles stranded.',
  },
  {
    id: 'alert-004',
    title: 'Drainage System Failure - Korangi',
    severity: 'WARNING',
    location: 'Karachi, Sindh',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    source: 'Met Dept',
    content: 'Drainage system overwhelmed in Korangi Industrial Area. Expect delays and water accumulation on major roads.',
  },
  {
    id: 'alert-005',
    title: 'Monsoon Alert - Thatta District',
    severity: 'WARNING',
    location: 'Thatta, Sindh',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    source: 'NDMA',
    content: 'Heavy monsoon rains forecasted for next 48 hours. Coastal areas at risk. Fishermen advised to return to shore.',
  },
  {
    id: 'alert-006',
    title: 'Flood Warning - Sukkur Barrage',
    severity: 'CRITICAL',
    location: 'Sukkur, Sindh',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    source: 'NDMA',
    content: 'Sukkur Barrage water discharge increased. Downstream areas including Shikarpur and Larkana on high alert.',
  },

  // Earthquake Alerts in Northern Pakistan
  {
    id: 'alert-007',
    title: 'Earthquake Alert - Swat Valley',
    severity: 'WARNING',
    location: 'Swat, Khyber Pakhtunkhwa',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    source: 'Met Dept',
    content: 'Seismic activity detected in Swat region. Magnitude 4.2 recorded. No immediate damage reported. Stay alert for aftershocks.',
  },
  {
    id: 'alert-008',
    title: 'Aftershock Warning - Northern Areas',
    severity: 'WARNING',
    location: 'Gilgit-Baltistan',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    source: 'Met Dept',
    content: 'Aftershocks expected following yesterday\'s earthquake. Residents advised to stay away from damaged structures.',
  },
  {
    id: 'alert-009',
    title: 'Landslide Risk - Karakoram Highway',
    severity: 'CRITICAL',
    location: 'Hunza, Gilgit-Baltistan',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    source: 'NDMA',
    content: 'Heavy rainfall and seismic activity increase landslide risk on KKH. Travel suspended between Hunza and Gilgit. Alternative routes recommended.',
  },
  {
    id: 'alert-010',
    title: 'Earthquake - Chitral Region',
    severity: 'WARNING',
    location: 'Chitral, Khyber Pakhtunkhwa',
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    source: 'Met Dept',
    content: 'Earthquake magnitude 4.8 recorded in Chitral. Minor structural damage reported. Emergency teams deployed.',
  },
  {
    id: 'alert-011',
    title: 'Seismic Activity - Muzaffarabad',
    severity: 'INFO',
    location: 'Muzaffarabad, Azad Kashmir',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    source: 'Met Dept',
    content: 'Minor tremors felt in Muzaffarabad. No damage reported. Monitoring continues.',
  },

  // Rain and Weather Alerts in Punjab
  {
    id: 'alert-012',
    title: 'Heavy Rainfall Expected - Lahore',
    severity: 'WARNING',
    location: 'Lahore, Punjab',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    source: 'Met Dept',
    content: 'Heavy rainfall forecasted for Lahore and surrounding areas. Expected 50-80mm in next 24 hours. Low-lying areas may experience waterlogging.',
  },
  {
    id: 'alert-013',
    title: 'Monsoon Alert - Rawalpindi',
    severity: 'WARNING',
    location: 'Rawalpindi, Punjab',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: 'Met Dept',
    content: 'Active monsoon system approaching Rawalpindi. Expect moderate to heavy rainfall. Traffic disruptions possible.',
  },
  {
    id: 'alert-014',
    title: 'Urban Flooding - Faisalabad',
    severity: 'WARNING',
    location: 'Faisalabad, Punjab',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    source: 'Crowdsourced',
    content: 'Waterlogging reported in multiple areas of Faisalabad. Main bazaar and surrounding streets affected.',
  },
  {
    id: 'alert-015',
    title: 'Rain Alert - Multan',
    severity: 'INFO',
    location: 'Multan, Punjab',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    source: 'Met Dept',
    content: 'Light to moderate rainfall expected in Multan. Umbrellas recommended. No major disruptions anticipated.',
  },
  {
    id: 'alert-016',
    title: 'Thunderstorm Warning - Sialkot',
    severity: 'WARNING',
    location: 'Sialkot, Punjab',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    source: 'Met Dept',
    content: 'Thunderstorms with heavy rain expected in Sialkot. Wind speeds up to 60 km/h. Secure outdoor objects.',
  },
  {
    id: 'alert-017',
    title: 'Rainfall - Gujranwala',
    severity: 'INFO',
    location: 'Gujranwala, Punjab',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    source: 'Met Dept',
    content: 'Moderate rainfall in Gujranwala. Roads may be slippery. Drive with caution.',
  },

  // General Alerts
  {
    id: 'alert-018',
    title: 'Heat Wave Warning - Southern Punjab',
    severity: 'WARNING',
    location: 'Bahawalpur, Punjab',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    source: 'Met Dept',
    content: 'Extreme heat conditions expected. Temperature may reach 45°C. Stay hydrated and avoid outdoor activities during peak hours.',
  },
  {
    id: 'alert-019',
    title: 'Dust Storm Alert - Quetta',
    severity: 'WARNING',
    location: 'Quetta, Balochistan',
    timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    source: 'Met Dept',
    content: 'Dust storm approaching Quetta. Visibility reduced. Residents advised to stay indoors. Respiratory patients take precautions.',
  },
  {
    id: 'alert-020',
    title: 'Cyclone Warning - Coastal Areas',
    severity: 'CRITICAL',
    location: 'Gwadar, Balochistan',
    timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    source: 'NDMA',
    content: 'Cyclone formation detected in Arabian Sea. Coastal areas of Balochistan and Sindh on alert. Fishermen must return immediately. Evacuation plans activated.',
  },
];

