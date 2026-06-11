import { Redirect } from "expo-router";

import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Restoring session..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
