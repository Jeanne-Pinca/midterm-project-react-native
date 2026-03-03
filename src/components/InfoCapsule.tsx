import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type InfoCapsuleProps = {
  text: string;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  expand?: boolean;
  onPress?: () => void;
};

export default function InfoCapsule({
  text,
  iconName,
  expand = true,
  onPress,
}: InfoCapsuleProps) {
  const capsuleContent = (
    <Text style={[styles.text, onPress && styles.linkText]}>{text}</Text>
  );

  return (
    <View style={styles.row}>
      {iconName ? (
        <MaterialCommunityIcons name={iconName} size={16} color="#6b7280" />
      ) : null}

      {onPress ? (
        <Pressable
          style={[styles.capsule, expand && styles.capsuleExpand]}
          onPress={onPress}
        >
          {capsuleContent}
        </Pressable>
      ) : (
        <View style={[styles.capsule, expand && styles.capsuleExpand]}>
          {capsuleContent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },
  capsule: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: "100%",
  },
  capsuleExpand: {
    flex: 1,
    minWidth: 0,
  },
  text: {
    fontSize: 12,
    color: "#374151",
    flexShrink: 1,
  },
  linkText: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
