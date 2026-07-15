import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "../theme/ThemeProvider";
import { Icon, type IconName } from "../components/Icon";
import { t } from "../i18n";
import { PlantsScreen } from "../screens/PlantsScreen";
import { CalendarScreen } from "../screens/CalendarScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, IconName> = {
  Plants: "home",
  Calendar: "calendar",
  Settings: "settings",
};

export function AppTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
        },
        tabBarIcon: ({ color, size }) => (
          <Icon name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Plants"
        component={PlantsScreen}
        options={{ tabBarLabel: t("tabs.plants") }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: t("tabs.calendar") }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: t("tabs.settings") }}
      />
    </Tab.Navigator>
  );
}
