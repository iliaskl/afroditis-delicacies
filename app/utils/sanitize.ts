// Shared input sanitization and validation utilities.
// Call these before writing any user-provided text to Firestore.

// ─── Sanitization ─────────────────────────────────────────────────────────────

/** Strip all HTML/script tags from a string. */
export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

/**
 * Trim whitespace, strip HTML tags, and enforce a maximum character length.
 * Use this on every free-text field before storing in Firestore.
 */
export function sanitizeText(value: string, maxLength: number): string {
  return stripHtml(value.trim()).slice(0, maxLength);
}

// ─── Validation ───────────────────────────────────────────────────────────────

/** Returns true if the email address has a valid format. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Returns true if the phone number contains exactly 10 digits
 * and does not start with 0 or 1 (US format).
 * Matches the existing validatePhoneNumber logic in authService.ts.
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 && digits[0] !== "0" && digits[0] !== "1";
}

// ─── Field Length Limits ──────────────────────────────────────────────────────
// Single source of truth for max lengths. Import these into components
// to keep maxLength HTML attributes in sync with server-side enforcement.

export const MAX_LENGTHS = {
  name: 50,
  email: 254, // RFC 5321 maximum
  phone: 20, // allows formatted input like (206) 555-0123
  address: 200,
  specialInstructions: 300,
  declineNote: 500,
} as const;
