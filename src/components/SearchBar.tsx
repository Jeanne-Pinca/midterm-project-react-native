import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    Pressable,
    StyleSheet,
    TextInput,
    View,
    ViewStyle,
} from "react-native";

import { useTheme } from "../context/ThemeContext";

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
  const { isDarkMode, theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.colors.border,
          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
        },
        style,
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, { color: theme.colors.textPrimary }]}
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
            color={theme.colors.textMuted}
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
