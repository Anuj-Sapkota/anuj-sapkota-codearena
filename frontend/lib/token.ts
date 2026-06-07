/**
 * In-memory access token store.
 * Never persisted to localStorage or cookies — lives only for the current tab session.
 * On page refresh, AuthHydrator calls /auth/refresh to get a new one.
 */
let _accessToken: string | null = null;

export const tokenStore = {
  get: () => _accessToken,
  set: (token: string) => { _accessToken = token; },
  clear: () => { _accessToken = null; },
};
