import { colors } from '@/theme/colors';
import { Tabs } from 'expo-router';
import { Activity, Home, Settings } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBar({
  state,
  navigation,
}: {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}) {
  const insets = useSafeAreaInsets();
  const icons = [
    { name: 'index', icon: Home, label: 'Home' },
    { name: 'insights', icon: Activity, label: 'Insights' },
    { name: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const meta = icons.find((item) => item.name === route.name);
        if (!meta) return null;
        const active = state.index === index;
        const Icon = meta.icon;
        return (
          <Pressable
            key={route.key}
            accessibilityLabel={meta.label}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.dot, active && styles.dotActive]}
          >
            <Icon size={18} color={active ? colors.ink : colors.inkDim} />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar state={props.state} navigation={props.navigation} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    backgroundColor: colors.bg,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: 'rgba(74,78,81,0.08)',
  },
});
