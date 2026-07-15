// Deterministic "field mark" swatch color derived from the species name,
// so each specimen card gets a consistent accent without storing one.
const SWATCHES = [
  "#7C8B6F", // moss
  "#9C4A32", // stamp red
  "#3F5C48", // pine
  "#8A6E3F", // ochre
  "#5B6E8C", // slate blue
  "#6E4A5C", // plum
];

export function swatchFor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return SWATCHES[Math.abs(hash) % SWATCHES.length];
}

export function formatCatalogNumber(n) {
  return `No. ${String(n).padStart(3, "0")}`;
}

export function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
