import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    Pressable,
    StyleSheet,
    TextInput,
    View,
    ViewStyle,
} from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  onInfoPress?: () => void;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search",
  style,
  onInfoPress,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
      />

      {onInfoPress ? (
        <Pressable
          style={styles.infoButton}
          onPress={onInfoPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Search help"
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color="#6b7280"
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
