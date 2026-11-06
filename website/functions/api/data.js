// Opslag voor het huisboekje: één JSON-document per ingelogde gebruiker in Cloudflare KV.
// Werkt alleen achter Cloudflare Access: elke aanvraag moet een geldig, ondertekend
// Access-token hebben. Zonder instellingen weigert de functie alles, zodat je gegevens
// nooit onbeschermd worden opgeslagen.
//
// Benodigd in Cloudflare Pages (Settings):
//   KV-binding        HUISBOEKJE          → een KV-namespace
//   Variabele         ACCESS_TEAM_DOMAIN  → bijv. jouwnaam.cloudflareaccess.com
//   Variabele         ACCESS_AUD          → de "Application Audience (AUD) Tag" van je Access-app

const MAX_BYTES = 20 * 1024 * 1024;
let certCache = { at: 0, team: "", keys: [] };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const b64urlJson = (s) => JSON.parse(new TextDecoder().decode(b64urlToBytes(s)));

async function getKeys(team, fetchImpl) {
  if (certCache.team === team && Date.now() - certCache.at < 60 * 60 * 1000) return certCache.keys;
  const r = await fetchImpl(`https://${team}/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error("certs");
  const j = await r.json();
  certCache = { at: Date.now(), team, keys: j.keys || [] };
  return certCache.keys;
}

function tokenFrom(request) {
  const h = request.headers.get("cf-access-jwt-assertion");
  if (h) return h;
  const m = (request.headers.get("cookie") || "").match(/(?:^|;\s*)CF_Authorization=([^;]+)/);
  return m ? m[1] : null;
}

export async function verifyAccess(request, env, fetchImpl = fetch) {
  const token = tokenFrom(request);
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, sig] = parts;
  const header = b64urlJson(h);
  if (header.alg !== "RS256") return null;
  const team = String(env.ACCESS_TEAM_DOMAIN).replace(/^https?:\/\//, "").replace(/\/+$/, "");
  let keys = await getKeys(team, fetchImpl);
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) { certCache.at = 0; keys = await getKeys(team, fetchImpl); jwk = keys.find((k) => k.kid === header.kid); }
  if (!jwk) return null;
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlToBytes(sig), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) return null;
  const claims = b64urlJson(p);
  const now = Math.floor(Date.now() / 1000);
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(env.ACCESS_AUD)) return null;
  if (typeof claims.exp !== "number" || claims.exp < now) return null;
  if (claims.nbf && claims.nbf > now + 60) return null;
  if (claims.iss !== `https://${team}`) return null;
  return typeof claims.email === "string" && claims.email ? claims.email.toLowerCase() : null;
}

export async function onRequest({ request, env }) {
  if (!env.HUISBOEKJE) return json({ ok: false, error: "KV-opslag (HUISBOEKJE) is niet gekoppeld" }, 503);
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return json({ ok: false, error: "Cloudflare Access is niet ingesteld" }, 503);

  let email = null;
  try { email = await verifyAccess(request, env); } catch (e) { email = null; }
  if (!email) return json({ ok: false, error: "Niet ingelogd" }, 401);

  const key = "boekje:" + email;

  if (request.method === "GET") {
    const cur = await env.HUISBOEKJE.get(key, { type: "json" });
    return json({ ok: true, email, version: cur?.version || 0, state: cur?.state || null });
  }

  if (request.method === "PUT") {
    const text = await request.text();
    if (text.length > MAX_BYTES) return json({ ok: false, error: "Te groot" }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({ ok: false, error: "Ongeldige gegevens" }, 400); }
    if (!body || typeof body.state !== "object" || !body.state) return json({ ok: false, error: "Ongeldige gegevens" }, 400);
    const cur = await env.HUISBOEKJE.get(key, { type: "json" });
    const curVersion = cur?.version || 0;
    const base = Number(request.headers.get("if-match") || 0);
    if (cur && base !== curVersion) return json({ ok: false, error: "Gewijzigd op een ander apparaat", version: curVersion }, 409);
    const version = Math.max(Date.now(), curVersion + 1);
    await env.HUISBOEKJE.put(key, JSON.stringify({ version, savedAt: new Date().toISOString(), state: body.state }));
    return json({ ok: true, version });
  }

  return json({ ok: false, error: "Methode niet toegestaan" }, 405);
}
