import { useState } from "react";
import { StyleSheet, Text, TextInput as RNTextInput, View } from "react-native";
import type { TextInputProps as RNTextInputProps } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

import { useDesignTokens } from "@/hooks/useDesignTokens";

type TextInputProps = RNTextInputProps & {
  label: string;
  error?: string | null;
  style?: any;
};

export function TextInput({ label, error, style, ...props }: TextInputProps) {
  const tokens = useDesignTokens();
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(
        error ? tokens.danger : isFocused ? tokens.primary : tokens.border,
        { duration: 150 }
      ),
      backgroundColor: withTiming(
        isFocused ? tokens.backgroundElevated : tokens.backgroundMuted,
        { duration: 150 }
      ),
    };
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: tokens.textSecondary }]}>{label}</Text>
      <Animated.View style={[styles.inputWrapper, inputStyle]}>
        <RNTextInput
          placeholderTextColor={tokens.textMuted}
          style={[styles.input, { color: tokens.text }, style]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </Animated.View>
      {error ? (
        <Text style={[styles.error, { color: tokens.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    width: "100%",
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  input: {
    width: "100%",
    fontSize: 16,
    paddingVertical: 12,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
  },
});
