import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormField, PrimaryButton } from "@/components/ui/FormField";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { supabase } from "@/lib/supabase";
import { PressableScale } from "@/components/ui/PressableScale";

export default function ResetPasswordScreen() {
  const tokens = useDesignTokens();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setIsReady(Boolean(data.session));
    });
  }, []);

  async function handleSubmit() {
    if (password.length < 8) {
      Alert.alert("Invalid password", "Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      Alert.alert("Password updated", "Sign in with your new password.");
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert(
        "Reset failed",
        error instanceof Error ? error.message : "Unable to reset password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: tokens.background }}>
        <ActivityIndicator size="large" color={tokens.primary} />
        <Text className="mt-4 text-xs font-semibold" style={{ color: tokens.textSecondary }}>
          Validating reset link...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: tokens.background }}>
      <LinearGradient colors={tokens.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="absolute inset-0" />
      <LinearGradient
        colors={["transparent", tokens.background]}
        className="absolute inset-0"
        start={{ x: 0, y: 0.25 }}
        end={{ x: 0, y: 0.9 }}
      />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow px-6 pb-6 pt-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <PressableScale onPress={() => router.replace("/(auth)/login")} className="mb-6 flex-row items-center self-start" scale={0.9} haptic>
              <View className="flex-row items-center bg-white/10 px-3 py-1.5 rounded-full">
                <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
                <Text className="ml-1.5 text-xs font-semibold text-white">Back</Text>
              </View>
            </PressableScale>

            <View className="mb-8">
              <Text className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: tokens.primary }}>
                Security
              </Text>
              <Text className="mt-3 text-[32px] font-bold leading-tight tracking-tight text-white">
                New Password
              </Text>
              <Text className="mt-3 text-sm leading-6 text-indigo-100/80">
                Choose a strong password to protect your HR account.
              </Text>
            </View>

            <View
              className="rounded-[32px] p-6"
              style={{
                backgroundColor: tokens.backgroundElevated,
                borderWidth: 1,
                borderColor: tokens.border,
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.08,
                shadowRadius: 32,
                elevation: 6,
              }}
            >
              <FormField
                label="New Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
                placeholder="Minimum 8 characters"
              />
              <FormField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
                placeholder="Confirm password"
                onSubmitEditing={() => void handleSubmit()}
              />

              <PrimaryButton
                title={isSubmitting ? "Updating..." : "Update Password"}
                loading={isSubmitting}
                onPress={() => void handleSubmit()}
              />

              <View className="mt-6 flex-row items-center justify-center gap-2">
                <Ionicons name="lock-closed" size={14} color={tokens.success} />
                <Text className="text-[10px] font-semibold" style={{ color: tokens.textMuted }}>
                  Passwords are encrypted end-to-end
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
