// Cloudflare Pages Function: POST /api/contact
// Sends via Cloudflare Email Service (REST API).
//
// Pages Functions cannot use a send_email binding — wrangler rejects it with
// "Configuration file for Pages projects does not support send_email" — so this
// uses the REST endpoint with a token scoped to Email Sending: Edit only.

const ACCOUNT_ID = '9c8e079bb5923e09a1617f592c807bf2';
const SEND_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/email/sending/send`;

const FROM = 'hello@myomentum.com.au';
const TO = 'd@screenstory.co';

// Where to send the visitor back to after a send. This value is user-controlled
// and lands in a Location header, so accept a same-site path only — anything
// absolute or protocol-relative would make the form an open redirect.
function safeRedirect(raw) {
  const s = (raw || '').toString().trim();
  if (!s.startsWith('/') || s.startsWith('//')) return '/contact';
  if (s.length > 120) return '/contact';
  if (!/^\/[A-Za-z0-9\-._~/]*$/.test(s)) return '/contact';
  return s;
}

export async function onRequestPost(context) {
  const request = context.request;
  const env = context.env;

  // Extract and clean form data
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const name   = (formData.get('name')    || '').toString().trim();
  const email  = (formData.get('email')   || '').toString().trim();
  const msg    = (formData.get('message') || '').toString().trim();
  const gotcha = (formData.get('_gotcha') || '').toString().trim();
  const next = (formData.get('_next') || '').toString();

  // Honeypot
  if (gotcha) {
    return new Response('Bot detected', { status: 400 });
  }

  // Validation
  if (!name || !email || !msg) {
    return new Response('Missing required fields', { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response('Invalid email', { status: 400 });
  }

  const token = env.EMAIL_API_TOKEN;

  if (!token) {
    console.error('EMAIL_API_TOKEN not set in environment');
    // Don't expose config details to user
    return new Response('Failed to send message. Please try again later.', { status: 500 });
  }

  const subject = `[Contact Form] ${name} (${email})`;
  const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}\n\n---\nSent from yiapanis.co contact form.`;

  try {
    const res = await fetch(SEND_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: TO,
        from: FROM,
        reply_to: email,
        subject,
        text: body,
      }),
    });

    if (!res.ok) {
      console.error('Contact form send error:', res.status, await res.text());
      return new Response('Failed to send message. Please try again later.', { status: 500 });
    }

    return new Response(null, {
      status: 302,
      headers: { Location: `${safeRedirect(next)}?sent=1` }
    });

  } catch (err) {
    console.error('Contact form error:', err);
    return new Response('Failed to send message. Please try again later.', { status: 500 });
  }
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  return onRequestPost(context);
}
