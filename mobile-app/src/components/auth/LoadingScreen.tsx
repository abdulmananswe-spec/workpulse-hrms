import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0f172a" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    gap: 16,
  },
  message: {
    fontSize: 16,
    color: "#64748b",
  },
});
