import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { useTheme } from "../context/ThemeContext";
import {
  bookmarkButtonIconSize,
  bookmarkButtonStyles,
} from "./styles/bookmarkButtonStyles";

type BookmarkButtonProps = {
  isSaved: boolean;
  onPress: () => void;
};

export default function BookmarkButton({
  isSaved,
  onPress,
}: BookmarkButtonProps) {
  const { isDarkMode, theme } = useTheme();

  return (
    <Pressable
      style={[
        bookmarkButtonStyles.button,
        {
          borderColor: theme.colors.border,
          backgroundColor: isDarkMode ? "#1f2937" : "#fff",
        },
      ]}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={isSaved ? "bookmark" : "bookmark-outline"}
        size={bookmarkButtonIconSize}
        style={[
          bookmarkButtonStyles.icon,
          { color: isSaved ? "#ffc74d" : theme.colors.textSecondary },
        ]}
      />
    </Pressable>
  );
}
