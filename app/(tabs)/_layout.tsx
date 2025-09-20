import { FoodBudgetProvider } from '@/contexts/FoodBudgetContext';
import { Tabs } from 'expo-router';
import {
  BarChartBig,
  House as Home, Settings
} from 'lucide-react-native';

function TabsContent() {
  return (
    <FoodBudgetProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 0,
            paddingBottom: 12,
            paddingTop: 12,
            height: 84,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.03,
            shadowRadius: 12,
            elevation: 8,
          },
          tabBarActiveTintColor: '#34C759',
          tabBarInactiveTintColor: '#86868B',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 6,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'ホーム',
            tabBarIcon: ({ size, color }) => (
              <Home size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: 'レポート',
            tabBarIcon: ({ size, color }) => (
              <BarChartBig size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: '設定',
            tabBarIcon: ({ size, color }) => (
              <Settings size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </FoodBudgetProvider>
  );
}

export default function TabLayout() {
  return <TabsContent />;
}
