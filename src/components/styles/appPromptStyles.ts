import { StyleSheet } from "react-native";

export const appPromptStyles = StyleSheet.create({
  toastWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: "center",
    zIndex: 30,
  },
  toastContainer: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "88%",
  },
  toastText: {
    color: "#fff",
    fontWeight: "600",
  },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  dialogContainer: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    color: "#111827",
  },
  dialogMessage: {
    fontSize: 15,
    lineHeight: 24,
    color: "#374151",
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionsRowSingle: {
    justifyContent: "center",
  },
  actionButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  actionButtonSpaced: {
    marginLeft: 10,
  },
  actionButtonSingle: {
    width: "100%",
    alignItems: "center",
  },
  actionButtonFullWidth: {
    flex: 1,
    alignItems: "center",
  },
  actionButtonPrimary: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  actionButtonDestructive: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  actionTextPrimary: {
    color: "#fff",
  },
});
