// HTTP Basic Auth gate for the /investor/* dashboard.
// Password is read from the INVESTOR_PASSWORD environment variable
// set in the Cloudflare Pages project settings.
export async function onRequest(context) {
  const { request, env, next } = context;

  if (!env.INVESTOR_PASSWORD) {
    return new Response(
      "Investor dashboard is not configured. Set INVESTOR_PASSWORD in Cloudflare Pages env vars.",
      { status: 503 }
    );
  }

  const auth = request.headers.get("Authorization") || "";
  const expected = "Basic " + btoa("investor:" + env.INVESTOR_PASSWORD);

  if (auth !== expected) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="ether.fi Ventures — Investors", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    });
  }

  return next();
}
