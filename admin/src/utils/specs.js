// Room amenities: a list of {label, value}, e.g. {label:"Bed", value:"King"}
export const MAX_SPECS = 12;

// quick-add suggestions per room type (the types are listed in utils/categories.js)
export const SPEC_PRESETS = {
  "Standard": ["Bed", "Size", "View", "Wi-Fi", "Breakfast", "Shower"],
  "Deluxe": ["Bed", "Size", "View", "Balcony", "Minibar", "Shower"],
  "Executive": ["Bed", "Size", "Lounge", "Breakfast", "Desk", "View"],
  "Family": ["Bedrooms", "Sleeps", "Living area", "Kitchenette", "Bed", "Size"],
  "Suite": ["Bed", "Size", "Lounge", "Living area", "View", "Breakfast"],
  "Studio": ["Bed", "Kitchenette", "Desk", "Laundry", "Size", "Wi-Fi"],
  "Penthouse": ["Bed", "Terrace", "Views", "Size", "Living area", "Breakfast"],
  "Accessible": ["Access", "Shower", "Bed", "Size", "Lounge", "Wi-Fi"],
};

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
  "balcony": "Private",
  "terrace": "Private",
  "minibar": "Yes",
  "shower": "Rain",
  "lounge": "Access",
  "living area": "Yes",
  "kitchenette": "Full",
  "desk": "Yes",
  "laundry": "On site",
  "access": "Step-free",
};
export const hintFor = (label) => HINTS[String(label || "").trim().toLowerCase()] || "King";

export const ALL_LABELS = [...new Set(Object.values(SPEC_PRESETS).flat())].sort();

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
