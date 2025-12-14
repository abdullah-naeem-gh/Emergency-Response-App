import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';
import { MockLocationService } from '@/services/MockLocationService';

export default function PanicScreen() {
  const router = useRouter();
  const { setMode } = useAppStore();

  const handleSOS = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    console.log('SOS Signal Sent!');
    // Logic to send SOS would go here
  };

  const handleSafe = () => {
    MockLocationService.simulateExitRedZone();
    // setMode('PEACE') is handled in simulateExitRedZone but explicit is fine too
    router.replace('/(peace)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EMERGENCY MODE</Text>
      <Text style={styles.instruction}>Tap for Help</Text>

      <Pressable style={styles.sosButton} onPress={handleSOS}>
        <Text style={styles.sosText}>SOS</Text>
      </Pressable>

      <Pressable style={styles.safeButton} onPress={handleSafe}>
        <Text style={styles.safeText}>I am Safe</Text>
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
    backgroundColor: '#FFEBEE', // Light red background
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 18,
    color: '#333',
    marginBottom: 40,
  },
  sosButton: {
    backgroundColor: '#D32F2F',
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  sosText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  safeButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  safeText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

