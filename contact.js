// Netlify Function: sends contact form data to Telegram.
// Token and chat id are read from Netlify environment variables, never exposed to the browser.

const escapeHtml = (v) =>
  String(v ?? "")
    .slice(0, 1000)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { statusCode: 500, body: "Server not configured" };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Bad Request" };
  }

  if (!data.name || !data.phone || !data.message) {
    return { statusCode: 400, body: "Missing fields" };
  }

  const text = `<b>🛎️ নতুন যোগাযোগ অনুরোধ!</b>
━━━━━━━━━━━━━━━━━━━
<b>👤 নাম:</b> ${escapeHtml(data.name)}
<b>📞 ফোন:</b> ${escapeHtml(data.phone)}
<b>✈️ টেলিগ্রাম:</b> ${escapeHtml(data.telegramUser)}
<b>✉️ ইমেইল:</b> ${escapeHtml(data.email)}
<b>💬 মেসেজ:</b> ${escapeHtml(data.message)}
<b>⏰ সময়:</b> ${escapeHtml(data.time)}
━━━━━━━━━━━━━━━━━━━`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) return { statusCode: 502, body: "Telegram error" };
    return { statusCode: 200, body: "OK" };
  } catch {
    return { statusCode: 502, body: "Network error" };
  }
};
