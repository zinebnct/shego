import { render, screen } from '@testing-library/react-native';
import { TabBadge, formatBadgeCount } from './TabBadge';

describe('TabBadge', () => {
  it('plafonne à « 9+ » et n’affiche jamais « 99+ »', () => {
    expect(formatBadgeCount(3)).toBe('3');
    expect(formatBadgeCount(9)).toBe('9');
    expect(formatBadgeCount(10)).toBe('9+');
    expect(formatBadgeCount(250)).toBe('9+');
  });

  it('ne rend rien pour un compteur vide', async () => {
    await render(<TabBadge count={0} />);
    expect(screen.queryByTestId('tab-badge-count')).toBeNull();
  });

  it('rend un point pour l’activité non lue', async () => {
    await render(<TabBadge dot />);
    expect(screen.getByTestId('tab-badge-dot')).toBeTruthy();
  });
});
