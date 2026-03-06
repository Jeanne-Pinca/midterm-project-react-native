import { StyleSheet } from "react-native";

export const bookmarkButtonIconSize = 24;
export const bookmarkButtonIconColor = "#ffc74d";

export const bookmarkButtonStyles = StyleSheet.create({
  button: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  icon: {
    color: bookmarkButtonIconColor,
  },
});
