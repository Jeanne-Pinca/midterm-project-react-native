import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { useTheme } from "../context/ThemeContext";
import {
    circularBackButtonIconSize,
    circularBackButtonStyles,
} from "./styles/circularBackButtonStyles";

type CircularBackButtonProps = {
  onPress: () => void;
};

export default function CircularBackButton({
  onPress,
}: CircularBackButtonProps) {
  const { isDarkMode, theme } = useTheme();

  return (
    <Pressable
      style={[
        circularBackButtonStyles.button,
        {
          borderColor: "#e7a7f0",
          backgroundColor: isDarkMode ? "#1f2937" : "#fff",
        },
      ]}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name="arrow-left"
        size={circularBackButtonIconSize}
        style={[
          circularBackButtonStyles.icon,
          { color: theme.colors.textPrimary },
        ]}
      />
    </Pressable>
  );
}
