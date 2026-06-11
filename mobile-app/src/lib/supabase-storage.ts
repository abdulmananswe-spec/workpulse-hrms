import * as SecureStore from "expo-secure-store";

const SECURE_STORE_LIMIT = 2048;

export const supabaseSecureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => {
    if (value.length > SECURE_STORE_LIMIT) {
      console.warn(
        `[Supabase] Session value exceeds SecureStore limit (${SECURE_STORE_LIMIT} bytes).`,
      );
    }

    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
