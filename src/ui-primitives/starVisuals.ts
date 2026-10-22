// Shared by the menu burst and the breathing dust around the title.
export const STAR_FLARE_PATH =
  "M48 0 C49 39 50 46 57 47 L96 48 57 49 C50 50 49 57 48 96 C47 57 46 50 39 49 L0 48 39 47 C46 46 47 39 48 0Z";

export function starRandom(seed: string) {
  let state = [...seed].reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    2166136261,
  );
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function irregularStar(random: () => number) {
  const rays = random() > 0.45 ? 4 : 5;
  return Array.from({ length: rays * 2 }, (_, point) => {
    const radius = point % 2 === 0 ? 32 + random() * 18 : 9 + random() * 14;
    const theta = (point / (rays * 2)) * Math.PI * 2;
    return `${50 + Math.cos(theta) * radius}% ${50 + Math.sin(theta) * radius}%`;
  }).join(", ");
}
