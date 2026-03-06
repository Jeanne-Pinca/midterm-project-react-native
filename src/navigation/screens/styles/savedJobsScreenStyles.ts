import { StyleSheet } from "react-native";

export const savedJobsScreenStyles = StyleSheet.create({
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
    paddingBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  jobHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  jobTitleWithLogo: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
  },
  cardLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    flexShrink: 0,
    backgroundColor: "#f3f4f6",
  },
  companyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
  },
  jobTypeText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  publishedRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  publishedText: {
    fontSize: 12,
    color: "#6b7280",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 18,
    marginBottom: 4,
  },
  tagIcon: {
    marginTop: 2.5,
  },
  iconText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  },
  applyButtonRow: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#6b7280",
  },
});
