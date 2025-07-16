import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../types';
import Button from '../components/Button';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>💪</Text>
            </View>
            <Text style={styles.title}>WorkoutApp</Text>
            <Text style={styles.subtitle}>
              Transforme seu corpo e sua mente com treinos personalizados
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🏃‍♂️</Text>
              <Text style={styles.featureText}>Treinos Personalizados</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>⏱️</Text>
              <Text style={styles.featureText}>Sistema de Timer</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Acompanhe seu Progresso</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <Button
              title="Criar Conta"
              onPress={handleRegister}
              variant="secondary"
              size="large"
            />
            <Button
              title="Entrar"
              onPress={handleLogin}
              variant="outline"
              size="large"
            />
          </View>

          <Text style={styles.footerText}>
            Pronto para começar sua jornada?
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  buttons: {
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#e0e7ff',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default WelcomeScreen;