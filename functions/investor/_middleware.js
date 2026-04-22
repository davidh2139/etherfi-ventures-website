// Password-only auth gate for /investor/*.
// Shared password is read from the INVESTOR_PASSWORD env var set in the
// Cloudflare Pages project settings. On success we set a cookie whose
// value is SHA-256(password); the middleware re-derives that hash on
// every request and compares. Rotating INVESTOR_PASSWORD automatically
// invalidates all outstanding sessions.

const COOKIE_NAME = "investor_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function sha256Hex(str) {
  const bytes = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loginPage({ error = "", redirectTo = "/investor/" } = {}) {
  const safeRedirect = redirectTo.startsWith("/investor/") ? redirectTo : "/investor/";
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Investor Access — ether.fi Ventures</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      background: #0a0a1f;
      color: #f1f5f9;
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 400px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 32px 28px;
      backdrop-filter: blur(16px);
    }
    .eyebrow {
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #29BCFA;
      font-weight: 600;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 6px;
      letter-spacing: -0.01em;
    }
    p.lead {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 24px;
      line-height: 1.5;
    }
    label {
      display: block;
      font-size: 12px;
      color: #cbd5e1;
      margin-bottom: 8px;
      font-weight: 500;
    }
    input[type="password"] {
      width: 100%;
      background: rgba(2, 6, 23, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #f1f5f9;
      font-family: inherit;
      font-size: 14px;
      padding: 11px 13px;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input[type="password"]:focus {
      border-color: #29BCFA;
      box-shadow: 0 0 0 3px rgba(41, 188, 250, 0.15);
    }
    button {
      width: 100%;
      margin-top: 16px;
      background: #0050AE;
      color: #fff;
      border: 0;
      border-radius: 10px;
      padding: 12px 16px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.15s;
    }
    button:hover { background: #0060c8; }
    .error {
      color: #fca5a5;
      font-size: 12px;
      margin-top: 12px;
      text-align: center;
    }
    .back {
      display: block;
      margin-top: 18px;
      text-align: center;
      color: #64748b;
      font-size: 12px;
      text-decoration: none;
    }
    .back:hover { color: #cbd5e1; }
  </style>
</head>
<body>
  <form class="card" method="POST" action="/investor/login" autocomplete="off">
    <div class="eyebrow">ether.fi Ventures · Fund I LP</div>
    <h1>Investor Access</h1>
    <p class="lead">Enter the access password to view the portfolio dashboard.</p>
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autofocus required />
    <input type="hidden" name="redirect" value="${safeRedirect}" />
    <button type="submit">Continue</button>
    ${error ? `<div class="error">${error}</div>` : ""}
    <a class="back" href="/">← Back to ether.fi Ventures</a>
  </form>
</body>
</html>`;
  return new Response(html, {
    status: error ? 401 : 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}

export async function onRequest(context) {
  const { request, env, next } = context;

  if (!env.INVESTOR_PASSWORD) {
    return new Response(
      "Investor dashboard is not configured. Set INVESTOR_PASSWORD in Cloudflare Pages env vars.",
      { status: 503, headers: { "Content-Type": "text/plain" } }
    );
  }

  const url = new URL(request.url);
  const expectedHash = await sha256Hex(env.INVESTOR_PASSWORD);

  // Handle form submission
  if (request.method === "POST" && url.pathname === "/investor/login") {
    const form = await request.formData();
    const submitted = (form.get("password") || "").toString();
    const redirectTo = (form.get("redirect") || "/investor/").toString();
    const safeRedirect = redirectTo.startsWith("/investor/") ? redirectTo : "/investor/";

    if (submitted === env.INVESTOR_PASSWORD) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: safeRedirect,
          "Set-Cookie": `${COOKIE_NAME}=${expectedHash}; Path=/investor; HttpOnly; Secure; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`,
          "Cache-Control": "no-store",
        },
      });
    }
    return loginPage({ error: "Incorrect password.", redirectTo: safeRedirect });
  }

  // Check existing session cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([a-f0-9]{64})`));
  if (match && match[1] === expectedHash) {
    return next();
  }

  // Not authenticated — show login page
  return loginPage({ redirectTo: url.pathname + url.search });
}
