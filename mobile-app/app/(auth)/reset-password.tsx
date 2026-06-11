import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { supabase } from "@/lib/supabase";

export default function ResetPasswordScreen() {
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
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-muted">
        <Text className="text-slate-500">Validating reset link...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-muted px-6 pt-8">
      <Text className="text-3xl font-bold text-slate-900">Set new password</Text>
      <Text className="mt-2 text-slate-500">Choose a secure password for your account.</Text>

      <View className="mt-8 rounded-3xl bg-white p-5 shadow-premium">
        <Text className="mb-2 text-sm font-semibold text-slate-700">New Password</Text>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        />
        <Text className="mb-2 text-sm font-semibold text-slate-700">Confirm Password</Text>
        <TextInput
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        />
      </View>

      <Pressable
        disabled={isSubmitting}
        onPress={() => void handleSubmit()}
        className={`mt-6 rounded-2xl py-4 ${isSubmitting ? "bg-indigo-400" : "bg-indigo-600"}`}
      >
        <Text className="text-center font-bold text-white">
          {isSubmitting ? "Updating..." : "Update Password"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
