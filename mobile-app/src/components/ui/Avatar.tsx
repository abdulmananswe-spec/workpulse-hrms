import { Image, Text, View } from "react-native";

type AvatarProps = {
  name?: string;
  uri?: string | null;
  size?: number;
};

export function Avatar({ name = "E", uri, size = 56 }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className="border-2 border-white"
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center border-2 border-white bg-indigo-100"
    >
      <Text className="text-xl font-bold text-indigo-700">
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
