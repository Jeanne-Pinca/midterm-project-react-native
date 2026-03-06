import { StyleSheet } from "react-native";

export const circularBackButtonIconSize = 22;
export const circularBackButtonIconColor = "#111827";

export const circularBackButtonStyles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e7a7f0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  icon: {
    color: circularBackButtonIconColor,
  },
});
