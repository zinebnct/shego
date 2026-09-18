import { render, screen } from '@testing-library/react-native';
import fr from '@/i18n/fr.json';
import { ACCOUNT_STATUSES } from '@/lib/account-status';
import { ModerationBanner } from './ModerationBanner';

describe('ModerationBanner — un seul état visuel', () => {
  it('s’affiche uniquement pour under_review, avec le texte LOCKED', async () => {
    await render(<ModerationBanner status="under_review" />);
    expect(screen.getByText(fr.account.underReview)).toBeTruthy();
  });

  it.each(ACCOUNT_STATUSES.filter((s) => s !== 'under_review'))(
    'ne s’affiche pas pour %s',
    async (status) => {
      await render(<ModerationBanner status={status} />);
      expect(screen.queryByTestId('moderation-banner')).toBeNull();
    },
  );
});
