import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

type AttendanceActionButtonProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant: "check-in" | "check-out";
};

export function AttendanceActionButton({
  title,
  subtitle,
  onPress,
  loading = false,
  disabled = false,
  variant,
}: AttendanceActionButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "check-in" ? styles.checkIn : styles.checkOut,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="large" />
      ) : (
        <>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 88,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  checkIn: {
    backgroundColor: "#059669",
  },
  checkOut: {
    backgroundColor: "#2563eb",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: "#ecfdf5",
    fontSize: 13,
    marginTop: 4,
  },
});
