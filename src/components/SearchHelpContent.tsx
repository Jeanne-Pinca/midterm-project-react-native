import { StyleSheet, Text } from "react-native";

export default function SearchHelpContent() {
  return (
    <Text style={styles.message}>
      You can search by using keywords, or using filters: (
      <Text style={styles.bold}>category, location, job type</Text>){"\n\n"}
      <Text style={styles.bold}>Example:</Text>
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
