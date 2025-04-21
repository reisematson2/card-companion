import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { searchScryfallCards } from '../../utils/scryfall';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDecks } from '../../utils/storage';
import { Animated } from 'react-native';

export default function DeckBuilderScreen() {
  const { deckId } = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deckCards, setDeckCards] = useState<{ [name: string]: { card: any; quantity: number } }>({});
  const [searchExpanded, setSearchExpanded] = useState(false);
  const { isDark } = useTheme();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearchExpanded(true);
    setLoading(true);
    const cards = await searchScryfallCards(query.trim());
    setResults(cards);
    setLoading(false);
  };

  const handleCollapseSearch = () => {
    setSearchExpanded(false);
    setQuery('');
    setResults([]);
  };

  const handleAddCard = (card: any) => {
    const key = card.name.toLowerCase();
    setDeckCards((prev) => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          card,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  };

  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (searchExpanded) {
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [searchExpanded]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Stack.Screen options={{ title: deckId ? 'Edit Deck' : 'Deck Builder' }} />

        {/* Search Bar */}
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="Search for cards (e.g. Lightning Bolt)"
          placeholderTextColor={isDark ? '#ccc' : '#888'}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        {/* Search Suggestions Overlay */}
        {searchExpanded && (
          <Animated.View
            style={[styles.overlayContainer, {
              opacity: overlayAnim,
              transform: [{ scale: overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }]
            }]}
          >
            <Pressable onPress={handleCollapseSearch} style={styles.collapseArrow}>
              <View style={[styles.collapseIcon, isDark && styles.collapseIconDark]}>
                <Text style={[styles.collapseIconText, isDark && styles.collapseIconTextDark]}>⌃</Text>
              </View>
            </Pressable>

            {loading ? (
              <ActivityIndicator size="large" color="#fbbf24" style={{ marginTop: 10 }} />
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleAddCard(item)}
                    style={[styles.card, isDark && styles.cardDark]}
                  >
                    <Image source={{ uri: item.image_uris?.small }} style={styles.image} />
                    <View style={styles.info}>
                      <Text style={[styles.name, isDark && styles.nameDark]}>{item.name}</Text>
                      <Text style={[styles.set, isDark && styles.setDark]}>{item.set_name}</Text>
                    </View>
                  </Pressable>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
                style={styles.suggestionList}
              />
            )}
          </Animated.View>
        )}

        {/* Deck Cards ScrollView */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 70, paddingBottom: 200 }}>
          {Object.entries(deckCards).map(([name, entry]) => (
            <View key={name} style={[styles.card, isDark && styles.cardDark]}>
              <Image source={{ uri: entry.card.image_uris?.small }} style={styles.image} />
              <View style={styles.info}>
                <Text style={[styles.name, isDark && styles.nameDark]}>{entry.card.name}</Text>
                <Text style={[styles.set, isDark && styles.setDark]}>{entry.card.set_name}</Text>
                <Text style={[styles.set, isDark && styles.setDark]}>Quantity: {entry.quantity}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  inputDark: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    borderColor: '#334155',
  },
  overlayContainer: {
    position: 'absolute',
    top: 65,
    left: 10,
    right: 10,
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#c7d2fe',
    zIndex: 999,
    padding: 10,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 8,
  },
  suggestionList: {
    flexGrow: 0,
  },
  collapseArrow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  collapseIcon: {
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    padding: 6,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  collapseIconDark: {
    backgroundColor: '#334155',
  },
  collapseIconText: {
    fontSize: 18,
    color: '#1e293b',
  },
  collapseIconTextDark: {
    color: '#f8fafc',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  image: {
    width: 48,
    height: 67,
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  nameDark: {
    color: '#f8fafc',
  },
  set: {
    fontSize: 13,
    color: '#64748b',
  },
  setDark: {
    color: '#94a3b8',
  },
});
