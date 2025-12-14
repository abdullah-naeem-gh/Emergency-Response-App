import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff, X } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  Easing 
} from 'react-native-reanimated';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const translateY = useSharedValue(-100);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);
      
      if (offline) {
        setIsVisible(true);
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
      } else {
        translateY.value = withTiming(-100, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        });
        // Hide after animation completes
        setTimeout(() => setIsVisible(false), 300);
      }
    });

    // Check initial state
    NetInfo.fetch().then(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);
      if (offline) {
        setIsVisible(true);
        translateY.value = 0;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleDismiss = () => {
    translateY.value = withTiming(-100, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        },
        animatedStyle,
      ]}
    >
      <View className="bg-orange-500 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <WifiOff size={20} color="white" className="mr-3" />
          <Text className="text-white font-semibold text-sm flex-1">
            Offline Mode - Reports will be queued
          </Text>
        </View>
        <Pressable
          onPress={handleDismiss}
          className="ml-2 p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={18} color="white" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

