import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Card Companion</Text>
      <Text style={styles.subtitle}>Level up your list with data-driven decisions.</Text>
      <Link href="/decks/index">
        <Text style={styles.link}>View Your Decks</Text>
      </Link>
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  link: {
    marginTop: 20,
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
});
