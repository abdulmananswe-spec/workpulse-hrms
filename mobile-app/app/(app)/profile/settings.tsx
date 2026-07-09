import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Alert, Text, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { Avatar } from "@/components/ui/Avatar";
import { FormField, PrimaryButton } from "@/components/ui/FormField";
import { PressableScale } from "@/components/ui/PressableScale";
import { FormCard, SubScreenLayout } from "@/components/ui/SubScreenLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { useTheme } from "@/providers/ThemeProvider";
import { changePassword, updateProfileDetails } from "@/services/profile";

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
      title="Settings"
      subtitle="Manage profile parameters, themes, and account security"
      onBack={() => router.back()}
    >
      <View
        className="mb-6 flex-row items-center rounded-3xl p-4 border"
        style={{
          backgroundColor: tokens.backgroundElevated,
          borderColor: tokens.border,
        }}
      >
        <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={52} showStatus ring />
        <View className="ml-4 flex-1">
          <Text className="text-base font-bold tracking-tight" style={{ color: tokens.text }} numberOfLines={1}>
            {profile?.full_name}
          </Text>
          <Text className="text-xs" style={{ color: tokens.textSecondary }} numberOfLines={1}>
            {profile?.email}
          </Text>
          <Text className="mt-2 text-[10px] font-semibold text-zinc-500">
            Profile photo is managed by your administrator
          </Text>
        </View>
      </View>

      <FormCard>
        <Text className="mb-4 text-sm font-black tracking-tight" style={{ color: tokens.text }}>
          Theme Mode
        </Text>
        <View className="flex-row gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
          {(["light", "dark", "system"] as const).map((option) => {
            const isActive = mode === option;
            return (
              <PressableScale key={option} onPress={() => setMode(option)} style={{ flex: 1 }} scale={0.96} haptic>
                <View
                  className="rounded-xl py-2.5"
                  style={{
                    backgroundColor: isActive ? tokens.backgroundElevated : "transparent",
                    shadowColor: isActive ? "#000" : "transparent",
                    shadowOffset: { width: 0, height: isActive ? 2 : 0 },
                    shadowOpacity: isActive ? 0.05 : 0,
                    shadowRadius: 4,
                    elevation: isActive ? 2 : 0,
                  }}
                >
                  <Text
                    className="text-center text-xs font-bold uppercase tracking-wider"
                    style={{ color: isActive ? tokens.text : tokens.textSecondary }}
                  >
                    {option}
                  </Text>
                </View>
              </PressableScale>
            );
          })}
        </View>
      </FormCard>

      <View className="h-4" />

      <FormCard>
        <Text className="mb-4 text-sm font-black tracking-tight" style={{ color: tokens.text }}>
          Update Profile Details
        </Text>
        <FormField label="Full Name" value={fullName} onChangeText={setFullName} />
        <FormField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <PrimaryButton
          title={loading ? "Saving Changes..." : "Save Details"}
          loading={loading}
          onPress={() => void saveProfile()}
        />
      </FormCard>

      <View className="h-4" />

      <FormCard>
        <Text className="mb-4 text-sm font-black tracking-tight" style={{ color: tokens.text }}>
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
        style={{ marginTop: 24 }}
        scale={0.98}
        haptic
      >
        <View className="rounded-[18px] py-4 items-center justify-center border" style={{ backgroundColor: tokens.dangerSoft, borderColor: `${tokens.danger}33` }}>
          <Text className="font-bold text-base tracking-wide" style={{ color: tokens.danger }}>
            Sign Out
          </Text>
        </View>
      </PressableScale>
    </SubScreenLayout>
  );
}
