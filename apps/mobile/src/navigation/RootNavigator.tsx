import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppTabs } from "./AppTabs";
import { PlantDetailScreen } from "../screens/PlantDetailScreen";
import { AddPlantScreen } from "../screens/AddPlantScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={AppTabs} />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
      <Stack.Screen name="AddPlant" component={AddPlantScreen} options={{ presentation: "modal" }} />
    </Stack.Navigator>
  );
}
