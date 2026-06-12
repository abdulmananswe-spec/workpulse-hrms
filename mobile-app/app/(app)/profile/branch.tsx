import MapView, { Circle, Marker } from "react-native-maps";
import { router } from "expo-router";
import { Text, View } from "react-native";

import { FormCard, SubScreenLayout } from "@/components/ui/SubScreenLayout";
import { StatusBadge } from "@/components/ui/Feedback";
import { useAuth } from "@/contexts/AuthContext";
import { useDesignTokens } from "@/hooks/useDesignTokens";

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
        <FormCard>
          <Text className="text-base leading-6" style={{ color: tokens.textSecondary }}>
            No branch is assigned to your profile yet.
          </Text>
        </FormCard>
      </SubScreenLayout>
    );
  }

  const latitude = Number(branch.latitude);
  const longitude = Number(branch.longitude);

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
          <StatusBadge label={branch.is_active ? "Active" : "Inactive"} tone={branch.is_active ? "success" : "danger"} />
        </View>
        <Text className="text-sm leading-6" style={{ color: tokens.textSecondary }}>
          {branch.address ?? "No address provided"}
        </Text>
        <Text className="mt-4 text-sm" style={{ color: tokens.textSecondary }}>
          Geofence radius: {branch.radius_meters} meters
        </Text>
      </FormCard>

      <View className="mt-6 h-72 overflow-hidden rounded-3xl" style={{ borderWidth: 1, borderColor: tokens.borderSubtle }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={{ latitude, longitude }} title={branch.name} />
          <Circle
            center={{ latitude, longitude }}
            radius={branch.radius_meters}
            strokeColor="rgba(79, 70, 229, 0.8)"
            fillColor="rgba(79, 70, 229, 0.15)"
          />
        </MapView>
      </View>
    </SubScreenLayout>
  );
}
