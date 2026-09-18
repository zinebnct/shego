import {
  ACCOUNT_STATUSES,
  canCreateJoinChat,
  isAccessBlocked,
  isAccountStatus,
  isUnderReview,
} from './account-status';

describe('account_status (règles LOCKED)', () => {
  it('a exactement quatre valeurs', () => {
    expect([...ACCOUNT_STATUSES]).toEqual(['active', 'under_review', 'suspended', 'banned']);
  });

  it('Create / Join / Chat : uniquement pour un compte active', () => {
    expect(canCreateJoinChat('active')).toBe(true);
    expect(canCreateJoinChat('under_review')).toBe(false);
    expect(canCreateJoinChat('suspended')).toBe(false);
    expect(canCreateJoinChat('banned')).toBe(false);
  });

  it('distingue under_review (limité) de suspended/banned (bloqué)', () => {
    expect(isUnderReview('under_review')).toBe(true);
    expect(isAccessBlocked('under_review')).toBe(false);
    expect(isAccessBlocked('suspended')).toBe(true);
    expect(isAccessBlocked('banned')).toBe(true);
    expect(isAccessBlocked('active')).toBe(false);
  });

  it('rejette toute valeur hors des quatre statuts', () => {
    expect(isAccountStatus('pending')).toBe(false);
    expect(isAccountStatus('verified')).toBe(false);
    expect(isAccountStatus(undefined)).toBe(false);
  });
});
