import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormField, PrimaryButton } from "@/components/ui/FormField";
import { useAuth } from "@/contexts/AuthContext";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { PressableScale } from "@/components/ui/PressableScale";

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
      setSuccess("Reset link sent successfully. Please check your inbox.");
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
            <PressableScale onPress={() => router.back()} className="mb-6 flex-row items-center self-start" scale={0.9} haptic>
              <View className="flex-row items-center bg-white/10 px-3 py-1.5 rounded-full">
                <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
                <Text className="ml-1.5 text-xs font-semibold text-white">Back</Text>
              </View>
            </PressableScale>

            <View className="mb-8">
              <Text className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: tokens.primary }}>
                Account Recovery
              </Text>
              <Text className="mt-3 text-[32px] font-bold leading-tight tracking-tight text-white">
                Reset Password
              </Text>
              <Text className="mt-3 text-sm leading-6 text-indigo-100/80">
                Enter your registered work email and we will dispatch a recovery link.
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
              {error ? (
                <View
                  className="mb-4 rounded-xl px-4 py-3"
                  style={{ backgroundColor: tokens.dangerSoft, borderWidth: 1, borderColor: `${tokens.danger}22` }}
                >
                  <Text className="text-center text-xs font-semibold" style={{ color: tokens.danger }}>
                    {error}
                  </Text>
                </View>
              ) : null}

              {success ? (
                <View
                  className="mb-4 rounded-xl px-4 py-3"
                  style={{ backgroundColor: tokens.successSoft, borderWidth: 1, borderColor: `${tokens.success}22` }}
                >
                  <Text className="text-center text-xs font-semibold" style={{ color: tokens.success }}>
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
                placeholder="name@company.com"
              />

              <PrimaryButton
                title={isSubmitting ? "Sending Link..." : "Send Recovery Email"}
                loading={isSubmitting}
                onPress={() => void handleReset()}
              />

              {success ? (
                <View className="mt-2">
                  <PrimaryButton
                    title="Return to Sign In"
                    variant="secondary"
                    onPress={() => router.replace("/(auth)/login")}
                  />
                </View>
              ) : null}

              <Link href="/(auth)/login" asChild>
                <PressableScale className="mt-4 self-center py-2" scale={0.97} haptic={false}>
                  <Text className="text-xs font-semibold" style={{ color: tokens.primary }}>
                    Back to Sign In
                  </Text>
                </PressableScale>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
