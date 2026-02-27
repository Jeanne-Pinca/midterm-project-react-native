import { StyleSheet, Text, View } from "react-native";

type JobSaveStatusPromptProps = {
  visible: boolean;
  message?: string;
};

export default function JobSaveStatusPrompt({
  visible,
  message = "Job Saved Successfully!",
}: JobSaveStatusPromptProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.wrapper} pointerEvents="none">
      <View style={styles.prompt}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: "center",
    zIndex: 20,
  },
  prompt: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});
