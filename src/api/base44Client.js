import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { createLocalBase44Client } from './localBase44Client';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const hasConfiguredBase44Backend = Boolean(
  import.meta.env.VITE_BASE44_APP_ID && import.meta.env.VITE_BASE44_APP_BASE_URL
);
const shouldUseLocalClient = !hasConfiguredBase44Backend || import.meta.env.VITE_USE_LOCAL_BASE44 === 'true';

// Use Base44 when env vars are configured; otherwise run fully locally.
export const base44 = shouldUseLocalClient
  ? createLocalBase44Client()
  : createClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      requiresAuth: false,
      appBaseUrl,
    });
