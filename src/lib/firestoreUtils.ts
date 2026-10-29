/**
 * Deep sanitization helper for Firestore writes.
 * 
 * Firestore strictly rejects documents that contain `undefined` values in any key or nested object.
 * This utility recursively removes any `undefined` properties, while safely preserving:
 * - Firestore FieldValues (such as serverTimestamp(), increment(), etc.)
 * - Timestamp and Date instances
 * - Primitive values (strings, numbers, booleans, null)
 * - Array contents
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }

  if (typeof data === "object") {
    // Preserve Date, Firestore FieldValues, and non-plain objects
    if (data instanceof Date || (data.constructor && data.constructor.name !== "Object")) {
      return data;
    }

    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(data as Record<string, any>)) {
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned as any;
  }

  return data;
}
