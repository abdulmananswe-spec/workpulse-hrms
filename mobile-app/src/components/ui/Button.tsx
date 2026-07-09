import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { PressableProps, ViewStyle } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useDesignTokens } from "@/hooks/useDesignTokens";

type ButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  style?: any;
};

export function Button({
  title,
  loading = false,
  variant = "primary",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const tokens = useDesignTokens();
  const isDisabled = disabled || loading;

  const getStyles = () => {
    switch (variant) {
      case "primary":
        return {
          bg: tokens.primary,
          text: "#FFFFFF",
          border: 0,
          borderColor: "transparent",
        };
      case "secondary":
        return {
          bg: tokens.backgroundMuted,
          text: tokens.text,
          border: 1,
          borderColor: tokens.border,
        };
      case "ghost":
        return {
          bg: "transparent",
          text: tokens.primary,
          border: 0,
          borderColor: "transparent",
        };
    }
  };

  const buttonStyle = getStyles();

  return (
    <PressableScale
      disabled={isDisabled}
      style={[
        styles.base,
        {
          backgroundColor: buttonStyle.bg,
          borderWidth: buttonStyle.border,
          borderColor: buttonStyle.borderColor,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={buttonStyle.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: buttonStyle.text }]}>{title}</Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
