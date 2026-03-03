import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

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
  return (
    <Pressable
      style={[
        styles.button,
        variant === "muted" && styles.buttonMuted,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonMuted: {
    backgroundColor: "#4b5563",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
