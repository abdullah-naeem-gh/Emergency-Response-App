import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';
import { MockLocationService } from '@/services/MockLocationService';

export default function PeaceDashboard() {
  const router = useRouter();
  const { isRedZone, setMode } = useAppStore();

  const handleSimulateRedZone = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    MockLocationService.simulateEnterRedZone();
    router.replace('/(panic)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Muhafiz Dashboard</Text>
      <Text style={styles.subtitle}>Status: {isRedZone ? 'RED ZONE' : 'Safe'}</Text>
      
      <View style={styles.content}>
        <Text style={styles.infoText}>Weather: Clear</Text>
        <Text style={styles.infoText}>Preparedness: High</Text>
      </View>

      <Pressable style={styles.button} onPress={handleSimulateRedZone}>
        <Text style={styles.buttonText}>Simulate Red Zone Entry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F8FF', // Light blue for peace
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
  },
  content: {
    marginBottom: 40,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

