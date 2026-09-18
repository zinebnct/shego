import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/actions/Button';
import { TabPlaceholder } from '@/components/foundation/TabPlaceholder';

/** Mon profil + accès aux paramètres (Blueprint produit §19). */
export default function Profil() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <TabPlaceholder title={t('tabs.profile')}>
      <Button
        label={t('settings.title')}
        variant="secondary"
        onPress={() => router.push('/settings')}
      />
    </TabPlaceholder>
  );
}
