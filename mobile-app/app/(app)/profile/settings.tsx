import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Alert, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { FormField, PrimaryButton } from "@/components/ui/FormField";
import { PressableScale } from "@/components/ui/PressableScale";
import { FormCard, SubScreenLayout } from "@/components/ui/SubScreenLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { useTheme } from "@/providers/ThemeProvider";
import { changePassword, updateProfileDetails } from "@/services/profile";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const tokens = useDesignTokens();
  const { mode, setMode } = useTheme();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile?.full_name, profile?.phone]);

  async function saveProfile() {
    if (!user) return;
    if (!fullName.trim()) {
      Alert.alert("Invalid name", "Full name is required.");
      return;
    }
    setLoading(true);
    try {
      await updateProfileDetails(user.id, { full_name: fullName, phone });
      await refreshProfile();
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setLoading(false);
    }
  }

  async function savePassword() {
    if (!user?.email) return;
    if (!currentPassword.trim()) {
      Alert.alert("Required", "Enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Invalid password", "New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword, user.email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Updated", "Password changed successfully.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SubScreenLayout
      title="Account Settings"
      subtitle="Security, appearance, and profile details"
      onBack={() => router.back()}
    >
      <View
        className="mb-6 flex-row items-center rounded-3xl p-4"
        style={{
          backgroundColor: tokens.backgroundElevated,
          borderWidth: 1,
          borderColor: tokens.borderSubtle,
        }}
      >
        <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={52} showStatus ring />
        <View className="ml-4 flex-1">
          <Text className="text-base font-bold" style={{ color: tokens.text }} numberOfLines={1}>
            {profile?.full_name}
          </Text>
          <Text className="mt-0.5 text-xs" style={{ color: tokens.textSecondary }} numberOfLines={1}>
            {profile?.email}
          </Text>
          <Text className="mt-2 text-[11px]" style={{ color: tokens.textMuted }}>
            Photo managed by your administrator
          </Text>
        </View>
      </View>

      <FormCard>
        <Text className="mb-4 text-base font-bold" style={{ color: tokens.text }}>
          Appearance
        </Text>
        <View className="flex-row gap-2">
          {(["light", "dark", "system"] as const).map((option) => (
            <PressableScale key={option} onPress={() => setMode(option)} style={{ flex: 1 }}>
              <View
                className="rounded-2xl py-3"
                style={{
                  backgroundColor: mode === option ? tokens.primary : tokens.backgroundMuted,
                }}
              >
                <Text
                  className="text-center text-sm font-semibold capitalize"
                  style={{ color: mode === option ? "#FFFFFF" : tokens.textSecondary }}
                >
                  {option}
                </Text>
              </View>
            </PressableScale>
          ))}
        </View>
      </FormCard>

      <View className="h-4" />

      <FormCard>
        <Text className="mb-2 text-base font-bold" style={{ color: tokens.text }}>
          Profile
        </Text>
        <FormField label="Full Name" value={fullName} onChangeText={setFullName} />
        <FormField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <PrimaryButton
          title={loading ? "Saving..." : "Save Profile"}
          loading={loading}
          onPress={() => void saveProfile()}
        />
      </FormCard>

      <View className="h-4" />

      <FormCard>
        <Text className="mb-2 text-base font-bold" style={{ color: tokens.text }}>
          Change Password
        </Text>
        <FormField
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
        <FormField label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <FormField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <PrimaryButton title="Update Password" onPress={() => void savePassword()} />
      </FormCard>

      <PressableScale
        onPress={() => {
          void (async () => {
            try {
              queryClient.clear();
              await signOut();
            } catch {
              Alert.alert("Error", "Sign out failed. Please try again.");
            }
          })();
        }}
      >
        <View className="mt-4 rounded-2xl py-4" style={{ backgroundColor: tokens.dangerSoft }}>
          <Text className="text-center font-bold" style={{ color: tokens.danger }}>
            Sign Out
          </Text>
        </View>
      </PressableScale>

      <Text className="mt-8 text-center text-xs" style={{ color: tokens.textMuted }}>
        © 2026 WorkPulse HRMS
      </Text>
    </SubScreenLayout>
  );
}
