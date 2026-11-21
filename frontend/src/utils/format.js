// R12 999 / R199,50 (South African formatting)
export const formatPrice = (value) => {
  const n = Number(value) || 0;
  return "R" + n.toLocaleString("en-ZA", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

// room types are shown exactly as the admin saved them
export const categoryLabel = (name) => name;
