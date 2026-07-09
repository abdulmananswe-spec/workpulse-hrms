import { router } from "expo-router";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BranchLocationMap } from "@/components/branch/BranchLocationMap";
import { FormCard, SubScreenLayout } from "@/components/ui/SubScreenLayout";
import { StatusBadge } from "@/components/ui/Feedback";
import { useAuth } from "@/contexts/AuthContext";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { parseBranchCoordinates } from "@/lib/branch-coordinates";

const UNCONFIGURED_BRANCH_MESSAGE =
  "Branch location coordinates have not been configured yet. Please contact your system administrator.";

function BranchUnavailableState({ message }: { message: string }) {
  const tokens = useDesignTokens();

  return (
    <FormCard>
      <View className="items-center py-4">
        <Ionicons name="alert-circle-outline" size={32} color={tokens.warning} />
        <Text className="mt-3 text-center text-xs font-semibold leading-5" style={{ color: tokens.textSecondary }}>
          {message}
        </Text>
      </View>
    </FormCard>
  );
}

export default function BranchScreen() {
  const { profile } = useAuth();
  const tokens = useDesignTokens();
  const branch = profile?.branch;

  if (!branch) {
    return (
      <SubScreenLayout
        title="Branch Office"
        subtitle="View assigned workplace locations & geofences."
        onBack={() => router.back()}
      >
        <BranchUnavailableState message="No branch office is assigned to your profile yet." />
      </SubScreenLayout>
    );
  }

  const coordinates = parseBranchCoordinates({
    latitude: branch.latitude,
    longitude: branch.longitude,
    radiusMeters: branch.radius_meters,
  });

  return (
    <SubScreenLayout
      title="Branch Office"
      subtitle="View coordinates and geofence parameters."
      onBack={() => router.back()}
    >
      <FormCard>
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-3">
            <View className="h-9 w-9 rounded-xl items-center justify-center bg-indigo-500/10 mr-3">
              <Ionicons name="business" size={16} color={tokens.primary} />
            </View>
            <Text className="text-base font-black tracking-tight flex-1" style={{ color: tokens.text }} numberOfLines={1}>
              {branch.name}
            </Text>
          </View>
          <StatusBadge
            label={branch.is_active ? "Active" : "Inactive"}
            tone={branch.is_active ? "success" : "danger"}
          />
        </View>
        <Text className="text-xs font-semibold leading-5" style={{ color: tokens.textSecondary }}>
          {branch.address ?? "No address registered."}
        </Text>
        <View className="mt-4 flex-row items-center justify-between border-t pt-3" style={{ borderColor: tokens.borderSubtle }}>
          <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
            Geofence Radius
          </Text>
          <Text className="text-xs font-bold" style={{ color: tokens.text }}>
            {branch.radius_meters ?? "—"} meters
          </Text>
        </View>
      </FormCard>

      {coordinates ? (
        <BranchLocationMap branchName={branch.name} coordinates={coordinates} />
      ) : (
        <View className="mt-6">
          <BranchUnavailableState message={UNCONFIGURED_BRANCH_MESSAGE} />
        </View>
      )}
    </SubScreenLayout>
  );
}
