import { useMemo } from "react";

import { getTokens } from "@/lib/theme";
import { useTheme } from "@/providers/ThemeProvider";

export function useDesignTokens() {
  const { isDark } = useTheme();
  return useMemo(() => getTokens(isDark), [isDark]);
}
