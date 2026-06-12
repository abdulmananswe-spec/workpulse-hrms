import { LinearGradient } from "expo-linear-gradient";
import { Image, Text, View } from "react-native";

import { useDesignTokens } from "@/hooks/useDesignTokens";

type AvatarProps = {
  name?: string;
  uri?: string | null;
  size?: number;
  showStatus?: boolean;
  ring?: boolean;
};

function getInitials(name?: string) {
  const parts = (name ?? "Employee").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "E";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function Avatar({ name, uri, size = 56, showStatus = false, ring = true }: AvatarProps) {
  const tokens = useDesignTokens();
  const initials = getInitials(name);
  const fontSize = Math.max(size * 0.34, 14);

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: ring ? 2 : 0,
            borderColor: tokens.backgroundElevated,
          }}
        />
      ) : (
        <LinearGradient
          colors={[tokens.primary, tokens.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: ring ? 2 : 0,
            borderColor: tokens.backgroundElevated,
          }}
        >
          <Text style={{ fontSize, fontWeight: "700", color: "#FFFFFF" }}>{initials}</Text>
        </LinearGradient>
      )}
      {showStatus ? (
        <View
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: size * 0.24,
            height: size * 0.24,
            borderRadius: size,
            backgroundColor: tokens.success,
            borderWidth: 2,
            borderColor: tokens.backgroundElevated,
          }}
        />
      ) : null}
    </View>
  );
}
