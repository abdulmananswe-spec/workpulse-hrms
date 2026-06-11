import MapView, { Circle, Marker } from "react-native-maps";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";

export default function BranchScreen() {
  const { profile } = useAuth();
  const branch = profile?.branch;

  if (!branch) {
    return (
      <SafeAreaView className="flex-1 bg-surface-muted px-5 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-semibold text-indigo-600">Back</Text>
        </Pressable>
        <Text className="text-2xl font-bold text-slate-900">No branch assigned</Text>
        <Text className="mt-2 text-slate-500">Contact your administrator for branch assignment.</Text>
      </SafeAreaView>
    );
  }

  const latitude = Number(branch.latitude);
  const longitude = Number(branch.longitude);

  return (
    <SafeAreaView className="flex-1 bg-surface-muted" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-semibold text-indigo-600">Back</Text>
        </Pressable>
        <Text className="text-3xl font-bold text-slate-900">Branch Information</Text>

        <View className="mt-6 rounded-3xl bg-white p-5 shadow-premium">
          <Text className="text-xl font-bold text-slate-900">{branch.name}</Text>
          <Text className="mt-2 text-sm text-slate-500">{branch.address ?? "No address provided"}</Text>
          <Text className="mt-4 text-sm text-slate-600">
            Geofence radius: {branch.radius_meters} meters
          </Text>
          <Text className="mt-1 text-sm text-slate-600">
            Status: {branch.is_active ? "Active" : "Inactive"}
          </Text>
        </View>

        <View className="mt-6 h-72 overflow-hidden rounded-3xl">
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
      </ScrollView>
    </SafeAreaView>
  );
}
