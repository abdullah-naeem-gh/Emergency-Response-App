import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { View } from 'react-native';
import CustomHeader from './CustomHeader';
import CustomTabBar from './CustomTabBar';
import SettingsDrawer from './SettingsDrawer';

interface TabsWrapperProps {
  children: React.ReactNode;
  tabBarProps?: BottomTabBarProps;
}

export default function TabsWrapper({ children, tabBarProps }: TabsWrapperProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <View className="flex-1">
      <CustomHeader onSettingsPress={() => setShowSettings(true)} />
      <View className="flex-1">
        {children}
      </View>
      {tabBarProps && <CustomTabBar {...tabBarProps} />}
      <SettingsDrawer 
        visible={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </View>
  );
}
