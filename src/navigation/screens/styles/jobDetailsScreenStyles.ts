import { StyleSheet } from "react-native";

export const jobDetailsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  jobMeta: {
    fontSize: 14,
    marginBottom: 4,
  },
  logo: {
    width: 72,
    height: 72,
    marginTop: 8,
    marginBottom: 8,
  },
  descriptionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  errorText: {
    color: "#dc2626",
    marginTop: 8,
  },
});
