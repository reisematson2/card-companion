import { View, Text, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEYS = {
  FILTER: 'defaultMatchFilter',
  DARK_MODE: 'useDarkMode',
};

const SETTINGS_LABELS = {
  FILTER: 'Default Match Filter',
  DARK_MODE: 'Use Dark Mode',
};

export default function SettingsScreen() {
  const [defaultFilter, setDefaultFilter] = useState<'all' | 'win' | 'loss' | 'draw'>('all');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const filter = await AsyncStorage.getItem(SETTINGS_KEYS.FILTER);
      const dark = await AsyncStorage.getItem(SETTINGS_KEYS.DARK_MODE);
      if (filter) setDefaultFilter(filter);
      if (dark === 'true') setDarkMode(true);
    };
    loadSettings();
  }, []);

  const saveFilterSetting = async (value) => {
    setDefaultFilter(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.FILTER, value);
  };

  const toggleDarkMode = async () => {
    const next = !darkMode;
    setDarkMode(next);
    await AsyncStorage.setItem(SETTINGS_KEYS.DARK_MODE, next.toString());
  };

  const confirmReset = () => {
    Alert.alert('Reset App Data', 'Are you sure you want to delete all decks and matches?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          Alert.alert('Reset Complete', 'All app data has been cleared.');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />

      <Text style={styles.sectionTitle}>{SETTINGS_LABELS.FILTER}</Text>
      <View style={styles.filterRow}>
        {['all', 'win', 'loss', 'draw'].map((type) => (
          <Pressable
            key={type}
            onPress={() => saveFilterSetting(type)}
            style={[styles.filterButton, defaultFilter === type && styles.activeFilterButton]}
          >
            <Text
              style={[styles.filterText, defaultFilter === type && styles.activeFilterText]}
            >
              {type.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{SETTINGS_LABELS.DARK_MODE}</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      <Pressable style={styles.resetButton} onPress={confirmReset}>
        <Text style={styles.resetText}>Reset App Data</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e3a8a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    color: '#111827',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeFilterButton: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    color: '#374151',
    fontWeight: '600',
  },
  activeFilterText: {
    color: 'white',
  },
  resetButton: {
    marginTop: 30,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  resetText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
