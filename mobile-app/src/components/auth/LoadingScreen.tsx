import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Text, View } from "react-native";

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <LinearGradient colors={["#1E1B4B", "#312E81", "#4338CA"]} className="flex-1">
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-6 h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
        <Text className="text-lg font-semibold text-white">WorkPulse HRMS</Text>
        <Text className="mt-2 text-center text-sm text-indigo-100">{message}</Text>
      </View>
    </LinearGradient>
  );
}
