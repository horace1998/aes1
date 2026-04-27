import { base44 } from '@/api/base44Client';

/**
 * Moderate a piece of user-generated content.
 * Returns { ok: true } if allowed, or { ok: false, reason } if blocked.
 *
 * kind: 'post' | 'comment' | 'mission'
 */
export async function moderate(text, kind = 'post') {
  try {
    const res = await base44.functions.invoke('moderateContent', { text, kind });
    if (res?.data?.verdict === 'block') {
      return { ok: false, reason: res.data.reason || "Let's keep it K-pop & supportive 💜" };
    }
    return { ok: true };
  } catch (e) {
    // Fail open
    return { ok: true };
  }
}