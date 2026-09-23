import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

const AUTH_STORAGE_KEY = 'vitalsync_auth_session';
const DEFAULT_GOOGLE_CLIENT_ID = '382290945097-8uhpbbrsaqdr38dmivqmbpljs2e95mde.apps.googleusercontent.com';

/**
 * Helper to safely decode Google JWT payload without external libraries.
 */
function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    if (typeof window === 'undefined' || typeof window.atob !== 'function') return null;
    const jsonString = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/**
 * Initiates Google Sign-In.
 * On Native Android/iOS: Uses native Google Play Services Credential Manager.
 *   Shows the native 1-tap account selector bottom sheet with zero email/password typing.
 * On Web: Falls back to browser OAuth redirect.
 *
 * @returns {Promise<{ id: string, name: string, email: string, avatarUrl: string|null }|null>}
 */
export async function loginWithGoogle() {
  const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

  if (Capacitor.isNativePlatform()) {
    try {
      // NOTE: Do NOT pass scopes here; passing scopes triggers a secondary authorization resolution intent
      // which hangs/cancels. Credential Manager automatically returns user profile and idToken.
      await GoogleSignIn.initialize({
        clientId,
      });

      const res = await GoogleSignIn.signIn();
      const jwtPayload = decodeJwtPayload(res?.idToken);

      const userId = res?.userId || jwtPayload?.sub || res?.email || jwtPayload?.email;
      if (!userId) {
        throw new Error('Google Sign-In completed but no user identifier was returned.');
      }

      const user = {
        id: String(userId),
        name:
          res?.displayName ||
          jwtPayload?.name ||
          res?.givenName ||
          jwtPayload?.given_name ||
          (res?.email || jwtPayload?.email || 'Google User').split('@')[0],
        email: res?.email || jwtPayload?.email || '',
        avatarUrl: res?.imageUrl || jwtPayload?.picture || null,
      };

      setStoredAuthSession(user);
      return user;
    } catch (err) {
      console.error('Native Google Sign-In error:', err);
      throw err;
    }
  } else {
    // Web desktop fallback
    redirectToGoogleOAuth();
    return null;
  }
}

/**
 * Retrieves the stored auth session if any.
 * @returns {object|null}
 */
export function getStoredAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persists the current auth session.
 * @param {object|null} session
 */
export function setStoredAuthSession(session) {
  try {
    if (session) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to store auth session:', e);
  }
}

/**
 * Redirects the user's browser directly to Google's official OAuth 2.0 endpoint in Chrome/browser.
 */
export function redirectToGoogleOAuth() {
  const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
  const redirectUri = window.location.origin || `${window.location.protocol}//${window.location.host}`;
  const scope = 'openid profile email';
  const responseType = 'token';
  const prompt = 'select_account';

  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&prompt=${prompt}`;

  // Redirect the browser window directly to Google accounts
  window.location.href = oauthUrl;
}

/**
 * Inspects the current URL hash for Google OAuth access_token returned after redirection.
 * Fetches authentic user metadata from Google's userinfo endpoint.
 *
 * @returns {Promise<{ id: string, name: string, email: string, avatarUrl: string|null }|null>}
 */
export async function handleGoogleOAuthCallback() {
  if (typeof window === 'undefined' || !window.location.hash) return null;

  const hash = window.location.hash.substring(1);
  if (!hash) return null;

  const params = new window.URLSearchParams(hash);
  const accessToken = params.get('access_token');
  if (!accessToken) return null;

  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Google userinfo returned status ${res.status}`);
    }

    const info = await res.json();
    const user = {
      id: info.sub,
      name: info.name || info.given_name || info.email.split('@')[0],
      email: info.email,
      avatarUrl: info.picture || null,
    };

    // Remove token from browser address bar history
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

    setStoredAuthSession(user);
    return user;
  } catch (err) {
    console.error('Failed to parse Google OAuth callback:', err);
    return null;
  }
}

/**
 * Signs out of Google SSO and clears stored session.
 */
export async function signOutGoogle() {
  if (Capacitor.isNativePlatform()) {
    try {
      await GoogleSignIn.signOut();
    } catch (e) {
      console.warn('Native signOut error:', e);
    }
  }
  setStoredAuthSession(null);
}
