import { router } from "expo-router";
import { Text, View } from "react-native";

import { BranchLocationMap } from "@/components/branch/BranchLocationMap";
import { FormCard, SubScreenLayout } from "@/components/ui/SubScreenLayout";
import { StatusBadge } from "@/components/ui/Feedback";
import { useAuth } from "@/contexts/AuthContext";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { parseBranchCoordinates } from "@/lib/branch-coordinates";

const UNCONFIGURED_BRANCH_MESSAGE =
  "Branch location has not been configured yet. Please contact your administrator.";

function BranchUnavailableState({ message }: { message: string }) {
  const tokens = useDesignTokens();

  return (
    <FormCard>
      <Text className="text-base leading-6" style={{ color: tokens.textSecondary }}>
        {message}
      </Text>
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
        title="Branch Information"
        subtitle="Contact your administrator for branch assignment."
        onBack={() => router.back()}
      >
        <BranchUnavailableState message="No branch is assigned to your profile yet." />
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
      title="Branch Information"
      subtitle="Your assigned workplace and geofence zone."
      onBack={() => router.back()}
    >
      <FormCard>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-xl font-bold" style={{ color: tokens.text }}>
            {branch.name}
          </Text>
          <StatusBadge
            label={branch.is_active ? "Active" : "Inactive"}
            tone={branch.is_active ? "success" : "danger"}
          />
        </View>
        <Text className="text-sm leading-6" style={{ color: tokens.textSecondary }}>
          {branch.address ?? "No address provided"}
        </Text>
        <Text className="mt-4 text-sm" style={{ color: tokens.textSecondary }}>
          Geofence radius: {branch.radius_meters ?? "—"} meters
        </Text>
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
