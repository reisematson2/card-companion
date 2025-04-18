import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#1e3a8a',
        },
        headerTintColor: '#1e3a8a',
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="decks/index"
        options={{
          title: 'Decks',
          tabBarLabel: 'Decks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="stats/index"
        options={{
          title: 'Stats',
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hide nested detail/edit screens from bottom tabs */}
      <Tabs.Screen name="decks/[deckId]" options={{ href: null }} />
      <Tabs.Screen name="decks/[deckId]/[deckID]" options={{ href: null }} />
      <Tabs.Screen name="decks/[deckId]/edit" options={{ href: null }} />
      <Tabs.Screen name="decks/[deckId]/new-match" options={{ href: null }} />
      <Tabs.Screen name="decks/[deckId]/edit-match/[matchId]" options={{ href: null }} />

      {/* Hide all other non-tab routes */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="[...catchall]" options={{ href: null }} />
      <Tabs.Screen name="welcome" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
