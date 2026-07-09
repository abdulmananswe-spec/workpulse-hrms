import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
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
import { UNAUTHORIZED_MESSAGE } from "@/lib/auth";
import { isValidEmail } from "@/lib/validation";

function mapAuthError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === UNAUTHORIZED_MESSAGE) return UNAUTHORIZED_MESSAGE;
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return "Invalid email or password.";
    }
    return error.message;
  }
  return "Unable to sign in. Please try again.";
}

export default function LoginScreen() {
  const { signIn, authError, clearAuthError } = useAuth();
  const tokens = useDesignTokens();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayError = fieldError ?? authError;

  async function handleLogin() {
    clearAuthError();
    setFieldError(null);

    if (!email.trim() || !password.trim()) {
      setFieldError("Email and password are required.");
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (error) {
      setFieldError(mapAuthError(error));
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
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow px-6 pb-6 pt-10"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-10">
              <LinearGradient
                colors={[tokens.primary, tokens.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="mb-6 h-12 w-12 items-center justify-center rounded-[16px] shadow-lg"
              >
                <Ionicons name="sparkles" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: tokens.primary }}>
                WorkPulse Platform
              </Text>
              <Text className="mt-3 text-[36px] font-black leading-tight tracking-tight text-white">
                Enterprise HR & Attendance.
              </Text>
              <Text className="mt-3 text-sm leading-6 text-indigo-100/80">
                Secure workspace access for employees. Realtime geofenced clocking.
              </Text>
            </View>

            <View
              className="rounded-[32px] p-6"
              style={{
                backgroundColor: tokens.backgroundElevated,
                borderWidth: 1,
                borderColor: tokens.border,
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.08,
                shadowRadius: 40,
                elevation: 6,
              }}
            >
              <Text className="text-xl font-bold tracking-tight" style={{ color: tokens.text }}>
                Sign In
              </Text>
              <Text className="mt-1 text-xs" style={{ color: tokens.textSecondary }}>
                Enter your credentials to enter your workplace
              </Text>

              {displayError ? (
                <View
                  className="mt-4 rounded-xl px-4 py-3"
                  style={{ backgroundColor: tokens.dangerSoft, borderWidth: 1, borderColor: `${tokens.danger}22` }}
                >
                  <Text className="text-center text-xs font-semibold" style={{ color: tokens.danger }}>
                    {displayError}
                  </Text>
                </View>
              ) : null}

              <View className="mt-6">
                <FormField
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder="name@company.com"
                  returnKeyType="next"
                />
                <FormField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="password"
                  placeholder="Enter secure password"
                  returnKeyType="done"
                  onSubmitEditing={() => void handleLogin()}
                />
              </View>

              <Link href="/(auth)/forgot-password" asChild>
                <Pressable className="mb-4 self-center py-1">
                  <Text className="text-xs font-semibold" style={{ color: tokens.primary }}>
                    Recover password?
                  </Text>
                </Pressable>
              </Link>

              <PrimaryButton
                title={isSubmitting ? "Signing in..." : "Sign In Securely"}
                loading={isSubmitting}
                onPress={() => void handleLogin()}
              />

              <View className="mt-6 flex-row items-center justify-center gap-2">
                <Ionicons name="shield-checkmark" size={14} color={tokens.success} />
                <Text className="text-[10px] font-semibold" style={{ color: tokens.textMuted }}>
                  End-to-end Encrypted · SOC-2 Infrastructure
                </Text>
              </View>
            </View>
          </ScrollView>

          <View className="px-6 pb-2">
            <Text className="text-center text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
              © 2026 WorkPulse · All Rights Reserved
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
