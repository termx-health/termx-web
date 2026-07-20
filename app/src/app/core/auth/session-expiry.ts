/**
 * Decision logic for the pre-expiry session warning, kept free of Angular and of the clock so it
 * can be reasoned about (and exercised) directly. {@link AuthService.watchSessionExpiry} supplies
 * the tokens and the current time.
 */

/** `exp` out of a JWT, or undefined when the token is absent, opaque or malformed. */
export function readJwtExp(token?: string | null): number | undefined {
  const payload = token?.split('.')[1];
  if (!payload) {
    return undefined;
  }
  try {
    // base64url -> base64 before decoding; JWT payloads are not padded base64.
    const exp = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))['exp'];
    return typeof exp === 'number' ? exp : undefined;
  } catch {
    return undefined;
  }
}

export interface SessionExpiryState {
  /** `exp` claim of the access token, in seconds. */
  accessExp?: number;
  /** Raw refresh token, if the flow issued one. */
  refreshToken?: string | null;
  /** Current time, in seconds. */
  nowSec: number;
  /** Warn once this little of the session is left, in seconds. */
  thresholdSec: number;
}

/**
 * Whether the user should be warned that their session is about to end.
 *
 * True only when the access token is inside the threshold **and** the refresh token cannot rescue
 * the session — a silent refresh is about to happen otherwise, and warning would be noise.
 *
 * A refresh token we cannot read (opaque tokens are not JWTs) is treated as able to refresh: a
 * sticky banner on every session would be worse than occasionally missing a warning.
 */
export function shouldWarnAboutExpiry(state: SessionExpiryState): boolean {
  const {accessExp, refreshToken, nowSec, thresholdSec} = state;
  if (!accessExp) {
    return false;
  }
  if (accessExp - nowSec > thresholdSec) {
    return false;
  }
  if (!refreshToken) {
    return true;
  }
  const refreshExp = readJwtExp(refreshToken);
  if (refreshExp === undefined) {
    return false;
  }
  return refreshExp - nowSec <= thresholdSec;
}
