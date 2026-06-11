import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

type GlassCardProps = ViewProps & {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <View className={`overflow-hidden rounded-3xl border border-white/60 ${className}`} {...props}>
      <BlurView intensity={28} tint="light" className="p-5">
        {children}
      </BlurView>
    </View>
  );
}
