// Room amenities: a list of {label, value}, e.g. {label:"Bed", value:"King"}
export const MAX_SPECS = 12;

const COMMON = ["Bed", "Size", "View", "Wi-Fi", "Breakfast", "Shower"];

// quick-add suggestions per room type
export const SPEC_PRESETS = {
  "Standard": ["Bed", "Size", "View", "Wi-Fi", "Breakfast", "Desk"],
  "Deluxe": ["Bed", "Balcony", "View", "Size", "Minibar", "Shower"],
  "Executive": ["Bed", "Lounge", "Breakfast", "Desk", "View", "Wi-Fi"],
  "Family": ["Bedrooms", "Sleeps", "Living area", "Kitchenette", "Kitchen", "Breakfast"],
  "Suite": ["Bed", "Lounge", "Living area", "Size", "Breakfast", "Shower"],
  "Studio": ["Bed", "Kitchenette", "Desk", "Laundry", "Size", "Wi-Fi"],
  "Accessible": ["Access", "Shower", "Bed", "Lounge", "Size", "Wi-Fi"],
  "Penthouse": ["Bed", "Terrace", "Views", "Size", "Breakfast", "Minibar"],
};
export const presetsFor = (type) => SPEC_PRESETS[type] || COMMON;

// what a typical value looks like (shown as the placeholder)
const HINTS = {
  "bed": "King",
  "beds": "2 x Twin",
  "bedrooms": "2",
  "sleeps": "4",
  "size": "32 m²",
  "view": "Sea",
  "views": "180°",
  "wi-fi": "Free",
  "breakfast": "Included",
  "shower": "Rain",
  "balcony": "Private",
  "terrace": "Private",
  "minibar": "Yes",
  "desk": "Yes",
  "lounge": "Access",
  "living area": "Yes",
  "kitchenette": "Full",
  "kitchen": "Yes",
  "laundry": "On site",
  "access": "Step-free",
};
export const hintFor = (label) => HINTS[String(label || "").trim().toLowerCase()] || "Yes";

export const ALL_LABELS = [...new Set([...Object.values(SPEC_PRESETS).flat(), ...COMMON])].sort();

let counter = 0;
export const newRow = (label = "", value = "") => ({ id: `spec-${Date.now()}-${counter++}`, label, value });
export const toRows = (specs) => (Array.isArray(specs) ? specs : []).map((s) => newRow(s.label, s.value));

// trims, drops empty rows; `incomplete` counts rows that have only a name or only a value
export function cleanSpecs(rows) {
  const specs = [];
  let incomplete = 0;
  for (const row of rows) {
    const label = row.label.trim();
    const value = row.value.trim();
    if (!label && !value) continue;
    if (!label || !value) { incomplete++; continue; }
    specs.push({ label, value });
  }
  return { specs, incomplete };
}
