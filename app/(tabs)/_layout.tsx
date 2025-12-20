import CustomHeader from '@/components/CustomHeader';
import CustomTabBar from '@/components/CustomTabBar';
import SettingsDrawer from '@/components/SettingsDrawer';
import { useNavigationState } from '@react-navigation/native';
import { Tabs, useNavigation } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const [showSettings, setShowSettings] = useState(false);
  const navigation = useNavigation();
  const tabBarPropsRef = useRef<any>(null);

  // Get navigation state
  const state = useNavigationState((state) => {
    if (state && state.type === 'tab') {
      const tabState = state as any;
      tabBarPropsRef.current = {
        state: tabState,
        navigation: navigation as any,
        descriptors: {},
      };
      return tabState;
    }
    return null;
  });

  return (
    <View style={styles.container}>
      <CustomHeader onMenuPress={() => setShowSettings(true)} />
      <View style={styles.tabsWrapper}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // Hide default tab bar
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              href: '/(tabs)',
            }}
          />
          <Tabs.Screen
            name="volunteer"
            options={{
              title: 'Map',
              href: '/(tabs)/volunteer',
            }}
          />
          <Tabs.Screen
            name="guides"
            options={{
              title: 'Guides',
              href: '/(tabs)/guides',
            }}
          />
          <Tabs.Screen
            name="chatbot"
            options={{
              title: 'Chat',
              href: '/(tabs)/chatbot',
            }}
          />
          {/* Hide these screens from tab bar but keep them accessible */}
          <Tabs.Screen
            name="news"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="directory"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="crowd-map"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="reports"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="weather"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="preparedness"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="evacuation"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="community"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </View>
      {/* Manually render tab bar at bottom - always visible */}
      <CustomTabBar 
        {...({
          state: state as any || { routes: [], index: 0 },
          navigation: navigation as any,
          descriptors: {},
        } as any)}
      />
      <SettingsDrawer 
        visible={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsWrapper: {
    flex: 1,
  },
});
