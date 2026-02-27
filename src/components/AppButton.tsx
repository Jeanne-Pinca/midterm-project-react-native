import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "muted";
  style?: ViewStyle;
};

export default function AppButton({
  label,
  onPress,
  variant = "primary",
  style,
}: AppButtonProps) {
  return (
    <Pressable
      style={[styles.button, variant === "muted" && styles.buttonMuted, style]}
      onPress={onPress}
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
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
