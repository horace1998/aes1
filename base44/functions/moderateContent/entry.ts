import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Hard keyword blocklist — obvious slurs / explicit terms (fast, free).
// Lowercase, partial-match. Keep tight; AI handles nuance.
const HARD_BLOCK = [
  'porn', 'pornhub', 'xxx', 'nsfw', 'nude', 'nudes', 'naked', 'sex', 'sexy time',
  'fuck', 'fucking', 'shit', 'bitch', 'asshole', 'whore', 'slut',
  'nigger', 'faggot', 'retard',
  'onlyfans', 'cumming', 'masturbat', 'pussy', 'dick pic',
  'kill yourself', 'kys',
];

// Simple in-memory rate limiter (per warm instance).
const rateMap = new Map(); // email -> { count, windowStart, lastPostAt }
const HOURLY_LIMIT = 30;   // posts/comments per hour
const MIN_GAP_MS = 5_000;  // 5s between submissions

function checkRate(email) {
  const now = Date.now();
  const rec = rateMap.get(email) || { count: 0, windowStart: now, lastPostAt: 0 };
  if (now - rec.windowStart > 60 * 60 * 1000) {
    rec.count = 0;
    rec.windowStart = now;
  }
  if (now - rec.lastPostAt < MIN_GAP_MS) {
    return { ok: false, reason: 'Slow down — wait a few seconds before posting again.' };
  }
  if (rec.count >= HOURLY_LIMIT) {
    return { ok: false, reason: 'Hourly post limit reached. Try again later.' };
  }
  rec.count += 1;
  rec.lastPostAt = now;
  rateMap.set(email, rec);
  return { ok: true };
}

function hardBlock(text) {
  const lower = (text || '').toLowerCase();
  for (const term of HARD_BLOCK) {
    if (lower.includes(term)) return term;
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, kind } = await req.json(); // kind: 'post' | 'comment' | 'mission'
    if (!text || typeof text !== 'string') {
      return Response.json({ verdict: 'allow' });
    }

    // 1) Rate limit
    const rate = checkRate(user.email);
    if (!rate.ok) {
      return Response.json({ verdict: 'block', reason: rate.reason });
    }

    // 2) Hard keyword block
    const hit = hardBlock(text);
    if (hit) {
      return Response.json({
        verdict: 'block',
        reason: "Let's keep it K-pop & supportive 💜",
      });
    }

    // 3) AI moderation
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the content moderator for a K-pop fan self-improvement community app.
Users post about their personal goals, milestones, and supportive comments to fellow fans.

Decide whether the following ${kind || 'post'} is allowed.

BLOCK if it contains:
- Sexual / NSFW / 18+ content
- Hate speech, slurs, harassment, threats
- Politics, political figures, election content
- Spam, scams, ads, links to external sites, crypto, gambling
- Self-harm or dangerous content
- Off-topic chit-chat unrelated to fandom or self-improvement (e.g. dating ads, random rants)

ALLOW if it is:
- A genuine personal goal, progress update, milestone, or supportive comment
- About K-pop idols, fandom, fitness, study, wellness, creativity, lifestyle improvement

Respond strictly as JSON.

Content to moderate:
"""${text.slice(0, 1000)}"""`,
      response_json_schema: {
        type: 'object',
        properties: {
          verdict: { type: 'string', enum: ['allow', 'block'] },
          reason: { type: 'string' },
        },
        required: ['verdict'],
      },
    });

    if (result?.verdict === 'block') {
      return Response.json({
        verdict: 'block',
        reason: result.reason || "Let's keep it K-pop & supportive 💜",
      });
    }

    return Response.json({ verdict: 'allow' });
  } catch (error) {
    // Fail open so legitimate users aren't blocked by infra issues
    return Response.json({ verdict: 'allow', error: error.message });
  }
});