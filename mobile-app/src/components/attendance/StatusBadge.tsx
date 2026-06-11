import { StyleSheet, Text, View } from "react-native";

type StatusBadgeProps = {
  label: string;
};

export function StatusBadge({ label }: StatusBadgeProps) {
  const tone = getTone(label);

  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.text, { color: tone.fg }]}>{label}</Text>
    </View>
  );
}

function getTone(label: string) {
  if (label.includes("Present") && !label.includes("Not")) {
    return { bg: "#dcfce7", fg: "#15803d" };
  }

  if (label.includes("Checked Out")) {
    return { bg: "#dbeafe", fg: "#1d4ed8" };
  }

  if (label.includes("Late")) {
    return { bg: "#fef3c7", fg: "#b45309" };
  }

  return { bg: "#f1f5f9", fg: "#475569" };
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  text: {
    fontSize: 13,
    fontWeight: "700",
  },
});
