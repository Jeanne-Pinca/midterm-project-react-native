import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { useTheme } from "../context/ThemeContext";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "muted";
  style?: ViewStyle;
  disabled?: boolean;
};

export default function AppButton({
  label,
  onPress,
  variant = "primary",
  style,
  disabled = false,
}: AppButtonProps) {
  const { isDarkMode, theme } = useTheme();

  return (
    <Pressable
      style={[
        styles.button,
        variant === "muted" && styles.buttonMuted,
        { borderColor: "#e7a7f0" },
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={
          variant === "muted"
            ? isDarkMode
              ? ["#374151", "#4b5563", "#5b4268"]
              : ["#ffffff", "#fdf7fe", "#f4ccf8"]
            : isDarkMode
              ? ["#374151", "#4b5563", "#6b3d74"]
              : ["#ffffff", "#faeffc", "#e7a7f049"]
        }
        locations={[0, 0.52, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientFill}
      >
        <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e7a7f0",
    borderRadius: 10,
    overflow: "hidden",
  },
  buttonMuted: {
    borderColor: "#e7a7f0",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  gradientFill: {
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#111827",
    fontWeight: "600",
  },
});
