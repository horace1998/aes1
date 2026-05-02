import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { createLocalBase44Client } from './localBase44Client';
import { createFirebaseBase44Client, hasFirebaseConfig } from './firebaseBase44Client';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const hasConfiguredBase44Backend = Boolean(
  import.meta.env.VITE_BASE44_APP_ID && import.meta.env.VITE_BASE44_APP_BASE_URL
);
const isBrowser = typeof window !== 'undefined';
const hostname = isBrowser ? window.location.hostname : '';
const isLocalPreview = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
const shouldUseFirebaseClient = hasFirebaseConfig && import.meta.env.VITE_USE_LOCAL_BASE44 !== 'true';
const shouldUseLocalClient =
  !shouldUseFirebaseClient &&
  isLocalPreview &&
  (!hasConfiguredBase44Backend || import.meta.env.VITE_USE_LOCAL_BASE44 === 'true');

const createMissingFirebaseClient = () => ({
  isMissingFirebaseConfig: true,
  auth: {
    me: async () => {
      throw new Error('Production Firebase config is missing. Add VITE_FIREBASE_* build variables in Cloudflare.');
    },
    updateMe: async () => {
      throw new Error('Production Firebase config is missing. Add VITE_FIREBASE_* build variables in Cloudflare.');
    },
    logout: async () => {},
    redirectToLogin: async () => {
      throw new Error('Production Firebase config is missing. Add VITE_FIREBASE_* build variables in Cloudflare.');
    },
  },
  entities: {},
  functions: {
    invoke: async () => ({ data: { success: false, error: 'Production Firebase config is missing.' } }),
  },
  integrations: {
    Core: {
      UploadFile: async () => {
        throw new Error('Production Firebase config is missing. Add VITE_FIREBASE_* build variables in Cloudflare.');
      },
    },
  },
});

// Prefer Firebase when configured. Local demo storage is allowed only on localhost.
export const base44 = shouldUseLocalClient
  ? createLocalBase44Client()
  : shouldUseFirebaseClient
    ? createFirebaseBase44Client()
    : hasConfiguredBase44Backend
      ? createClient({
        appId,
        token,
        functionsVersion,
        serverUrl: '',
        requiresAuth: false,
        appBaseUrl,
      })
      : createMissingFirebaseClient();
