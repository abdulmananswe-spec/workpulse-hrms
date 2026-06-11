import { useEffect, useState, type ReactNode } from "react";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/providers/ThemeProvider";
import {
  changePassword,
  updateAvatarUrl,
  updateProfileDetails,
  uploadAvatar,
} from "@/services/profile";

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { isDark, mode, setMode } = useTheme();
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

  async function pickAvatar() {
    if (!user) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo access to upload an avatar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setLoading(true);
    try {
      const asset = result.assets[0];
      const url = await uploadAvatar(user.id, asset.uri, asset.mimeType ?? "image/jpeg");
      await updateAvatarUrl(user.id, url);
      await refreshProfile();
      Alert.alert("Updated", "Avatar uploaded successfully.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Upload failed.");
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
    <SafeAreaView className={`flex-1 ${isDark ? "bg-slate-950" : "bg-surface-muted"}`} edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-semibold text-indigo-600">Back</Text>
        </Pressable>
        <Text className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          Account Settings
        </Text>

        <View className={`mt-6 rounded-3xl p-5 shadow-premium ${isDark ? "bg-slate-900" : "bg-white"}`}>
          <Text className={`mb-3 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Appearance
          </Text>
          <View className="flex-row gap-2">
            {(["light", "dark", "system"] as const).map((option) => (
              <Pressable
                key={option}
                onPress={() => setMode(option)}
                className={`flex-1 rounded-2xl py-3 ${
                  mode === option ? "bg-indigo-600" : isDark ? "bg-slate-800" : "bg-slate-100"
                }`}
              >
                <Text
                  className={`text-center font-semibold capitalize ${
                    mode === option ? "text-white" : isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-6 items-center rounded-3xl bg-white p-5 shadow-premium">
          <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={84} />
          <Pressable onPress={() => void pickAvatar()} className="mt-4 rounded-full bg-indigo-600 px-5 py-2">
            <Text className="font-semibold text-white">Upload Avatar</Text>
          </Pressable>
        </View>

        <Section title="Profile">
          <Field label="Full Name" value={fullName} onChangeText={setFullName} />
          <Field label="Phone" value={phone} onChangeText={setPhone} />
          <ActionButton title={loading ? "Saving..." : "Save Profile"} onPress={() => void saveProfile()} />
        </Section>

        <Section title="Change Password">
          <Field label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secure />
          <Field label="New Password" value={newPassword} onChangeText={setNewPassword} secure />
          <Field label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secure />
          <ActionButton title="Update Password" onPress={() => void savePassword()} />
        </Section>

        <Pressable
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
          className="mt-4 rounded-2xl bg-rose-50 py-4 dark:bg-rose-950/40"
        >
          <Text className="text-center font-bold text-rose-600">Logout</Text>
        </Pressable>

        <View className="mt-8 items-center pb-4">
          <Text className="text-center text-xs text-slate-400">© 2026 WorkPulse HRMS</Text>
          <Text className="mt-1 text-center text-xs text-slate-400">Developed by Abdul Manan</Text>
          <Text className="text-center text-xs text-slate-400">All Rights Reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mt-6 rounded-3xl bg-white p-5 shadow-premium">
      <Text className="mb-4 text-lg font-bold text-slate-900">{title}</Text>
      {children}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  secure,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secure?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-slate-700">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
      />
    </View>
  );
}

function ActionButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="rounded-2xl bg-indigo-600 py-4">
      <Text className="text-center font-bold text-white">{title}</Text>
    </Pressable>
  );
}
