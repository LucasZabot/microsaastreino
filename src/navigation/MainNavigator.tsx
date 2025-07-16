import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList, MainTabParamList } from '../types';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import WorkoutListScreen from '../screens/WorkoutListScreen';
import WorkoutDetailsScreen from '../screens/WorkoutDetailsScreen';
import WorkoutPlayerScreen from '../screens/WorkoutPlayerScreen';
import TimerScreen from '../screens/TimerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import PaymentScreen from '../screens/PaymentScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Workouts') {
            iconName = 'fitness-center';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          } else {
            iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Workouts" 
        component={WorkoutListScreen}
        options={{
          tabBarLabel: 'Treinos',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Configurações',
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkoutDetails"
        component={WorkoutDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Detalhes do Treino',
          headerBackTitleVisible: false,
          headerTintColor: '#6366f1',
        }}
      />
      <Stack.Screen
        name="WorkoutPlayer"
        component={WorkoutPlayerScreen}
        options={{
          headerShown: true,
          headerTitle: 'Treino em Andamento',
          headerBackTitleVisible: false,
          headerTintColor: '#6366f1',
        }}
      />
      <Stack.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          headerShown: true,
          headerTitle: 'Cronômetro',
          headerBackTitleVisible: false,
          headerTintColor: '#6366f1',
        }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          headerShown: true,
          headerTitle: 'Assinaturas',
          headerBackTitleVisible: false,
          headerTintColor: '#6366f1',
        }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          headerShown: true,
          headerTitle: 'Pagamento',
          headerBackTitleVisible: false,
          headerTintColor: '#6366f1',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;