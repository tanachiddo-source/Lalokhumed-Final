/**
 * Phone utilities for South Africa (E.164) and WhatsApp Click-to-Chat integration.
 * WhatsApp requires numbers strictly in international format without leading zeros, pluses, or dashes.
 */

/**
 * Normalizes any phone number into an international E.164 digit string suitable for WhatsApp.
 * Default country code is '27' for South Africa.
 */
export function formatForWhatsApp(rawPhone: string, defaultCountryCode: string = "27"): string {
  if (!rawPhone) return "";
  
  // Extract all digit characters
  let digits = rawPhone.replace(/\D/g, "");
  if (!digits) return "";

  // Strip international exit prefix (00) if present (e.g., 0027 -> 27)
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Handle common South African pattern with country code followed by trunk zero:
  // e.g. "+27 082 123 4567" or "270821234567" (12 digits) -> "27821234567" (11 digits)
  if (digits.startsWith("270") && digits.length >= 11) {
    digits = "27" + digits.slice(3);
  }

  // Handle standard South African 10-digit number starting with '0':
  // e.g. "082 123 4567" -> "27821234567"
  if (digits.startsWith("0")) {
    digits = defaultCountryCode + digits.slice(1);
  }

  // Handle 9-digit South African numbers entered without the leading '0'
  // (e.g. "82 123 4567" or "71 234 5678")
  if (digits.length === 9 && ["6", "7", "8", "1", "2", "3", "4", "5"].includes(digits[0])) {
    digits = defaultCountryCode + digits;
  }

  return digits;
}

/**
 * Validates whether a phone number string can produce a viable WhatsApp recipient number.
 */
export function isValidWhatsAppPhone(phone: string): boolean {
  const formatted = formatForWhatsApp(phone);
  // Valid international numbers are usually between 9 and 15 digits
  return formatted.length >= 9 && formatted.length <= 15;
}

/**
 * Generates the WhatsApp Click-to-Chat URL.
 * Uses https://api.whatsapp.com/send to ensure direct compatibility across WhatsApp Web,
 * WhatsApp Desktop, and iOS/Android WhatsApp apps without intermediate redirection errors.
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const formatted = formatForWhatsApp(phone);
  const encodedText = encodeURIComponent(message || "");
  
  if (!formatted) {
    return `https://api.whatsapp.com/send?text=${encodedText}`;
  }
  
  return `https://api.whatsapp.com/send?phone=${formatted}&text=${encodedText}`;
}

/**
 * Alternate short-link format (wa.me)
 */
export function buildWaMeLink(phone: string, message: string): string {
  const formatted = formatForWhatsApp(phone);
  const encodedText = encodeURIComponent(message || "");
  
  if (!formatted) {
    return `https://wa.me/?text=${encodedText}`;
  }
  
  return `https://wa.me/${formatted}?text=${encodedText}`;
}

/**
 * Formats a phone number for clean human display (e.g. +27 82 123 4567).
 */
export function formatDisplayPhone(phone: string): string {
  const formatted = formatForWhatsApp(phone);
  if (!formatted) return phone || "";
  
  // South African standard mobile/landline (11 digits starting with 27)
  if (formatted.startsWith("27") && formatted.length === 11) {
    return `+27 ${formatted.slice(2, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}`;
  }
  
  return `+${formatted}`;
}
