import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { UNAUTHORIZED_MESSAGE } from "@/lib/auth";
import { isValidEmail } from "@/lib/validation";

function mapAuthError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === UNAUTHORIZED_MESSAGE) {
      return UNAUTHORIZED_MESSAGE;
    }

    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return "Invalid email or password.";
    }

    return error.message;
  }

  return "Unable to sign in. Please try again.";
}

export default function LoginScreen() {
  const { signIn, authError, clearAuthError } = useAuth();
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
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.badge}>WorkPulse HRMS</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to access your attendance workspace.
            </Text>
          </View>

          <View style={styles.card}>
            {displayError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{displayError}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="employee@company.com"
              placeholderTextColor="#94a3b8"
              returnKeyType="next"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType="password"
              placeholder="Enter your password"
              placeholderTextColor="#94a3b8"
              returnKeyType="done"
              onSubmitEditing={() => void handleLogin()}
            />

            <Link href="/(auth)/forgot-password" style={styles.link}>
              Forgot password?
            </Link>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isSubmitting}
            onPress={() => void handleLogin()}
            style={[styles.signInButton, isSubmitting && styles.signInButtonDisabled]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.copyright}>© 2026 WorkPulse HRMS</Text>
          <Text style={styles.developer}>Developed by Abdul Manan</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  hero: {
    marginBottom: 24,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
    overflow: "hidden",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#64748b",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    overflow: "visible",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#0f172a",
    backgroundColor: "#ffffff",
    marginBottom: 16,
  },
  link: {
    marginTop: 4,
    textAlign: "center",
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  signInButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  signInButtonDisabled: {
    opacity: 0.75,
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  copyright: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 11,
    color: "#94a3b8",
  },
  developer: {
    marginTop: 2,
    textAlign: "center",
    fontSize: 11,
    color: "#94a3b8",
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: "#b91c1c",
    fontSize: 14,
    textAlign: "center",
  },
});
