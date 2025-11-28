import { useColorScheme as useRNColorScheme } from "react-native";
import { useThemeContext } from "./useThemeContext";

export function useColorScheme() {
  const { themeMode } = useThemeContext();
  const systemColorScheme = useRNColorScheme();

  if (themeMode === "system") {
    return systemColorScheme;
  }
  return themeMode;
}
