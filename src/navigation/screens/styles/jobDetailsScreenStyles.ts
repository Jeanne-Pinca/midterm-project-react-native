import { StyleSheet } from "react-native";

export const jobDetailsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 24,
  },
  listContainerWithStickyPadding: {
    paddingBottom: 112,
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
    marginBottom: 6,
  },
  descriptionBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    gap: 6,
  },
  descriptionSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2e1065",
  },
  descriptionSectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 6,
  },
  descriptionSectionRowSpaced: {
    marginTop: 20,
  },
  descriptionSectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#d1d5db",
  },
  descriptionSectionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 21,
    flex: 1,
  },
  descriptionBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingLeft: 15,
    paddingRight: 15,
  },
  descriptionBulletDot: {
    fontSize: 16,
    color: "#d1d5db",
    lineHeight: 21,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionsInlineContainer: {
    marginTop: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  actionsStickyContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  errorText: {
    color: "#dc2626",
    marginTop: 8,
  },
});
