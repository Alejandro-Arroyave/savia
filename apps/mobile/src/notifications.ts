import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { gql } from "@apollo/client";
import { apolloClient } from "./apollo";

const REGISTER_PUSH_TOKEN = gql`
  mutation RegisterPushToken($token: String!, $platform: String) {
    registerPushToken(token: $token, platform: $platform)
  }
`;

// NOTA: las push de Expo requieren un *development build* (no funcionan en Expo Go).
// Se resuelve con EAS Build. Ver docs/03-tech-stack.md.
export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== "granted") {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  await apolloClient.mutate({
    mutation: REGISTER_PUSH_TOKEN,
    variables: { token, platform: Platform.OS },
  });

  return token;
}
