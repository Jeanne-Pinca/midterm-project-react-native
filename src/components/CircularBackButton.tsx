import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

type CircularBackButtonProps = {
  onPress: () => void;
};

export default function CircularBackButton({
  onPress,
}: CircularBackButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <MaterialCommunityIcons name="arrow-left" size={22} color="#111827" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e7a7f0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e7a7f0",
  },
});
