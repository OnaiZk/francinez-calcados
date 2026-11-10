/**
 * FRANCINEZ CALÇADOS — Hardened Zero-Dependency Security Server
 * Built strictly with Node.js native modules (node:http, node:crypto, node:fs, node:path).
 *
 * Security Controls:
 *  - Zero external npm dependencies (zero supply-chain surface)
 *  - Isolated private Admin Panel (secret ADMIN_PATH configured via .env) — never exposed to customers
 *  - Salted scrypt (N=16384, r=8, p=1, 64B) password hashing + timingSafeEqual verification
 *  - Constant-time dummy scrypt execution on failed/locked login attempts (anti-timing side-channel)
 *  - Progressive IP Brute-Force Lockout + Global API Rate Limiting with bounded memory
 *  - HttpOnly + SameSite=Strict (+ Secure on HTTPS) 256-bit session cookies hashed in memory
 *  - Double-layer CSRF defense (Origin validation + timing-safe X-CSRF-Token header + JSON Content-Type)
 *  - Strict Content-Security-Policy (NO 'unsafe-inline', NO 'unsafe-eval'), HSTS, XFO=DENY, COOP, CORP
 *  - Strict schema validation & binary magic-byte image verification (JPEG/PNG only)
 *  - Atomic file writes (temp + rename) & strict allowlist static file serving (anti-path-traversal)
 */

"use strict";

const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const PRIVATE_DIR = path.join(ROOT_DIR, "private");
const UPLOADS_DIR = path.join(ROOT_DIR, "assets", "uploads");
const CATALOG_FILE = path.join(DATA_DIR, "catalog.json");
const AUTH_FILE = path.join(DATA_DIR, "auth.json");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(PRIVATE_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/* ==========================================================================
   1. Environment Loader (.env)
   ========================================================================== */

function loadDotEnv() {
  const envPath = path.join(ROOT_DIR, ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx <= 0) continue;
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

loadDotEnv();

const PORT = Number(process.env.PORT) || 3000;

function normalizeAdminPath(rawPath) {
  const cleaned = String(rawPath || "").trim().replace(/\/+$/, "");
  if (!cleaned) return "";
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}

/* ==========================================================================
   2. Cryptographic Password Hashing (scrypt + timingSafeEqual)
   ========================================================================== */

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };
const KEY_LEN = 64;
const DUMMY_SALT = crypto.randomBytes(32);
const DUMMY_HASH = crypto.scryptSync("dummy-constant-time-baseline", DUMMY_SALT, KEY_LEN, SCRYPT_PARAMS);

function hashPassword(plainPassword, existingAdminPath = "") {
  const normalized = String(plainPassword).normalize("NFKC");
  const salt = crypto.randomBytes(32);
  const derived = crypto.scryptSync(normalized, salt, KEY_LEN, SCRYPT_PARAMS);
  return {
    saltHex: salt.toString("hex"),
    hashHex: derived.toString("hex"),
    adminPath: existingAdminPath || undefined,
    updatedAt: new Date().toISOString()
  };
}

function verifyPasswordConstantTime(plainPassword, authRecord) {
  const normalized = String(plainPassword || "").slice(0, 128).normalize("NFKC");
  if (!authRecord || !authRecord.saltHex || !authRecord.hashHex) {
    const fake = crypto.scryptSync(normalized, DUMMY_SALT, KEY_LEN, SCRYPT_PARAMS);
    crypto.timingSafeEqual(fake, DUMMY_HASH);
    return false;
  }
  const salt = Buffer.from(authRecord.saltHex, "hex");
  const expected = Buffer.from(authRecord.hashHex, "hex");
  if (salt.length !== 32 || expected.length !== KEY_LEN) {
    return false;
  }
  const actual = crypto.scryptSync(normalized, salt, KEY_LEN, SCRYPT_PARAMS);
  return crypto.timingSafeEqual(actual, expected);
}

function writeJsonAtomic(filePath, dataObj, mode = 0o600) {
  const tmpPath = `${filePath}.${crypto.randomBytes(6).toString("hex")}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(dataObj, null, 2), { encoding: "utf8", mode });
  fs.renameSync(tmpPath, filePath);
}

function ensureAuthInitialized(forceReset = false) {
  let existing = null;
  if (fs.existsSync(AUTH_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(AUTH_FILE, "utf8"));
    } catch (_) {
      existing = null;
    }
  }

  const envAdminPath = normalizeAdminPath(process.env.ADMIN_PATH);
  const resolvedAdminPath =
    envAdminPath ||
    normalizeAdminPath(existing && existing.adminPath) ||
    `/painel-${crypto.randomBytes(6).toString("hex")}`;

  if (!forceReset && existing && existing.saltHex && existing.hashHex) {
    if (!envAdminPath && !existing.adminPath) {
      existing.adminPath = resolvedAdminPath;
      writeJsonAtomic(AUTH_FILE, existing, 0o600);
    }
    return { record: existing, adminPath: resolvedAdminPath };
  }

  const initialPassword =
    !forceReset && process.env.ADMIN_INITIAL_PASSWORD && process.env.ADMIN_INITIAL_PASSWORD.length >= 8
      ? process.env.ADMIN_INITIAL_PASSWORD
      : `FC-${crypto.randomBytes(6).toString("base64url")}!${crypto.randomInt(10, 99)}`;

  const record = hashPassword(initialPassword, envAdminPath ? "" : resolvedAdminPath);
  writeJsonAtomic(AUTH_FILE, record, 0o600);

  console.log("==================================================================");
  console.log(" [SEGURANÇA] Credencial Administrativa Inicializada");
  console.log(` URL Exclusiva da Loja : http://localhost:${PORT}${resolvedAdminPath}`);
  console.log(` Senha Administrativa  : ${initialPassword}`);
  console.log(" (A senha é salva apenas com hash criptográfico scrypt em data/auth.json)");
  console.log("==================================================================");
  return { record, adminPath: resolvedAdminPath };
}

if (process.argv.includes("--reset-password")) {
  ensureAuthInitialized(true);
  process.exit(0);
}

const initAuth = ensureAuthInitialized(false);
let authRecord = initAuth.record;
const ADMIN_PATH = initAuth.adminPath;

/* ==========================================================================
   3. In-Memory Catalog Cache + Atomic Persistence
   ========================================================================== */

function loadCatalogFromDisk() {
  try {
    if (fs.existsSync(CATALOG_FILE)) {
      const raw = JSON.parse(fs.readFileSync(CATALOG_FILE, "utf8"));
      if (raw && Array.isArray(raw.products)) {
        return {
          whatsAppPhone: String(raw.whatsAppPhone || "5511981264344").replace(/\D/g, "") || "5511981264344",
          updatedAt: raw.updatedAt || new Date().toISOString(),
          products: raw.products
        };
      }
    }
  } catch (err) {
    console.error("[ERRO] Falha ao ler data/catalog.json:", err.message);
  }
  return {
    whatsAppPhone: "5511981264344",
    updatedAt: new Date().toISOString(),
    products: []
  };
}

let catalogState = loadCatalogFromDisk();
let publicCatalogEtag = computePublicEtag();

function computePublicEtag() {
  const payload = JSON.stringify({
    whatsAppPhone: catalogState.whatsAppPhone,
    updatedAt: catalogState.updatedAt,
    count: catalogState.products.length
  });
  return `"${crypto.createHash("sha256").update(payload).digest("hex").slice(0, 24)}"`;
}

function saveCatalogToDisk(nextState) {
  catalogState = {
    whatsAppPhone: String(nextState.whatsAppPhone || "5511981264344").replace(/\D/g, "") || "5511981264344",
    updatedAt: new Date().toISOString(),
    products: nextState.products
  };
  writeJsonAtomic(CATALOG_FILE, catalogState, 0o600);
  publicCatalogEtag = computePublicEtag();
}

/* ==========================================================================
   4. Session Store & Multi-Tier Rate Limiters (Brute-Force + DoS Defense)
   ========================================================================== */

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours max lifetime
const SESSION_IDLE_MS = 2 * 60 * 60 * 1000; // 2 hours idle timeout
const MAX_ACTIVE_SESSIONS = 15;
const sessions = new Map(); // sha256(token) -> { csrfToken, createdAt, lastSeenAt, ipHash }

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_FAILURES = 5;
const loginFailures = new Map(); // ip -> { count, resetAt, lockedUntil }

const API_WINDOW_MS = 60 * 1000; // 1 minute
const API_MAX_PUBLIC = 120;
const API_MAX_ADMIN = 60;
const apiCounters = new Map(); // key -> { count, resetAt }

function sha256Hex(str) {
  return crypto.createHash("sha256").update(String(str)).digest("hex");
}

function getClientIp(req) {
  // Only trust socket remoteAddress directly unless behind explicit local reverse proxy
  const socketIp = req.socket.remoteAddress || "unknown";
  if (socketIp === "127.0.0.1" || socketIp === "::1" || socketIp === "::ffff:127.0.0.1") {
    const xff = req.headers["x-forwarded-for"];
    if (typeof xff === "string" && xff.trim()) {
      return xff.split(",")[0].trim().slice(0, 64);
    }
  }
  return socketIp.slice(0, 64);
}

function isHttpsRequest(req) {
  if (req.socket.encrypted) return true;
  const socketIp = req.socket.remoteAddress || "";
  if (socketIp === "127.0.0.1" || socketIp === "::1" || socketIp === "::ffff:127.0.0.1") {
    return req.headers["x-forwarded-proto"] === "https";
  }
  return false;
}

function checkRateLimit(map, key, limit, windowMs) {
  const now = Date.now();
  if (map.size > 5000) {
    for (const [k, v] of map.entries()) {
      if (now > v.resetAt) map.delete(k);
    }
  }
  let entry = map.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    map.set(key, entry);
  }
  entry.count += 1;
  return entry.count <= limit;
}

function isLoginLocked(ip) {
  const entry = loginFailures.get(ip);
  if (!entry) return false;
  const now = Date.now();
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return true;
  }
  if (now > entry.resetAt) {
    loginFailures.delete(ip);
  }
  return false;
}

function recordLoginFailure(ip) {
  const now = Date.now();
  let entry = loginFailures.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + LOGIN_WINDOW_MS, lockedUntil: 0 };
    loginFailures.set(ip, entry);
  }
  entry.count += 1;
  if (entry.count >= LOGIN_MAX_FAILURES) {
    entry.lockedUntil = now + LOGIN_WINDOW_MS;
  }
}

function clearLoginFailures(ip) {
  loginFailures.delete(ip);
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = Object.create(null);
  if (!header || typeof header !== "string") return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = v;
  }
  return out;
}

function getCookieName(req) {
  return isHttpsRequest(req) ? "__Host-fc_admin_sid" : "fc_admin_sid";
}

function createAdminSession(req) {
  const now = Date.now();
  // Prune expired sessions
  for (const [k, s] of sessions.entries()) {
    if (now - s.createdAt > SESSION_TTL_MS || now - s.lastSeenAt > SESSION_IDLE_MS) {
      sessions.delete(k);
    }
  }
  if (sessions.size >= MAX_ACTIVE_SESSIONS) {
    const oldestKey = sessions.keys().next().value;
    if (oldestKey) sessions.delete(oldestKey);
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256Hex(rawToken);
  const csrfToken = crypto.randomBytes(32).toString("hex");

  sessions.set(tokenHash, {
    csrfToken,
    createdAt: now,
    lastSeenAt: now,
    ipHash: sha256Hex(getClientIp(req))
  });

  return { rawToken, csrfToken };
}

function getValidSession(req) {
  const cookies = parseCookies(req);
  const rawToken = cookies["__Host-fc_admin_sid"] || cookies["fc_admin_sid"];
  if (!rawToken || !/^[0-9a-f]{64}$/.test(rawToken)) return null;

  const tokenHash = sha256Hex(rawToken);
  const session = sessions.get(tokenHash);
  if (!session) return null;

  const now = Date.now();
  if (now - session.createdAt > SESSION_TTL_MS || now - session.lastSeenAt > SESSION_IDLE_MS) {
    sessions.delete(tokenHash);
    return null;
  }

  session.lastSeenAt = now;
  return { tokenHash, session };
}

function buildSessionCookieHeader(req, rawToken, maxAgeSeconds) {
  const secureFlag = isHttpsRequest(req) ? "; Secure" : "";
  const name = getCookieName(req);
  return `${name}=${rawToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}${secureFlag}`;
}

function verifyCsrfAndOrigin(req, session) {
  // 1. Verify Origin matches Host
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return false;
  try {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) return false;
  } catch (_) {
    return false;
  }

  // 2. Require JSON Content-Type
  const ctype = String(req.headers["content-type"] || "").toLowerCase();
  if (!ctype.startsWith("application/json")) return false;

  // 3. Timing-safe CSRF token check
  const headerToken = String(req.headers["x-csrf-token"] || "");
  if (!/^[0-9a-f]{64}$/.test(headerToken)) return false;
  const a = Buffer.from(headerToken, "hex");
  const b = Buffer.from(session.csrfToken, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/* ==========================================================================
   5. Security Headers & Safe Response Helpers
   ========================================================================== */

const STRICT_CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'"
].join("; ");

function setSecurityHeaders(res, isPrivatePage = false) {
  res.setHeader("Content-Security-Policy", STRICT_CSP);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()"
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  if (isPrivatePage) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
  }
}

function sendJson(res, statusCode, payload, isPrivate = true) {
  setSecurityHeaders(res, isPrivate);
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function sendText(res, statusCode, message, isPrivate = true) {
  setSecurityHeaders(res, isPrivate);
  const body = String(message);
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readJsonBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    let aborted = false;

    req.on("data", (chunk) => {
      if (aborted) return;
      total += chunk.length;
      if (total > maxBytes) {
        aborted = true;
        req.destroy();
        reject(Object.assign(new Error("Payload excede o limite permitido."), { statusCode: 413 }));
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (aborted) return;
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        const parsed = raw ? JSON.parse(raw) : {};
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          reject(Object.assign(new Error("Formato JSON inválido."), { statusCode: 400 }));
          return;
        }
        resolve(parsed);
      } catch (_) {
        reject(Object.assign(new Error("JSON malformado."), { statusCode: 400 }));
      }
    });

    req.on("error", (err) => {
      if (!aborted) reject(err);
    });
  });
}

/* ==========================================================================
   6. Strict Input Schema Validation & Binary Magic-Byte Image Verification
   ========================================================================== */

const ALLOWED_CATEGORIES = new Set(["Tênis", "Plataforma", "Slides & Sandálias"]);
const ALLOWED_TIERS = new Set(["Importado · 1ª Linha", "1ª Linha", "2ª Linha"]);
const SAFE_IMAGE_PATH_RE = /^assets\/(products|uploads)\/[a-zA-Z0-9._-]{1,80}\.(png|jpg|jpeg|webp)$/;

function cleanText(val, maxLen) {
  return String(val || "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

function verifyAndDecodeImageDataUrl(dataUrl) {
  if (typeof dataUrl !== "string") return null;
  const match = /^data:image\/(jpeg|jpg|png);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl.trim());
  if (!match) return null;

  const buf = Buffer.from(match[2], "base64");
  if (buf.length < 64 || buf.length > 2.5 * 1024 * 1024) {
    return null;
  }

  // Check binary magic bytes for authentic JPEG (FF D8 FF ... FF D9)
  const isJpeg =
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff &&
    buf[buf.length - 2] === 0xff &&
    buf[buf.length - 1] === 0xd9;

  if (isJpeg) {
    return { ext: "jpg", buffer: buf };
  }

  // Check binary magic bytes for authentic PNG (89 50 4E 47 0D 0A 1A 0A)
  const isPng =
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a;

  if (isPng) {
    return { ext: "png", buffer: buf };
  }

  return null;
}

function normalizeAndValidateProduct(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Dados do produto inválidos.");
  }

  const name = cleanText(raw.name, 100);
  if (!name) throw new Error("O nome do calçado é obrigatório.");

  const brand = cleanText(raw.brand, 50) || "Francinez";
  const category = ALLOWED_CATEGORIES.has(raw.category) ? raw.category : "Tênis";
  const tier = ALLOWED_TIERS.has(raw.tier) ? raw.tier : "1ª Linha";
  const description =
    cleanText(raw.description, 280) ||
    `Calçado ${tier.toLowerCase()} a pronta entrega com ótimo acabamento e conforto.`;

  const pixPrice = Math.round(Number(raw.pixPrice) * 100) / 100;
  if (!Number.isFinite(pixPrice) || pixPrice < 1 || pixPrice > 50000) {
    throw new Error("Valor no Pix inválido.");
  }

  let cardPrice = null;
  if (raw.cardPrice !== null && raw.cardPrice !== undefined && raw.cardPrice !== "") {
    const parsedCard = Math.round(Number(raw.cardPrice) * 100) / 100;
    if (!Number.isFinite(parsedCard) || parsedCard < 1 || parsedCard > 50000) {
      throw new Error("Valor no Cartão inválido.");
    }
    cardPrice = parsedCard;
  }

  const rawSizes = Array.isArray(raw.sizes) ? raw.sizes : [34, 35, 36, 37, 38, 39];
  const sizes = Array.from(
    new Set(
      rawSizes
        .map((n) => Number(n))
        .filter((n) => Number.isInteger(n) && n >= 20 && n <= 50)
    )
  ).sort((a, b) => a - b);

  if (sizes.length === 0 || sizes.length > 24) {
    throw new Error("Selecione ao menos uma numeração válida (20 a 50).");
  }

  const sizeLabel = `${sizes[0]}–${sizes[sizes.length - 1]}`;

  let installments = cleanText(raw.installments, 80);
  if (!installments) {
    if (cardPrice) {
      const p3 = (cardPrice / 3).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      installments = `em até 3x de R$ ${p3}`;
    } else {
      installments = "Consultar taxa da maquininha";
    }
  }

  const rawId = cleanText(raw.id, 64)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  const id =
    rawId.length >= 2
      ? rawId
      : `modelo-${crypto.randomBytes(4).toString("hex")}`;

  if (!Array.isArray(raw.colors) || raw.colors.length === 0 || raw.colors.length > 12) {
    throw new Error("Informe entre 1 e 12 cores para o calçado.");
  }

  const colors = raw.colors.map((c, idx) => {
    const cName = cleanText(c && c.name, 60) || `Opção ${idx + 1}`;
    const cHex = /^#[0-9a-fA-F]{6}$/.test(String((c && c.hex) || ""))
      ? String(c.hex).toUpperCase()
      : "#A58E74";

    let cImage = String((c && c.image) || "").trim();
    if (!SAFE_IMAGE_PATH_RE.test(cImage)) {
      throw new Error(`Caminho de imagem não permitido para a cor "${cName}".`);
    }

    const cSizesRaw = Array.isArray(c && c.sizes) ? c.sizes : sizes;
    const cSizes = Array.from(
      new Set(
        cSizesRaw
          .map((n) => Number(n))
          .filter((n) => Number.isInteger(n) && n >= 20 && n <= 50)
      )
    ).sort((a, b) => a - b);

    return {
      name: cName,
      hex: cHex,
      image: cImage,
      sizes: cSizes.length > 0 ? cSizes : [...sizes]
    };
  });

  return {
    id,
    name,
    brand,
    category,
    tier,
    description,
    pixPrice,
    cardPrice,
    installments,
    sizes,
    sizeLabel,
    colors,
    hidden: Boolean(raw.hidden)
  };
}

/* ==========================================================================
   7. Strict Static File Allowlist Serving (Zero Path Traversal)
   ========================================================================== */

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const PUBLIC_EXACT_FILES = new Map([
  ["/", path.join(ROOT_DIR, "index.html")],
  ["/index.html", path.join(ROOT_DIR, "index.html")],
  ["/produto.html", path.join(ROOT_DIR, "produto.html")],
  ["/styles.css", path.join(ROOT_DIR, "styles.css")],
  ["/app.js", path.join(ROOT_DIR, "app.js")]
]);

function serveFileSafe(req, res, absoluteFilePath, isPrivate = false) {
  try {
    const stat = fs.lstatSync(absoluteFilePath);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      return sendText(res, 404, "Não encontrado.");
    }
    const ext = path.extname(absoluteFilePath).toLowerCase();
    const mime = MIME_TYPES[ext];
    if (!mime) {
      return sendText(res, 404, "Não encontrado.");
    }

    setSecurityHeaders(res, isPrivate);
    if (!isPrivate && (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp")) {
      res.setHeader("Cache-Control", "public, max-age=86400, immutable");
      res.setHeader("Content-Security-Policy", "default-src 'none'");
    } else if (!isPrivate) {
      res.setHeader("Cache-Control", "public, max-age=60");
    }

    res.writeHead(200, {
      "Content-Type": mime,
      "Content-Length": stat.size
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    const stream = fs.createReadStream(absoluteFilePath);
    stream.on("error", () => {
      if (!res.headersSent) sendText(res, 500, "Erro interno.");
      else res.destroy();
    });
    stream.pipe(res);
  } catch (_) {
    sendText(res, 404, "Não encontrado.");
  }
}

function tryServePublicAsset(req, res, pathname) {
  if (PUBLIC_EXACT_FILES.has(pathname)) {
    serveFileSafe(req, res, PUBLIC_EXACT_FILES.get(pathname), false);
    return true;
  }

  const allowedAssetDirs = [
    { prefix: "/assets/products/", baseDir: path.join(ROOT_DIR, "assets", "products") },
    { prefix: "/assets/uploads/", baseDir: path.join(ROOT_DIR, "assets", "uploads") },
    { prefix: "/assets/posts/", baseDir: path.join(ROOT_DIR, "assets", "posts") }
  ];

  for (const { prefix, baseDir } of allowedAssetDirs) {
    if (pathname.startsWith(prefix)) {
      const relName = pathname.slice(prefix.length);
      if (!/^[a-zA-Z0-9._-]{1,100}\.(png|jpg|jpeg|webp)$/.test(relName)) {
        sendText(res, 404, "Não encontrado.");
        return true;
      }
      const resolved = path.resolve(baseDir, relName);
      if (!resolved.startsWith(baseDir + path.sep)) {
        sendText(res, 404, "Não encontrado.");
        return true;
      }
      serveFileSafe(req, res, resolved, false);
      return true;
    }
  }

  return false;
}

/* ==========================================================================
   8. HTTP Request Router
   ========================================================================== */

const server = http.createServer(async (req, res) => {
  try {
    // Reject anomalous URLs or unsupported HTTP methods immediately
    if (!req.url || req.url.length > 2048 || req.url.includes("\0")) {
      return sendText(res, 400, "Requisição inválida.");
    }

    const allowedMethods = new Set(["GET", "HEAD", "POST", "PUT", "DELETE"]);
    if (!allowedMethods.has(req.method)) {
      return sendText(res, 405, "Método não permitido.");
    }

    const parsedUrl = new URL(req.url, "http://localhost");
    const pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === "/favicon.ico" && (req.method === "GET" || req.method === "HEAD")) {
      setSecurityHeaders(res, false);
      res.writeHead(204);
      res.end();
      return;
    }

    if (pathname.includes("..") || pathname.includes("\\")) {
      return sendText(res, 404, "Não encontrado.");
    }

    const clientIp = getClientIp(req);

    /* ----------------------------------------------------------------------
       A. Public Storefront Read-Only API: GET /api/products
       ---------------------------------------------------------------------- */
    if (pathname === "/api/products" && (req.method === "GET" || req.method === "HEAD")) {
      if (!checkRateLimit(apiCounters, `pub:${clientIp}`, API_MAX_PUBLIC, API_WINDOW_MS)) {
        return sendJson(res, 429, { error: "Muitas requisições. Aguarde um instante." }, false);
      }

      if (req.headers["if-none-match"] === publicCatalogEtag) {
        setSecurityHeaders(res, false);
        res.setHeader("ETag", publicCatalogEtag);
        res.writeHead(304);
        res.end();
        return;
      }

      const visibleProducts = catalogState.products.filter((p) => !p.hidden);
      setSecurityHeaders(res, false);
      res.setHeader("ETag", publicCatalogEtag);
      res.setHeader("Cache-Control", "public, max-age=15");
      const body = JSON.stringify({
        whatsAppPhone: catalogState.whatsAppPhone,
        products: visibleProducts
      });
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(body)
      });
      res.end(req.method === "HEAD" ? undefined : body);
      return;
    }

    /* ----------------------------------------------------------------------
       B. Authentication Endpoints (/api/auth/login, /api/auth/logout, /api/auth/session)
       ---------------------------------------------------------------------- */
    if (pathname === "/api/auth/login" && req.method === "POST") {
      if (!checkRateLimit(apiCounters, `auth:${clientIp}`, 15, API_WINDOW_MS)) {
        return sendJson(res, 429, { error: "Muitas tentativas. Aguarde alguns minutos." });
      }

      // Verify same-origin
      const origin = req.headers.origin;
      const host = req.headers.host;
      if (!origin || !host) {
        return sendJson(res, 403, { error: "Origem inválida." });
      }
      try {
        if (new URL(origin).host !== host) {
          return sendJson(res, 403, { error: "Origem não autorizada." });
        }
      } catch (_) {
        return sendJson(res, 403, { error: "Origem inválida." });
      }

      const body = await readJsonBody(req, 2048);

      // Honeypot field check: automated bots fill hidden "website" field
      if (body.website && String(body.website).trim() !== "") {
        verifyPasswordConstantTime("bot-honeypot", null);
        return sendJson(res, 401, { error: "Senha incorreta." });
      }

      if (isLoginLocked(clientIp)) {
        // Still perform constant-time scrypt so timing reveals nothing
        verifyPasswordConstantTime(body.password || "", null);
        return sendJson(res, 429, {
          error: "Acesso bloqueado temporariamente por segurança após 5 erros. Aguarde 15 minutos."
        });
      }

      const password = typeof body.password === "string" ? body.password : "";
      const isValid = password.length >= 8 && verifyPasswordConstantTime(password, authRecord);

      if (!isValid) {
        recordLoginFailure(clientIp);
        return sendJson(res, 401, { error: "Senha incorreta." });
      }

      clearLoginFailures(clientIp);
      const { rawToken, csrfToken } = createAdminSession(req);
      res.setHeader("Set-Cookie", buildSessionCookieHeader(req, rawToken, Math.floor(SESSION_TTL_MS / 1000)));
      return sendJson(res, 200, { ok: true, csrfToken });
    }

    if (pathname === "/api/auth/logout" && req.method === "POST") {
      const active = getValidSession(req);
      if (active) {
        if (!verifyCsrfAndOrigin(req, active.session)) {
          return sendJson(res, 403, { error: "Sessão ou token CSRF inválido." });
        }
        sessions.delete(active.tokenHash);
      }
      res.setHeader("Set-Cookie", buildSessionCookieHeader(req, "deleted", 0));
      return sendJson(res, 200, { ok: true });
    }

    if (pathname === "/api/auth/session" && req.method === "GET") {
      const active = getValidSession(req);
      if (!active) {
        return sendJson(res, 401, { authenticated: false });
      }
      return sendJson(res, 200, {
        authenticated: true,
        csrfToken: active.session.csrfToken
      });
    }

    /* ----------------------------------------------------------------------
       C. Private Admin Portal Pages (Gated Server-Side — Customers NEVER see Admin)
       ---------------------------------------------------------------------- */
    if (pathname === `${ADMIN_PATH}/` && (req.method === "GET" || req.method === "HEAD")) {
      res.writeHead(302, { Location: ADMIN_PATH });
      res.end();
      return;
    }

    if (pathname === ADMIN_PATH && (req.method === "GET" || req.method === "HEAD")) {
      const active = getValidSession(req);
      const tpl = active ? "admin.html" : "login.html";
      const html = fs
        .readFileSync(path.join(PRIVATE_DIR, tpl), "utf8")
        .replace(/__ADMIN_PATH__/g, ADMIN_PATH);
      setSecurityHeaders(res, true);
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": Buffer.byteLength(html)
      });
      res.end(req.method === "HEAD" ? undefined : html);
      return;
    }

    if (pathname === `${ADMIN_PATH}/login.js` && (req.method === "GET" || req.method === "HEAD")) {
      return serveFileSafe(req, res, path.join(PRIVATE_DIR, "login.js"), true);
    }

    if (pathname === `${ADMIN_PATH}/admin.js` && (req.method === "GET" || req.method === "HEAD")) {
      const active = getValidSession(req);
      if (!active) {
        return sendText(res, 401, "Não autorizado.", true);
      }
      return serveFileSafe(req, res, path.join(PRIVATE_DIR, "admin.js"), true);
    }

    if (pathname === `${ADMIN_PATH}/divulgacao` && (req.method === "GET" || req.method === "HEAD")) {
      const active = getValidSession(req);
      if (!active) {
        res.writeHead(302, { Location: ADMIN_PATH });
        res.end();
        return;
      }
      const html = fs
        .readFileSync(path.join(PRIVATE_DIR, "divulgacao.html"), "utf8")
        .replace(/__ADMIN_PATH__/g, ADMIN_PATH);
      setSecurityHeaders(res, true);
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": Buffer.byteLength(html)
      });
      res.end(req.method === "HEAD" ? undefined : html);
      return;
    }

    if (pathname === `${ADMIN_PATH}/divulgacao.js` && (req.method === "GET" || req.method === "HEAD")) {
      const active = getValidSession(req);
      if (!active) {
        return sendText(res, 401, "Não autorizado.", true);
      }
      return serveFileSafe(req, res, path.join(PRIVATE_DIR, "divulgacao.js"), true);
    }

    /* ----------------------------------------------------------------------
       D. Authenticated Admin API (/api/admin/*)
       ---------------------------------------------------------------------- */
    if (pathname.startsWith("/api/admin/")) {
      if (!checkRateLimit(apiCounters, `adm:${clientIp}`, API_MAX_ADMIN, API_WINDOW_MS)) {
        return sendJson(res, 429, { error: "Limite de operações atingido. Aguarde 1 minuto." });
      }

      const active = getValidSession(req);
      if (!active) {
        return sendJson(res, 401, { error: "Sessão expirada. Faça login novamente." });
      }

      if (req.method !== "GET" && req.method !== "HEAD") {
        if (!verifyCsrfAndOrigin(req, active.session)) {
          return sendJson(res, 403, { error: "Falha na verificação de segurança (CSRF/Origem)." });
        }
      }

      // GET /api/admin/catalog (includes hidden/paused items + WhatsApp number + CSRF)
      if (pathname === "/api/admin/catalog" && req.method === "GET") {
        return sendJson(res, 200, {
          whatsAppPhone: catalogState.whatsAppPhone,
          products: catalogState.products,
          csrfToken: active.session.csrfToken
        });
      }

      // POST /api/admin/upload-image (Verifies binary JPEG/PNG magic bytes & saves safely)
      if (pathname === "/api/admin/upload-image" && req.method === "POST") {
        const body = await readJsonBody(req, 3.8 * 1024 * 1024);
        const verified = verifyAndDecodeImageDataUrl(body.dataUrl);
        if (!verified) {
          return sendJson(res, 400, {
            error: "Imagem inválida. Apenas fotos JPEG ou PNG autênticas até 2,5 MB são aceitas."
          });
        }

        const filename = `est-${crypto.randomUUID()}.${verified.ext}`;
        const destPath = path.resolve(UPLOADS_DIR, filename);
        if (!destPath.startsWith(UPLOADS_DIR + path.sep)) {
          return sendJson(res, 400, { error: "Caminho inválido." });
        }

        fs.writeFileSync(destPath, verified.buffer, { mode: 0o644 });
        return sendJson(res, 200, {
          ok: true,
          imagePath: `assets/uploads/${filename}`
        });
      }

      // PUT /api/admin/products (Replaces validated product list)
      if (pathname === "/api/admin/products" && req.method === "PUT") {
        const body = await readJsonBody(req, 768 * 1024);
        if (!Array.isArray(body.products) || body.products.length > 300) {
          return sendJson(res, 400, { error: "Lista de produtos inválida." });
        }

        const validatedList = body.products.map((p) => normalizeAndValidateProduct(p));
        saveCatalogToDisk({
          whatsAppPhone: catalogState.whatsAppPhone,
          products: validatedList
        });

        return sendJson(res, 200, {
          ok: true,
          products: catalogState.products
        });
      }

      // PUT /api/admin/settings (Updates WhatsApp phone number)
      if (pathname === "/api/admin/settings" && req.method === "PUT") {
        const body = await readJsonBody(req, 2048);
        const cleanedPhone = String(body.whatsAppPhone || "").replace(/\D/g, "");
        if (!/^\d{10,15}$/.test(cleanedPhone)) {
          return sendJson(res, 400, {
            error: "Informe um número de WhatsApp válido com DDI e DDD (ex.: 5511981264344)."
          });
        }

        saveCatalogToDisk({
          whatsAppPhone: cleanedPhone,
          products: catalogState.products
        });

        return sendJson(res, 200, {
          ok: true,
          whatsAppPhone: catalogState.whatsAppPhone
        });
      }

      // POST /api/admin/password (Change admin password safely)
      if (pathname === "/api/admin/password" && req.method === "POST") {
        const body = await readJsonBody(req, 2048);
        const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
        const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

        if (!verifyPasswordConstantTime(currentPassword, authRecord)) {
          return sendJson(res, 401, { error: "A senha atual informada está incorreta." });
        }

        if (newPassword.length < 8 || newPassword.length > 128) {
          return sendJson(res, 400, { error: "A nova senha deve ter no mínimo 8 caracteres." });
        }

        authRecord = hashPassword(newPassword, authRecord && authRecord.adminPath);
        writeJsonAtomic(AUTH_FILE, authRecord, 0o600);

        // Revoke all other sessions on password change, keep only a fresh session for current user
        sessions.clear();
        const fresh = createAdminSession(req);
        res.setHeader(
          "Set-Cookie",
          buildSessionCookieHeader(req, fresh.rawToken, Math.floor(SESSION_TTL_MS / 1000))
        );

        return sendJson(res, 200, {
          ok: true,
          csrfToken: fresh.csrfToken
        });
      }

      return sendJson(res, 404, { error: "Rota administrativa não encontrada." });
    }

    /* ----------------------------------------------------------------------
       E. Public Static Allowlist (index.html, produto.html, styles.css, app.js, assets/*)
       ---------------------------------------------------------------------- */
    if ((req.method === "GET" || req.method === "HEAD") && tryServePublicAsset(req, res, pathname)) {
      return;
    }

    // Everything else (including /admin.html, /.env, /data/*, /private/*, etc.) -> Stealth 404
    return sendText(res, 404, "Não encontrado.");
  } catch (err) {
    const code = err && err.statusCode ? err.statusCode : 400;
    if (!res.headersSent) {
      sendJson(res, code, { error: err.message || "Erro ao processar requisição." });
    } else {
      res.destroy();
    }
  }
});

// Anti-Slowloris & Connection Exhaustion Timeouts
server.headersTimeout = 10_000;
server.requestTimeout = 15_000;
server.keepAliveTimeout = 5_000;
server.maxHeadersCount = 50;

server.listen(PORT, () => {
  console.log(`[ONLINE] Francinez Calçados rodando com proteção máxima:`);
  console.log(` -> Vitrine Pública dos Clientes : http://localhost:${PORT}/`);
  console.log(` -> Painel Privado (Protegido)   : http://localhost:${PORT}${ADMIN_PATH}`);
});
