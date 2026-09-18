import { I18nManager } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, iconSizes, iconStroke } from '@/design-system';

/**
 * Icônes : trait ouvert (outline), épaisseur 1,75 sur grille 24, extrémités arrondies (Design System §6).
 * Jeu minimal nécessaire au socle. AUCUNE icône de bouclier / de coche de confiance : SHEGO ne badge jamais une
 * identité (DS §14). Icônes de catégorie spécifiques : à livrer avec les assets finaux (`dots` = repli générique).
 */
const paths = {
  home: 'M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z',
  calendar:
    'M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z M4 10h16 M8 4v4 M16 4v4',
  plus: 'M12 5v14 M5 12h14',
  chat: 'M5 6h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-7l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4.5 20a7.5 7.5 0 0 1 15 0',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 8h.01',
  close: 'M6 6l12 12 M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chevronBack: 'M15 5l-7 7 7 7',
  chevronForward: 'M9 5l7 7-7 7',
  bell: 'M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z M10 20a2 2 0 0 0 4 0',
  pin: 'M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  camera:
    'M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  image:
    'M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M4 16l5-5 4 4 3-3 4 4 M9 9.5h.01',
  bolt: 'M13 3 5 13.5h6L10 21l8-10.5h-6z',
  more: 'M5 12h.01 M12 12h.01 M19 12h.01',
  dots: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M8 12h.01 M12 12h.01 M16 12h.01',
} as const;

export type IconName = keyof typeof paths;

/** Icônes directionnelles : miroir en RTL. Temps, lieu, caméra, logo : jamais (DS §6 règle 4). */
const DIRECTIONAL: readonly IconName[] = ['chevronBack', 'chevronForward'];

export interface IconProps {
  name: IconName;
  size?: keyof typeof iconSizes | number;
  color?: string;
  /** Remplissage réservé à l'onglet actif (DS §6). */
  filled?: boolean;
}

export function Icon({
  name,
  size = 'base',
  color = colors.text.encre70,
  filled = false,
}: IconProps) {
  const px = typeof size === 'number' ? size : iconSizes[size];
  const mirror = I18nManager.isRTL && DIRECTIONAL.includes(name);
  return (
    <Svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      style={mirror ? { transform: [{ scaleX: -1 }] } : undefined}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d={paths[name]}
        stroke={color}
        strokeWidth={iconStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}
