import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useDesignTokens } from "@/hooks/useDesignTokens";

type FormFieldProps = TextInputProps & {
  label: string;
};

export function FormField({ label, ...props }: FormFieldProps) {
  const tokens = useDesignTokens();

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold" style={{ color: tokens.textSecondary }}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={tokens.textMuted}
        className="rounded-2xl px-4 py-3"
        style={{
          borderWidth: 1,
          borderColor: tokens.borderSubtle,
          backgroundColor: tokens.backgroundMuted,
          color: tokens.text,
        }}
        {...props}
      />
    </View>
  );
}

type ChipSelectProps<T extends string> = {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
};

export function ChipSelect<T extends string>({ label, options, value, onChange }: ChipSelectProps<T>) {
  const tokens = useDesignTokens();

  return (
    <View className="mb-4">
      <Text className="mb-3 text-sm font-semibold" style={{ color: tokens.textSecondary }}>
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              className="rounded-full px-4 py-2"
              style={{ backgroundColor: selected ? tokens.primary : tokens.backgroundMuted }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: selected ? "#FFFFFF" : tokens.textSecondary }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function PrimaryButton({
  title,
  loading,
  variant = "primary",
  onPress,
}: {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
  onPress: () => void;
}) {
  const tokens = useDesignTokens();
  const isSecondary = variant === "secondary";
  return (
    <PressableScale disabled={loading} onPress={onPress}>
      <View
        className="mt-2 rounded-2xl py-4"
        style={{
          backgroundColor: isSecondary
            ? tokens.backgroundMuted
            : loading
              ? `${tokens.primary}AA`
              : tokens.primary,
          borderWidth: isSecondary ? 1 : 0,
          borderColor: tokens.borderSubtle,
        }}
      >
        <Text
          className="text-center text-base font-bold"
          style={{ color: isSecondary ? tokens.text : "#FFFFFF" }}
        >
          {title}
        </Text>
      </View>
    </PressableScale>
  );
}
