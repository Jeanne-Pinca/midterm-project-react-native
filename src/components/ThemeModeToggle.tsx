import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { useTheme } from "../context/ThemeContext";

export default function ThemeModeToggle() {
  const { isDarkMode, theme, toggleThemeMode } = useTheme();

  return (
    <Pressable
      style={[
        styles.button,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
      onPress={toggleThemeMode}
    >
      <MaterialCommunityIcons
        name={isDarkMode ? "weather-night" : "white-balance-sunny"}
        size={20}
        color={theme.colors.icon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
