/**
 * Normalizes a phone number to a single canonical format: +998XXXXXXXXX
 *
 * This is the single source of truth for phone comparison across the whole
 * platform (web register/login AND the Telegram bot contact-share flow).
 * Both MUST call this exact function before writing to / querying the
 * User.phone field, otherwise "998917736630" and "+998917736630" would be
 * treated as two different users.
 *
 * Accepts things like:
 *   "917736630"        -> "+998917736630"
 *   "998917736630"      -> "+998917736630"
 *   "+998917736630"      -> "+998917736630"
 *   "+998 91 773 66 30"  -> "+998917736630"
 *   "8-91-773-66-30"      -> "+998917736630" (leading 8 -> local, assume UZ)
 *
 * Returns null if the number doesn't contain a plausible amount of digits.
 */
function normalizePhone(raw) {
  if (!raw) return null;

  let digits = String(raw).trim().replace(/[^\d]/g, '');
  if (!digits) return null;

  // Strip a leading trunk-prefix "8" often typed instead of "998" (RU/UZ habit)
  if (digits.length === 10 && digits.startsWith('8')) {
    digits = digits.slice(1);
  }

  // Bare 9-digit local number -> assume Uzbekistan country code
  if (digits.length === 9) {
    digits = `998${digits}`;
  }

  // Already has country code without plus
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+${digits}`;
  }

  // Anything else with a plausible international length, just prefix +
  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

module.exports = { normalizePhone };
