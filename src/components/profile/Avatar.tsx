import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { avatarSizes, colors } from '@/design-system';
import { Text } from '../foundation/Text';

export interface AvatarProps {
  size?: keyof typeof avatarSizes | number;
  /** URL (signée) de la photo. Absente : placeholder à l'initiale du prénom. */
  uri?: string | null;
  name?: string | null;
  /** Teinte de catégorie du dernier plan créé, sinon Argile (Design System §8). */
  tint?: string;
}

/**
 * Avatar : photo ou initiale — RIEN d'autre. Il n'existe AUCUNE variante « avec badge » : ni pastille, ni bouclier,
 * ni coche, à aucune taille (Design System §8, §22). Toujours circulaire, bordure interne 1 px.
 */
export function Avatar({ size = 'md', uri, name, tint }: AvatarProps) {
  const px = typeof size === 'number' ? size : avatarSizes[size];
  const initial = name?.trim().charAt(0).toLocaleUpperCase('fr-FR') ?? '';

  return (
    <View
      style={[
        styles.base,
        {
          width: px,
          height: px,
          borderRadius: px / 2,
          backgroundColor: tint ?? colors.surface.argile,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel={name ?? undefined}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: px, height: px }}
          contentFit="cover"
          transition={120}
        />
      ) : (
        <Text
          variant="bodyStrong"
          tone="secondary"
          style={{ fontSize: Math.round(px * 0.42), lineHeight: undefined }}
        >
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
});
