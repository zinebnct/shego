import { useTranslation } from 'react-i18next';
import { TabPlaceholder } from '@/components/foundation/TabPlaceholder';

/** Messages = chats de plans uniquement. Aucune messagerie privée 1-à-1 n'existe dans SHEGO. */
export default function Messages() {
  const { t } = useTranslation();
  return <TabPlaceholder title={t('tabs.messages')} />;
}
