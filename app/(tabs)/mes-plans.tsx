import { useTranslation } from 'react-i18next';
import { TabPlaceholder } from '@/components/foundation/TabPlaceholder';

export default function MesPlans() {
  const { t } = useTranslation();
  return <TabPlaceholder title={t('tabs.myPlans')} />;
}
