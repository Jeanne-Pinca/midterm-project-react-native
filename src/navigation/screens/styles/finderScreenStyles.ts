import { StyleSheet } from "react-native";

export const finderScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  searchInput: {
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
    overflow: "hidden",
  },
  jobHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  jobHeaderInfoContainer: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  jobTitleWithLogo: {
    fontSize: 18,
    fontWeight: "700",
    flexShrink: 1,
  },
  cardLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  companyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    flexShrink: 1,
  },
  detailsSection: {
    gap: 8,
    marginBottom: 8,
  },
  detailsColumns: {
    flexDirection: "row",
    gap: 8,
  },
  detailsColumnBox: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fff",
  },
  detailsColumn: {
    gap: 8,
  },
  salaryCapsulesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },
  salarySeparator: {
    color: "#6b7280",
    fontWeight: "600",
  },
  tagsCapsuleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  tagsCapsulesWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagIcon: {
    marginTop: 6,
  },
  jobMeta: {
    fontSize: 14,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  },
  errorText: {
    color: "#dc2626",
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#6b7280",
  },
});
