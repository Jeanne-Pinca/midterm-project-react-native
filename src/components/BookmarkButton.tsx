import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

type BookmarkButtonProps = {
  isSaved: boolean;
  onPress: () => void;
};

export default function BookmarkButton({
  isSaved,
  onPress,
}: BookmarkButtonProps) {
  return (
    <Pressable style={styles.bookmarkButton} onPress={onPress}>
      <MaterialCommunityIcons
        name={isSaved ? "bookmark" : "bookmark-outline"}
        size={24}
        color="#111827"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bookmarkButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
  },
});
