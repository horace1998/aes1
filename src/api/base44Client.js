import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { createLocalBase44Client } from './localBase44Client';
import { createFirebaseBase44Client, hasFirebaseConfig } from './firebaseBase44Client';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const hasConfiguredBase44Backend = Boolean(
  import.meta.env.VITE_BASE44_APP_ID && import.meta.env.VITE_BASE44_APP_BASE_URL
);
const shouldUseFirebaseClient = hasFirebaseConfig && import.meta.env.VITE_USE_LOCAL_BASE44 !== 'true';
const shouldUseLocalClient =
  !shouldUseFirebaseClient && (!hasConfiguredBase44Backend || import.meta.env.VITE_USE_LOCAL_BASE44 === 'true');

// Prefer Firebase when configured, keep Base44 compatibility, and fall back to local dev storage.
export const base44 = shouldUseLocalClient
  ? createLocalBase44Client()
  : shouldUseFirebaseClient
    ? createFirebaseBase44Client()
    : createClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      requiresAuth: false,
      appBaseUrl,
    });
