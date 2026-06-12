import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormField, PrimaryButton } from "@/components/ui/FormField";
import { useAuth } from "@/contexts/AuthContext";
import { useDesignTokens } from "@/hooks/useDesignTokens";

function mapResetError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unable to send reset email. Please try again.";
}

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const tokens = useDesignTokens();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleReset() {
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setSuccess("Password reset instructions have been sent to your email.");
    } catch (resetError) {
      setError(mapResetError(resetError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View className="flex-1" style={{ backgroundColor: tokens.background }}>
      <LinearGradient colors={tokens.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="absolute inset-0" />
      <LinearGradient
        colors={["transparent", tokens.background]}
        className="absolute inset-0"
        start={{ x: 0, y: 0.3 }}
        end={{ x: 0, y: 1 }}
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
            <Pressable onPress={() => router.back()} className="mb-6 flex-row items-center self-start">
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              <Text className="ml-2 font-semibold text-white">Back</Text>
            </Pressable>

            <View className="mb-8">
              <Text className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">
                Account Recovery
              </Text>
              <Text className="mt-3 text-[32px] font-bold leading-tight tracking-tight text-white">
                Reset your password
              </Text>
              <Text className="mt-3 text-base leading-6 text-indigo-100/90">
                Enter your work email and we will send secure reset instructions.
              </Text>
            </View>

            <View
              className="rounded-[28px] p-6"
              style={{
                backgroundColor: tokens.backgroundElevated,
                borderWidth: 1,
                borderColor: tokens.borderSubtle,
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.12,
                shadowRadius: 32,
                elevation: 10,
              }}
            >
              {error ? (
                <View
                  className="mb-4 rounded-2xl px-4 py-3"
                  style={{ backgroundColor: tokens.dangerSoft, borderWidth: 1, borderColor: `${tokens.danger}33` }}
                >
                  <Text className="text-center text-sm font-medium" style={{ color: tokens.danger }}>
                    {error}
                  </Text>
                </View>
              ) : null}

              {success ? (
                <View
                  className="mb-4 rounded-2xl px-4 py-3"
                  style={{ backgroundColor: tokens.successSoft, borderWidth: 1, borderColor: `${tokens.success}33` }}
                >
                  <Text className="text-center text-sm font-medium" style={{ color: tokens.success }}>
                    {success}
                  </Text>
                </View>
              ) : null}

              <FormField
                label="Work Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder="employee@company.com"
              />

              <PrimaryButton
                title={isSubmitting ? "Sending..." : "Send Reset Link"}
                loading={isSubmitting}
                onPress={() => void handleReset()}
              />

              {success ? (
                <PrimaryButton
                  title="Return to Sign In"
                  variant="secondary"
                  onPress={() => router.replace("/(auth)/login")}
                />
              ) : null}

              <Link href="/(auth)/login" asChild>
                <Text className="mt-4 text-center text-sm font-semibold" style={{ color: tokens.primary }}>
                  Back to sign in
                </Text>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
