// utils/deliveryTime.ts
export function calculateDeliveryTimeHours(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  speedKmh = 70,
  minHours = 2
) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  const distance = 2 * R * Math.asin(Math.sqrt(aa));
  const hours = distance / speedKmh;
  return Math.max(minHours, hours);
}

export function formatDeliveryTime(hours: number): string {
  if (hours < 24) {
    return `${Math.round(hours)} hour${Math.round(hours) === 1 ? '' : 's'}`;
  }
  const days = Math.round(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  const weeks = Math.round(days / 7);
  return `${weeks} week${weeks === 1 ? '' : 's'}`;
}
