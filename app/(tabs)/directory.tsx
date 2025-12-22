import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import * as Haptics from 'expo-haptics';
import { ChevronDown, Phone } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Linking, Modal, SectionList, Text, TouchableOpacity, View } from 'react-native';
import { contactsData, EmergencyContact } from '../../src/data/contactsData';

type CityFilter = 'ALL' | 'KARACHI' | 'LAHORE' | 'ISLAMABAD' | 'QUETTA' | 'PESHAWAR';

interface SectionData {
  title: string;
  data: EmergencyContact[];
}

const CITY_OPTIONS: { value: CityFilter; label: string }[] = [
  { value: 'ALL', label: 'All Pakistan' },
  { value: 'KARACHI', label: 'Karachi' },
  { value: 'LAHORE', label: 'Lahore' },
  { value: 'ISLAMABAD', label: 'Islamabad' },
  { value: 'QUETTA', label: 'Quetta' },
  { value: 'PESHAWAR', label: 'Peshawar' },
];

// Group contacts into National Services and NGOs
const groupContacts = (contacts: EmergencyContact[]): SectionData[] => {
  const nationalServices: EmergencyContact[] = [];
  const ngos: EmergencyContact[] = [];
  const others: EmergencyContact[] = [];

  contacts.forEach((contact) => {
    const nameLower = contact.name.toLowerCase();
    if (
      nameLower.includes('1122') ||
      nameLower.includes('police') ||
      nameLower.includes('rangers')
    ) {
      nationalServices.push(contact);
    } else if (nameLower.includes('edhi') || nameLower.includes('chippa')) {
      ngos.push(contact);
    } else {
      others.push(contact);
    }
  });

  const sections: SectionData[] = [];
  if (nationalServices.length > 0) {
    sections.push({ title: 'National Services', data: nationalServices });
  }
  if (ngos.length > 0) {
    sections.push({ title: 'NGOs', data: ngos });
  }
  if (others.length > 0) {
    sections.push({ title: 'Other Services', data: others });
  }

  return sections;
};

export default function DirectoryScreen() {
  const { themeColors } = useAccessibility();
  const [selectedCity, setSelectedCity] = useState<CityFilter>('ALL');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Filter contacts by city
  const filteredContacts = useMemo(() => {
    if (selectedCity === 'ALL') {
      return contactsData;
    }
    return contactsData.filter(
      (contact) => contact.city === 'ALL' || contact.city === selectedCity
    );
  }, [selectedCity]);

  // Group filtered contacts
  const sections = useMemo(() => groupContacts(filteredContacts), [filteredContacts]);

  const handleCall = async (phone: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const url = `tel:${phone}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.error('Cannot open phone dialer');
      }
    } catch (error) {
      console.error('Error opening phone dialer:', error);
    }
  };

  const handleCitySelect = (city: CityFilter) => {
    Haptics.selectionAsync();
    setSelectedCity(city);
    setShowCityDropdown(false);
  };

  const selectedCityLabel = CITY_OPTIONS.find((opt) => opt.value === selectedCity)?.label || 'All Pakistan';

  return (
    <ThemedView className="flex-1">
      <View className="flex-1 px-4 pt-2">
        {/* Header */}
        <View className="mb-4">
          <ThemedText className="text-3xl font-bold mb-4">Emergency Directory</ThemedText>

          {/* City Filter Dropdown */}
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setShowCityDropdown(true);
            }}
            style={{
              backgroundColor: themeColors.card,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: themeColors.border,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 60,
            }}
          >
            <ThemedText className="text-base font-semibold">{selectedCityLabel}</ThemedText>
            <ChevronDown size={20} color={themeColors.text} style={{ opacity: 0.7 }} />
          </TouchableOpacity>
        </View>

        {/* SectionList */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title } }) => (
            <View style={{ backgroundColor: themeColors.background, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 8 }}>
              <ThemedText className="text-sm font-bold uppercase tracking-wider">
                {title}
              </ThemedText>
            </View>
          )}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: themeColors.card,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: themeColors.border,
                overflow: 'hidden',
                minHeight: 80,
              }}
            >
              <View className="flex-row items-center justify-between px-4 py-3">
                <View className="flex-1 mr-3">
                  <ThemedText className="text-lg font-bold mb-1">{item.name}</ThemedText>
                  <ThemedText className="text-sm" style={{ opacity: 0.7 }}>{item.phone}</ThemedText>
                  {item.city !== 'ALL' && (
                    <ThemedText className="text-xs mt-1" style={{ opacity: 0.6 }}>
                      {item.city.charAt(0) + item.city.slice(1).toLowerCase()}
                    </ThemedText>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleCall(item.phone)}
                  style={{ backgroundColor: '#22C55E', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', minHeight: 60, minWidth: 100 }}
                >
                  <Phone size={24} color="white" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginTop: 4 }}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <ThemedText style={{ opacity: 0.6 }}>No contacts found for this city.</ThemedText>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        {/* City Dropdown Modal */}
        <Modal
          visible={showCityDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCityDropdown(false)}
        >
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={1}
            onPress={() => setShowCityDropdown(false)}
          >
            <View style={{ backgroundColor: themeColors.card, borderRadius: 16, width: '91.666667%', maxWidth: 384, overflow: 'hidden' }}>
              <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: themeColors.border }}>
                <ThemedText className="text-lg font-bold">Select City</ThemedText>
              </View>
              {CITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleCitySelect(option.value)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: themeColors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: selectedCity === option.value ? '#D1FAE5' : themeColors.card,
                    minHeight: 60,
                  }}
                >
                  <ThemedText
                    className="text-base font-semibold"
                    style={{ color: selectedCity === option.value ? '#059669' : themeColors.text }}
                  >
                    {option.label}
                  </ThemedText>
                  {selectedCity === option.value && (
                    <View style={{ width: 8, height: 8, backgroundColor: '#22C55E', borderRadius: 9999 }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </ThemedView>
  );
}
