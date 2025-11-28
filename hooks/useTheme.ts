import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeMode } from "@/utils/storage";

export function useTheme() {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem("@haajari/theme").then((saved) => {
      if (saved) {
        setThemeModeState(saved as ThemeMode);
      }
    });
  }, []);

  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];

  return {
    theme,
    isDark,
    themeMode,
  };
}
