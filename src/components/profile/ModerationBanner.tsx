import { useTranslation } from 'react-i18next';
import { isUnderReview, type AccountStatus } from '@/lib/account-status';
import { Banner } from '../feedback/Banner';

/**
 * Bannière d'état de compte (Design System §14, §19) : UN SEUL état visuel — `under_review`.
 * Info, persistante, non fermable, priorité maximale sur la Home. `under_review` ne désigne JAMAIS une vérification :
 * uniquement un examen de modération après signalement ou comportement suspect.
 */
export function ModerationBanner({ status }: { status: AccountStatus }) {
  const { t } = useTranslation();
  if (!isUnderReview(status)) return null;
  return <Banner tone="info" message={t('account.underReview')} testID="moderation-banner" />;
}
