import React from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import RootNavigator from "@/navigation/RootNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LanguageContext, useLanguageProvider } from "@/hooks/useLanguage";
import { AuthContext, useAuthProvider } from "@/hooks/useAuth";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/theme";

function AppInner() {
  const languageContext = useLanguageProvider();
  const authContext = useAuthProvider();
  const { theme, isDark } = useTheme();

  if (languageContext.isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <LanguageContext.Provider value={languageContext}>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style={isDark ? "light" : "dark"} />
      </AuthContext.Provider>
    </LanguageContext.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <KeyboardProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <AppInner />
            </ErrorBoundary>
          </ThemeProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
