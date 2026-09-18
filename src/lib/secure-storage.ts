/**
 * Stockage de la session Supabase dans le Keychain (iOS) / Keystore (Android) via expo-secure-store.
 * SecureStore limite chaque valeur à ~2 Ko : une session Supabase est plus grosse → découpage en morceaux.
 * `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` : le rafraîchissement du jeton reste possible en arrière-plan,
 * et la session n'est pas restaurée depuis une sauvegarde vers un autre appareil.
 */
import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1800;
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

const countKey = (key: string) => `${key}.n`;
const chunkKey = (key: string, index: number) => `${key}.${index}`;

async function readCount(key: string): Promise<number> {
  const raw = await SecureStore.getItemAsync(countKey(key), OPTIONS);
  const count = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(count) && count > 0 ? count : 0;
}

export const secureSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = await readCount(key);
    if (count === 0) return null;
    const parts: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const part = await SecureStore.getItemAsync(chunkKey(key, i), OPTIONS);
      if (part === null) return null; // session corrompue : traitée comme absente
      parts.push(part);
    }
    return parts.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    await secureSessionStorage.removeItem(key);
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i += 1) {
      await SecureStore.setItemAsync(
        chunkKey(key, i),
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
        OPTIONS,
      );
    }
    await SecureStore.setItemAsync(countKey(key), String(count), OPTIONS);
  },

  async removeItem(key: string): Promise<void> {
    const count = await readCount(key);
    for (let i = 0; i < count; i += 1) {
      await SecureStore.deleteItemAsync(chunkKey(key, i), OPTIONS);
    }
    await SecureStore.deleteItemAsync(countKey(key), OPTIONS);
  },
};
