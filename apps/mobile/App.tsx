import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { ApolloProvider } from "@apollo/client";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavTheme,
} from "@react-navigation/native";
import { apolloClient } from "./src/apollo";
import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import { ThemeProvider, useTheme } from "./src/theme/ThemeProvider";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AuthNavigator } from "./src/navigation/AuthNavigator";

function Root() {
  const { email, restoring } = useAuth();
  const { scheme, colors } = useTheme();

  const navTheme = useMemo<NavTheme>(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.appBg,
        card: colors.surface,
        text: colors.ink,
        border: colors.line,
        primary: colors.primary,
      },
    };
  }, [scheme, colors]);

  if (restoring) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.appBg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      {email ? <RootNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <Root />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ApolloProvider>
  );
}
