import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
        start={{ x: 0, y: 0.35 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow px-6 pb-6 pt-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-8">
              <View
                className="mb-5 h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "rgba(255,255,255,0.16)" }}
              >
                <Text className="text-lg font-bold text-white">WP</Text>
              </View>
              <Text className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">
                WorkPulse HRMS
              </Text>
              <Text className="mt-3 text-[34px] font-bold leading-tight tracking-tight text-white">
                Enterprise attendance, simplified.
              </Text>
              <Text className="mt-3 text-base leading-6 text-indigo-100/90">
                Secure sign-in for employees. Trusted by modern HR teams.
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
              <Text className="text-xl font-bold" style={{ color: tokens.text }}>
                Sign in
              </Text>
              <Text className="mt-1 text-sm" style={{ color: tokens.textSecondary }}>
                Access your attendance workspace
              </Text>

              {displayError ? (
                <View
                  className="mt-4 rounded-2xl px-4 py-3"
                  style={{ backgroundColor: tokens.dangerSoft, borderWidth: 1, borderColor: `${tokens.danger}33` }}
                >
                  <Text className="text-center text-sm font-medium" style={{ color: tokens.danger }}>
                    {displayError}
                  </Text>
                </View>
              ) : null}

              <View className="mt-5">
                <FormField
                  label="Work Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder="employee@company.com"
                  returnKeyType="next"
                />
                <FormField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="password"
                  placeholder="Enter your password"
                  returnKeyType="done"
                  onSubmitEditing={() => void handleLogin()}
                />
              </View>

              <Link href="/(auth)/forgot-password" asChild>
                <Text className="mb-2 text-center text-sm font-semibold" style={{ color: tokens.primary }}>
                  Forgot password?
                </Text>
              </Link>

              <PrimaryButton
                title={isSubmitting ? "Signing in..." : "Sign In Securely"}
                loading={isSubmitting}
                onPress={() => void handleLogin()}
              />

              <View className="mt-6 flex-row items-center justify-center gap-2">
                <Ionicons name="shield-checkmark-outline" size={16} color={tokens.textMuted} />
                <Text className="text-xs" style={{ color: tokens.textMuted }}>
                  Encrypted connection · SOC-ready infrastructure
                </Text>
              </View>
            </View>
          </ScrollView>

          <View className="px-6 pb-2">
            <Text className="text-center text-xs" style={{ color: tokens.textMuted }}>
              © 2026 WorkPulse HRMS · Developed by Abdul Manan
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
