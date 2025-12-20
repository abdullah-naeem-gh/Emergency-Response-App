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
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 px-4 pt-2">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-3xl font-bold text-gray-900 mb-4">Emergency Directory</Text>

          {/* City Filter Dropdown */}
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setShowCityDropdown(true);
            }}
            className="bg-white rounded-xl px-4 py-3 border border-gray-200 mb-4 shadow-sm flex-row items-center justify-between"
            style={{ minHeight: 60 }}
          >
            <Text className="text-base font-semibold text-gray-900">{selectedCityLabel}</Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* SectionList */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title } }) => (
            <View className="bg-gray-100 px-4 py-2 mb-2">
              <Text className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View
              className="bg-white rounded-xl mb-3 shadow-sm border border-gray-100 overflow-hidden"
              style={{ minHeight: 80 }}
            >
              <View className="flex-row items-center justify-between px-4 py-3">
                <View className="flex-1 mr-3">
                  <Text className="text-lg font-bold text-gray-900 mb-1">{item.name}</Text>
                  <Text className="text-sm text-gray-600">{item.phone}</Text>
                  {item.city !== 'ALL' && (
                    <Text className="text-xs text-gray-500 mt-1">
                      {item.city.charAt(0) + item.city.slice(1).toLowerCase()}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleCall(item.phone)}
                  className="bg-green-500 rounded-xl px-6 py-3 items-center justify-center active:bg-green-600"
                  style={{ minHeight: 60, minWidth: 100 }}
                >
                  <Phone size={24} color="white" />
                  <Text className="text-white font-bold text-base mt-1">Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Text className="text-gray-400">No contacts found for this city.</Text>
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
            className="flex-1 bg-black/50 justify-center items-center"
            activeOpacity={1}
            onPress={() => setShowCityDropdown(false)}
          >
            <View className="bg-white rounded-2xl w-11/12 max-w-sm overflow-hidden">
              <View className="px-5 py-4 border-b border-gray-200">
                <Text className="text-lg font-bold text-gray-900">Select City</Text>
              </View>
              {CITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleCitySelect(option.value)}
                  className={`px-5 py-4 border-b border-gray-100 flex-row items-center justify-between ${
                    selectedCity === option.value ? 'bg-green-50' : 'bg-white'
                  }`}
                  style={{ minHeight: 60 }}
                >
                  <Text
                    className={`text-base font-semibold ${
                      selectedCity === option.value ? 'text-green-700' : 'text-gray-900'
                    }`}
                  >
                    {option.label}
                  </Text>
                  {selectedCity === option.value && (
                    <View className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}
