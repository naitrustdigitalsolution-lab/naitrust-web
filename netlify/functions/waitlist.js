const TO_EMAIL = process.env.WAITLIST_TO_EMAIL || "contact@naitrust.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Naitrust Waitlist <onboarding@resend.dev>";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function clean(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function validate(payload) {
  const errors = [];

  if (!payload.fullName) errors.push("Full name is required.");
  if (!payload.email || !payload.email.includes("@")) errors.push("A valid email address is required.");
  if (!payload.phone) errors.push("Phone number is required.");
  if (!payload.userType) errors.push("User type is required.");
  if (!payload.transactionRange) errors.push("Transaction range is required.");
  if (!payload.consent) errors.push("Consent is required.");

  return errors;
}

function normalizePayload(body) {
  return {
    fullName: clean(body.fullName),
    businessName: clean(body.businessName),
    email: clean(body.email),
    phone: clean(body.phone),
    userType: clean(body.userType),
    transactionRange: clean(body.transactionRange),
    transactionNeed: clean(body.transactionNeed),
    consent: body.consent === true,
    source: clean(body.source) || "naitrust-web",
    submittedAt: clean(body.submittedAt) || new Date().toISOString(),
  };
}

function buildEmail(payload) {
  const subject = `[Wiatlist] ${payload.fullName} wants Naitrust early access`;
  const text = [
    "New Naitrust waitlist submission",
    "",
    `Name: ${payload.fullName}`,
    `Business/Brand: ${payload.businessName || "Not provided"}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `User type: ${payload.userType}`,
    `Transaction range: ${payload.transactionRange}`,
    `Transaction need: ${payload.transactionNeed || "Not provided"}`,
    `Consent: ${payload.consent ? "Yes" : "No"}`,
    `Source: ${payload.source}`,
    `Submitted at: ${payload.submittedAt}`,
  ].join("\n");

  const html = `
    <h2>New Naitrust waitlist submission</h2>
    <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif;">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(payload.fullName)}</td></tr>
      <tr><td><strong>Business/Brand</strong></td><td>${escapeHtml(payload.businessName || "Not provided")}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(payload.email)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${escapeHtml(payload.phone)}</td></tr>
      <tr><td><strong>User type</strong></td><td>${escapeHtml(payload.userType)}</td></tr>
      <tr><td><strong>Transaction range</strong></td><td>${escapeHtml(payload.transactionRange)}</td></tr>
      <tr><td><strong>Transaction need</strong></td><td>${escapeHtml(payload.transactionNeed || "Not provided")}</td></tr>
      <tr><td><strong>Consent</strong></td><td>${payload.consent ? "Yes" : "No"}</td></tr>
      <tr><td><strong>Source</strong></td><td>${escapeHtml(payload.source)}</td></tr>
      <tr><td><strong>Submitted at</strong></td><td>${escapeHtml(payload.submittedAt)}</td></tr>
    </table>
  `;

  return { subject, text, html };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(204, {});
  }

  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed." });
  }

  if (!RESEND_API_KEY) {
    return json(500, { message: "Email service is not configured." });
  }

  let body;

  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { message: "Invalid JSON body." });
  }

  const payload = normalizePayload(body);
  const errors = validate(payload);

  if (errors.length > 0) {
    return json(400, { message: "Please complete the required fields.", errors });
  }

  const email = buildEmail(payload);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: payload.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Waitlist email failed", response.status, errorBody);
    return json(502, { message: "Could not send waitlist email." });
  }

  return json(200, { message: "Waitlist request sent." });
}
