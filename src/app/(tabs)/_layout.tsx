import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { colors, coloresJJK } from '@/styles/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.rosa,
        tabBarInactiveTintColor: colors.morado,
        tabBarStyle: {
          backgroundColor: colors.blanco,
          borderTopColor: colors.rosaClaro,
          borderTopWidth: 1,
          height: 62,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: 'Acerca de',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'information-circle' : 'information-circle-outline'}
              color={color}
              size={22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="servicios"
        options={{
          title: 'Servicios',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'headset' : 'headset-outline'} color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="jjk"
        options={{
          title: 'Jujutsu Kaisen',
          tabBarActiveTintColor: coloresJJK.rojo,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flame' : 'flame-outline'} color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="jjk-datos"
        options={{
          title: 'Poderes',
          tabBarActiveTintColor: coloresJJK.rojo,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="profesores"
        options={{
          title: 'Profesores',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'school' : 'school-outline'} color={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}
