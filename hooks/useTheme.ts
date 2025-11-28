import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeContext } from "@/hooks/useThemeContext";

export function useTheme() {
  const colorScheme = useColorScheme();
  const { themeMode } = useThemeContext();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];

  return {
    theme,
    isDark,
    themeMode,
  };
}
