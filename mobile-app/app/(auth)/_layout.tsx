import { Redirect, Stack } from "expo-router";

import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthLayout() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Restoring session..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
  );
}
