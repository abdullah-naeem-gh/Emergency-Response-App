import { useAppStore } from '@/store/useAppStore';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { AlertCircle, BookOpen, Bot, Home, MapPin } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItem {
  name: string;
  route: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
}

const tabs: TabItem[] = [
  { name: 'home', route: '/(tabs)', icon: Home, label: 'Home' },
  { name: 'map', route: '/(tabs)/volunteer', icon: MapPin, label: 'Map' },
  { name: 'sos', route: '/(panic)', icon: AlertCircle, label: 'SOS' },
  { name: 'guides', route: '/(tabs)/guides', icon: BookOpen, label: 'Guides' },
  { name: 'chat', route: '/(tabs)/chatbot', icon: Bot, label: 'Chat' },
];

export default function CustomTabBar(props: BottomTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { mode } = useAppStore();
  const insets = useSafeAreaInsets();

  // Debug: Log to see if component is rendering
  console.log('CustomTabBar rendering, mode:', mode, 'pathname:', pathname);

  // Hide tab bar in panic mode
  if (mode === 'PANIC') {
    return null;
  }

  const handleTabPress = async (tab: TabItem) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (tab.name === 'sos') {
      // Navigate to panic screen
      router.push('/(panic)');
    } else {
      // Use navigation from props if available, otherwise use router
      if (props.navigation && props.state?.routes) {
        const route = props.state.routes.find((r: any) => {
          if (tab.name === 'home') {
            return r.name === 'index';
          }
          return r.name === tab.name;
        });
        if (route) {
          try {
            const event = props.navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            
            if (!event.defaultPrevented) {
              props.navigation.navigate(route.name);
            }
          } catch (error) {
            // Fallback to router on error
            const targetRoute = tab.route === '/(tabs)' ? '/(tabs)/' : tab.route;
            router.push(targetRoute as any);
          }
        } else {
          // Route not found, use router
          const targetRoute = tab.route === '/(tabs)' ? '/(tabs)/' : tab.route;
          router.push(targetRoute as any);
        }
      } else {
        // Fallback to router if navigation not available
        const targetRoute = tab.route === '/(tabs)' ? '/(tabs)/' : tab.route;
        router.push(targetRoute as any);
      }
    }
  };

  const isActive = (tab: TabItem) => {
    if (tab.name === 'home') {
      return pathname === '/(tabs)' || pathname === '/(tabs)/' || pathname === '/(tabs)/index';
    }
    return pathname === tab.route || pathname?.startsWith(tab.route);
  };

  return (
    <View 
      style={{ 
        backgroundColor: '#171717', // neutral-900
        borderTopWidth: 1,
        borderTopColor: '#262626', // neutral-800
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 8,
        minHeight: 60,
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab);
        const isSOS = tab.name === 'sos';
        const Icon = tab.icon;

        if (isSOS) {
          // Special styling for SOS button - larger, red, central
          return (
            <Pressable
              key={tab.name}
              onPress={() => handleTabPress(tab)}
              style={{
                backgroundColor: '#dc2626', // red-600
                borderRadius: 32,
                width: 64,
                height: 64,
                marginTop: -20, // Elevate the button above the tab bar
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#991b1b', // red-900
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Icon size={32} color="white" />
            </Pressable>
          );
        }

        return (
          <Pressable
            key={tab.name}
            onPress={() => handleTabPress(tab)}
            style={{ 
              flex: 1, 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: 60 
            }}
          >
            <Icon 
              size={24} 
              color={active ? '#ef4444' : '#9ca3af'} 
            />
            <Text 
              style={{
                fontSize: 12,
                marginTop: 4,
                color: active ? '#ef4444' : '#9ca3af',
                fontWeight: active ? '600' : '400',
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
