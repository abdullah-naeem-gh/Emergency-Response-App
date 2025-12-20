import { useAppStore } from '@/store/useAppStore';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { AlertCircle, BookOpen, Bot, Home, MapPin } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const TAB_HEIGHT = 56; // Standard navbar height
const BUTTON_RADIUS = 28; // Radius of the floating button (half of 56)
const NOTCH_WIDTH = 90; // Width of the curve
const NOTCH_DEPTH = 30; // Depth of the curve

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

  // Hide tab bar in panic mode
  if (mode === 'PANIC') {
    return null;
  }

  const handleTabPress = async (tab: TabItem) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (tab.name === 'sos') {
      router.push('/(panic)');
    } else {
      if (props.navigation && props.state?.routes) {
        const route = props.state.routes.find((r: any) => {
          if (tab.name === 'home') {
            return r.name === 'index';
          }
          return r.name === tab.name;
        });
        if (route) {
          props.navigation.navigate(route.name);
        } else {
          router.push(tab.route as any);
        }
      } else {
        router.push(tab.route as any);
      }
    }
  };

  const isActive = (tab: TabItem) => {
    if (tab.name === 'home') {
      return pathname === '/(tabs)' || pathname === '/(tabs)/' || pathname === '/(tabs)/index';
    }
    return pathname === tab.route || pathname?.startsWith(tab.route);
  };

  // Generate the SVG Path for the curved shape with rounded top corners
  // Smooth, organic curve matching the example's natural bend
  const getTabPath = () => {
    const center = width / 2;
    const cornerRadius = 20; // Radius for top corners
    const curveWidth = 100; // Width of the curve - wider for smoother transition
    const curveStart = center - curveWidth / 2;
    const curveEnd = center + curveWidth / 2;
    const dropHeight = 30; // How deep the curve goes
    
    // Smooth symmetric curve using cubic Bezier with well-positioned control points
    // Control points create a natural, flowing arc
    return `
      M0,${cornerRadius}
      Q0,0 ${cornerRadius},0
      L${curveStart},0
      C${curveStart},0 ${center - 20},${dropHeight * 0.5} ${center - 10},${dropHeight * 0.8}
      C${center - 5},${dropHeight * 0.95} ${center - 2},${dropHeight} ${center},${dropHeight}
      C${center + 2},${dropHeight} ${center + 5},${dropHeight * 0.95} ${center + 10},${dropHeight * 0.8}
      C${center + 20},${dropHeight * 0.5} ${curveEnd},0 ${curveEnd},0
      L${width - cornerRadius},0
      Q${width},0 ${width},${cornerRadius}
      L${width},${TAB_HEIGHT + insets.bottom} 
      L0,${TAB_HEIGHT + insets.bottom} 
      Z
    `;
  };

  return (
    <View style={styles.container}>
      {/* Floating SVG Background */}
      <View style={[styles.backgroundContainer, { height: TAB_HEIGHT + insets.bottom }]}>
        <Svg width={width} height={TAB_HEIGHT + insets.bottom} style={styles.shadow}>
          <Path
            d={getTabPath()}
            fill="white"
            stroke="#e5e7eb" // gray-200 for subtle border
            strokeWidth={1}
          />
        </Svg>
      </View>

      {/* Tab Items Container - All 5 tabs including SOS with equal spacing */}
      <View style={[styles.tabsContainer, { paddingBottom: insets.bottom, marginTop: 8 }]}>
        {tabs.map((tab) => {
          const active = isActive(tab);
          const isSOS = tab.name === 'sos';
          const Icon = tab.icon;

          if (isSOS) {
            return (
              <Pressable
                key={tab.name}
                onPress={() => handleTabPress(tab)}
                style={styles.sosTabItem}
              >
                <View style={styles.sosButtonWrapper}>
                  <View style={styles.sosButton}>
                    <Icon size={28} color="white" />
                  </View>
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={tab.name}
              onPress={() => handleTabPress(tab)}
              style={styles.tabItem}
            >
              <View style={[styles.iconContainer, active && styles.activeIconContainer]}>
                <Icon 
                  size={24} 
                  color={active ? '#2563eb' : '#9ca3af'} // blue-600 : gray-400
                />
              </View>
              <Text 
                style={[
                  styles.label,
                  { color: active ? '#2563eb' : '#9ca3af' }
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backgroundContainer: {
    position: 'absolute',
    bottom: 0,
    width: width,
  },
  shadow: {
    // Shadow removed
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly', // Equal spacing between all 5 items
    width: width,
    paddingTop: 32,
    paddingBottom: 0,
    minHeight: TAB_HEIGHT + 16,
    position: 'relative',
    top: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
  },
  sosTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 12,
    marginTop: 0,
  },
  activeIconContainer: {
    backgroundColor: '#eff6ff', // blue-50
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  sosButtonWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#f9fafb', // gray-50 - matches screen background for wrap-around effect
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10, // Reduced from -30 to keep it lower, aligned with navbar
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // gray-200 - matches navbar top border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sosButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dc2626', // red-600
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
});
