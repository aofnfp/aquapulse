import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page not found</Text>
      <Link href="/" style={styles.link}>
        Go home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  link: {
    marginTop: 16,
    fontSize: 15,
    color: Colors.primary,
  },
});
