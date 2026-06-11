const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%&*";

export function generateTemporaryPassword(length = 12): string {
  const all = UPPER + LOWER + DIGITS + SYMBOLS;
  const required = [
    UPPER[Math.floor(Math.random() * UPPER.length)],
    LOWER[Math.floor(Math.random() * LOWER.length)],
    DIGITS[Math.floor(Math.random() * DIGITS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
  ];

  while (required.length < length) {
    required.push(all[Math.floor(Math.random() * all.length)]);
  }

  for (let i = required.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [required[i], required[j]] = [required[j], required[i]];
  }

  return required.join("");
}
