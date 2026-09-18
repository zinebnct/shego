import { fireEvent, render, screen } from '@testing-library/react-native';
import fr from '@/i18n/fr.json';
import { AccountGateSheet } from './AccountGateSheet';

const renderSheet = async (gate: Parameters<typeof AccountGateSheet>[0]['gate']) => {
  const onAction = jest.fn();
  const onClose = jest.fn();
  await render(<AccountGateSheet visible gate={gate} onAction={onAction} onClose={onClose} />);
  return { onAction, onClose };
};

describe('AccountGateSheet — un seul composant, un seul message précis', () => {
  it('photo absente : message exact + bouton Ajouter', async () => {
    const { onAction } = await renderSheet('photo');
    expect(screen.getByText(fr.account.gate.photo)).toBeTruthy();
    await fireEvent.press(screen.getByText(fr.common.add));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('profil incomplet : message exact + bouton Continuer', async () => {
    await renderSheet('profile');
    expect(screen.getByText(fr.account.gate.profile)).toBeTruthy();
    expect(screen.getByText(fr.common.continue)).toBeTruthy();
  });

  it('les deux manquent : message combiné', async () => {
    await renderSheet('profile_and_photo');
    expect(screen.getByText(fr.account.gate.profileAndPhoto)).toBeTruthy();
  });

  it('under_review : information non actionnable, aucun bouton d’action', async () => {
    await renderSheet('under_review');
    expect(screen.getByText(fr.account.underReview)).toBeTruthy();
    expect(screen.queryByText(fr.common.continue)).toBeNull();
    expect(screen.queryByText(fr.common.add)).toBeNull();
  });

  it('ne rend rien quand le compte est prêt', async () => {
    await renderSheet('none');
    expect(screen.queryByTestId('account-gate-sheet')).toBeNull();
  });
});
