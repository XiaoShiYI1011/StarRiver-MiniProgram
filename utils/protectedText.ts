// Keep the Web and UniApp copies in sync. Obfuscation is not a security boundary.
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const base64Bytes = (text: string): Uint8Array => {
  if (text.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(text)) throw new Error("Invalid protected text");
  const length = (text.length / 4) * 3 - (text.endsWith("==") ? 2 : text.endsWith("=") ? 1 : 0);
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (let i = 0; i < text.length; i += 4) {
    const value =
      (alphabet.indexOf(text[i]) << 18) |
      (alphabet.indexOf(text[i + 1]) << 12) |
      (Math.max(0, alphabet.indexOf(text[i + 2])) << 6) |
      Math.max(0, alphabet.indexOf(text[i + 3]));
    if (offset < length) bytes[offset++] = value >> 16;
    if (offset < length) bytes[offset++] = value >> 8;
    if (offset < length) bytes[offset++] = value;
  }
  return bytes;
};

export const decodeProtectedText = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(decodeProtectedText);
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  if ("$text" in record) {
    if (record.$text !== "nwa1" || typeof record.key !== "string" || typeof record.data !== "string")
      throw new Error("Unsupported protected text");
    const key = base64Bytes(record.key);
    const bytes = base64Bytes(record.data);
    if (key.length !== 16 || bytes.length % 2 !== 0) throw new Error("Invalid protected text");
    const parts: string[] = [];
    let units: number[] = [];
    for (let i = 0; i < bytes.length; i += 2) {
      units.push((bytes[i] ^ key[i % 16]) | ((bytes[i + 1] ^ key[(i + 1) % 16]) << 8));
      if (units.length === 8192) {
        parts.push(String.fromCharCode(...units));
        units = [];
      }
    }
    parts.push(String.fromCharCode(...units));
    return parts.join("");
  }
  for (const key of Object.keys(record)) record[key] = decodeProtectedText(record[key]);
  return record;
};
