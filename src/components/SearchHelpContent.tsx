import { StyleSheet, Text } from "react-native";

import { useTheme } from "../context/ThemeContext";

export default function SearchHelpContent() {
  const { theme } = useTheme();

  return (
    <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
      You can search by using keywords, or using filters: (
      <Text style={[styles.bold, { color: theme.colors.textPrimary }]}>
        category, location, job type
      </Text>
      ){"\n\n"}
      <Text style={[styles.bold, { color: theme.colors.textPrimary }]}>
        Example:
      </Text>
      {"\n"}• category : design
      {"\n"}• location : seoul
      {"\n"}• type : Internship
    </Text>
  );
}

const styles = StyleSheet.create({
  message: {
    fontSize: 15,
    lineHeight: 24,
    color: "#374151",
  },
  bold: {
    fontWeight: "700",
    color: "#111827",
  },
});
