import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing } from '@/design-system';
import { Button } from '../actions/Button';
import { IconButton } from '../actions/IconButton';
import { Screen } from '../foundation/Screen';
import { Text } from '../foundation/Text';

/** Nombre d'écrans du parcours (Onboarding V1.3 §3) — la barre de progression est fine, Grenat sur Bordure. */
export const ONBOARDING_TOTAL_STEPS = 11;

export interface OnboardingScaffoldProps {
  /** Position 1-11 dans le parcours. */
  step: number;
  title: string;
  subtitle?: string;
  cta: string;
  onContinue: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  /** Action secondaire (Tertiary) : `Passer`, `Plus tard`… */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Pas de bouton retour sur l'écran 1 (porte d'entrée unique). */
  showBack?: boolean;
  children?: ReactNode;
}

/**
 * Gabarit commun des écrans d'onboarding (Onboarding V1.3 §4) : retour, barre de progression, titre-question dans le tiers
 * supérieur, contrôle, CTA plein largeur COLLÉ en bas. Le CTA est le seul moyen d'avancer — aucun geste ne contourne une
 * étape obligatoire (le swipe retour est désactivé par la pile d'onboarding).
 */
export function OnboardingScaffold({
  step,
  title,
  subtitle,
  cta,
  onContinue,
  ctaDisabled,
  ctaLoading,
  secondaryLabel,
  onSecondary,
  showBack = true,
  children,
}: OnboardingScaffoldProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Screen
      scroll
      footer={
        <View style={styles.footer}>
          <Button label={cta} onPress={onContinue} disabled={ctaDisabled} loading={ctaLoading} />
          {secondaryLabel && onSecondary ? (
            <Button label={secondaryLabel} onPress={onSecondary} variant="tertiary" />
          ) : null}
        </View>
      }
    >
      <View style={styles.header}>
        {showBack ? (
          <IconButton
            icon="chevronBack"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}
          />
        ) : null}
      </View>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel={t('onboarding.progress', {
          current: step,
          total: ONBOARDING_TOTAL_STEPS,
        })}
        accessibilityValue={{ min: 1, max: ONBOARDING_TOTAL_STEPS, now: step }}
      >
        <View style={[styles.fill, { width: `${(step / ONBOARDING_TOTAL_STEPS) * 100}%` }]} />
      </View>
      <View style={styles.body}>
        <Text variant="h1" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body" tone="secondary" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
        <View style={styles.content}>{children}</View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { height: 56, justifyContent: 'center', alignItems: 'flex-start' },
  track: {
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.border.default,
    overflow: 'hidden',
  },
  fill: { height: 3, backgroundColor: colors.brand.grenat },
  body: { flex: 1, paddingTop: spacing[9] },
  subtitle: { marginTop: spacing[3] },
  content: { marginTop: spacing[7] },
  footer: { gap: spacing[2] },
});
