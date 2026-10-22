/**
 * Normalize and validate URL inputs
 */
const normalizeURL = (url) => {
  if (!url || typeof url !== "string") return "";
  let trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
};

const isValidURL = (url) => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length < 3 || trimmed.length > 2048) return false;

  try {
    const normalized = normalizeURL(trimmed);
    const parsed = new URL(normalized);
    // Disallow dangerous or unsupported protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    // Hostname must have at least one dot or be localhost/valid IP
    return parsed.hostname.includes(".") || parsed.hostname === "localhost";
  } catch {
    return false;
  }
};

module.exports = {
  isValidURL,
  normalizeURL,
};
