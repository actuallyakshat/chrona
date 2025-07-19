import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { mutation } from './_generated/server';

type User = Doc<'user'>;

function kmBetween(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(aa));
}

function similarity(
  u: User,
  pref: NonNullable<User['preferences']>,
  viewerLoc?: { lat: number; lon: number }
): number {
  let score = 0;
  let weight = 0;

  if (u.age !== undefined && pref.minAge !== undefined && pref.maxAge !== undefined) {
    score += u.age >= pref.minAge && u.age <= pref.maxAge ? 1 : 0;
    weight += 1;
  }

  if (pref.gender && u.gender) {
    score += pref.gender === 'any' || pref.gender === u.gender ? 1 : 0;
    weight += 1;
  }

  if (pref.preferredLanguages?.length && u.languagesSpoken?.length) {
    const overlap = pref.preferredLanguages.filter((l) => u.languagesSpoken!.includes(l)).length;
    score += overlap / Math.max(pref.preferredLanguages.length, u.languagesSpoken.length);
    weight += 1;
  }

  if (pref.interests?.length && u.interests?.length) {
    const overlap = pref.interests.filter((i) => u.interests!.includes(i)).length;
    score += overlap / Math.max(pref.interests.length, u.interests.length);
    weight += 1;
  }

  if (viewerLoc && u.location && pref.maxDistance) {
    const userLoc = {
      lat: u.location.latitude,
      lon: u.location.longitude,
    };
    const dist = kmBetween(viewerLoc, userLoc);
    score += Math.max(0, 1 - dist / pref.maxDistance);
    weight += 1;
  }

  return weight === 0 ? 0 : score / weight;
}

export const recommend = mutation({
  args: { viewerId: v.id('user') },
  handler: async (ctx, { viewerId }) => {
    const viewer = await ctx.db.get(viewerId);
    if (!viewer) return [];

    const pref = viewer.preferences ?? {
      minAge: 18,
      maxAge: 99,
      maxDistance: 10000,
      preferredLanguages: [],
      gender: 'any',
      interests: [],
    };

    // 1. grab everybody
    const allUsers = await ctx.db.query('user').collect();

    // 2. filter out self & already recommended
    const pool = allUsers.filter(
      (u) => u._id !== viewerId && !viewer?.recommended?.includes(u._id)
    );

    // 3. exact‐match pass
    const exact = pool.filter((u) => {
      if (u.age !== undefined && (u.age < pref.minAge || u.age > pref.maxAge)) return false;
      if (pref.gender !== 'any' && u.gender !== pref.gender) return false;
      if (
        pref.preferredLanguages?.length &&
        !pref.preferredLanguages.some((l) => u.languagesSpoken?.includes(l))
      )
        return false;
      if (pref.interests?.length && !pref.interests.some((i) => u.interests?.includes(i)))
        return false;
      if (pref.maxDistance && viewer.location && u.location) {
        const viewerLoc = {
          lat: viewer.location.latitude,
          lon: viewer.location.longitude,
        };
        const userLoc = {
          lat: u.location.latitude,
          lon: u.location.longitude,
        };
        if (kmBetween(viewerLoc, userLoc) > pref.maxDistance) return false;
      }
      return true;
    });

    // 4. if exact < 3, broaden to `pool`
    const candidates = exact.length >= 3 ? exact : pool;
    const viewerLoc = viewer.location
      ? {
          lat: viewer.location.latitude,
          lon: viewer.location.longitude,
        }
      : undefined;

    const scored = candidates
      .map((u) => ({ user: u, score: similarity(u, pref, viewerLoc) }))
      .sort((a, b) => b.score - a.score);

    // 5. pick top 3 at random from top‐20
    const top20 = scored.slice(0, 20);
    top20.sort(() => Math.random() - 0.5);
    const top3 = top20.slice(0, 3).map((s) => s.user);

    // If first time, update recommended and lastRecommendationDate
    if (!viewer.recommended || viewer.recommended.length === 0) {
      await ctx.db.patch(viewerId, {
        recommended: top3.map((u) => u._id),
        lastRecommendationDate: new Date().toISOString(),
      });
    }

    return top3;
  },
});
