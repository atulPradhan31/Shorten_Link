const DOMAINS = require("./domain.config");

const FREELY_EMAIL_BASE_URL =
  process.env.FREELY_EMAIL_BASE_URL ||
  DOMAINS.EMAIL.API_V1_EMAILS;

/**
 * Dispatches notification email via FreelyEmail API (harshit107.online)
 */
async function sendEmail(payload, timeoutMs = 15000) {
  const url = `${FREELY_EMAIL_BASE_URL.replace(/\/+$/, "")}/send`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timer);
    return await response.json();
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

module.exports = {
  sendEmail,
  BASE_URL: FREELY_EMAIL_BASE_URL,
};
