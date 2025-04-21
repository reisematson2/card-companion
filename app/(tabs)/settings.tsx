import React from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

export default function SettingsScreen() {
  // Pull in dark mode controls
  const { isDark, toggleTheme } = useTheme();
  // Pull in deck display style controls
  const { displayStyle, setDisplayStyle } = useSettings();

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Set header title */}
      <Stack.Screen options={{ title: 'Settings' }} />

      {/* Dark Mode Toggle */}
      <View style={styles.row}>
        <Text style={[styles.label, isDark && styles.textDark]}>Dark Mode</Text>
        <Pressable onPress={toggleTheme} style={styles.toggleButton}>
          <Text style={[styles.toggleText, isDark ? styles.toggleTextActive : null]}>
            {isDark ? 'On' : 'Off'}
          </Text>
        </Pressable>
      </View>

      {/* Deck Display Style Toggle */}
      <Text style={[styles.sectionHeader, isDark && styles.textDark]}>
        Deck Display Style
      </Text>
      <View style={styles.row}>
        {/* Default tile view */}
        <Pressable
          onPress={() => setDisplayStyle('default')}
          style={[
            styles.toggleButton,
            displayStyle === 'default' && styles.toggleButtonActive,
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              displayStyle === 'default' && styles.toggleTextActive,
              isDark && styles.textDark,
            ]}
          >
            Default
          </Text>
        </Pressable>
        {/* Compact list view */}
        <Pressable
          onPress={() => setDisplayStyle('list')}
          style={[
            styles.toggleButton,
            displayStyle === 'list' && styles.toggleButtonActive,
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              displayStyle === 'list' && styles.toggleTextActive,
              isDark && styles.textDark,
            ]}
          >
            List
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    color: '#1f2937',
  },
  textDark: {
    color: '#f9fafb',
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  toggleText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#374151',
  },
});
