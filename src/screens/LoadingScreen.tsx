import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const LoadingScreen: React.FC = () => {
  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>WorkoutApp</Text>
        <Text style={styles.subtitle}>Seu treino, sua evolução</Text>
        <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e7ff',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default LoadingScreen;