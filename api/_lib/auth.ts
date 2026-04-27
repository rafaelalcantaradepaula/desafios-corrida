import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { getDb } from "./db";
import { getServerEnv } from "./env";

const SESSION_COOKIE_NAME = "dc_admin_session";
const PASSWORD_ALGORITHM = "pbkdf2_sha256";
const PASSWORD_ITERATIONS = 120000;
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const BOOTSTRAP_ADMIN_ID = "usr_admin_bootstrap";
const BOOTSTRAP_ADMIN_NAME = "Administrador Inicial";
const BOOTSTRAP_ADMIN_EMAIL = "admin@desafioscorrida.local";
const BOOTSTRAP_ADMIN_PASSWORD_HASH =
  "pbkdf2_sha256$120000$QxKOZWWGBcJLU6rUEQ6cWjQ=$GZaf0iE1O+Zes20m6q4DOasblRtYkWaX6sTbTC4XuDo=";

let authBootstrapPromise: Promise<void> | null = null;

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type SessionRecord = {
  id: string;
  user_id: string;
  session_token_hash: string;
  expires_at: string;
  name: string;
  email: string;
  role: string;
};

type AdminCredentialRecord = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
};

function toBase64(value: Buffer) {
  return value.toString("base64");
}

function fromBase64(value: string) {
  return Buffer.from(value, "base64");
}

async function runAuthBootstrap() {
  const db = getDb();

  await db`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE INDEX IF NOT EXISTS admin_sessions_user_id_idx
    ON admin_sessions(user_id)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx
    ON admin_sessions(expires_at)
  `;

  await db`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (
      ${BOOTSTRAP_ADMIN_ID},
      ${BOOTSTRAP_ADMIN_NAME},
      ${BOOTSTRAP_ADMIN_EMAIL},
      ${BOOTSTRAP_ADMIN_PASSWORD_HASH},
      'admin'
    )
    ON CONFLICT (email) DO NOTHING
  `;
}

async function ensureAuthBootstrap() {
  if (!authBootstrapPromise) {
    authBootstrapPromise = runAuthBootstrap().catch((error) => {
      authBootstrapPromise = null;
      throw error;
    });
  }

  await authBootstrapPromise;
}

export function hashPassword(password: string) {
  const salt = randomBytes(32);
  const hash = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 32, "sha256");

  return [
    PASSWORD_ALGORITHM,
    String(PASSWORD_ITERATIONS),
    toBase64(salt),
    toBase64(hash),
  ].join("$");
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsValue, saltValue, hashValue] = storedHash.split("$");

  if (
    algorithm !== PASSWORD_ALGORITHM ||
    !iterationsValue ||
    !saltValue ||
    !hashValue
  ) {
    return false;
  }

  const iterations = Number(iterationsValue);

  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const derivedHash = pbkdf2Sync(
    password,
    fromBase64(saltValue),
    iterations,
    32,
    "sha256",
  );

  const expectedHash = fromBase64(hashValue);

  return (
    derivedHash.length === expectedHash.length &&
    timingSafeEqual(derivedHash, expectedHash)
  );
}

function hashSessionToken(token: string) {
  const pepper = getServerEnv().authSecret;

  return createHash("sha256")
    .update(`${token}:${pepper}`)
    .digest("hex");
}

function parseCookies(header: string | null) {
  const cookieMap = new Map<string, string>();

  if (!header) {
    return cookieMap;
  }

  for (const item of header.split(";")) {
    const [rawName, ...rawValue] = item.trim().split("=");
    if (!rawName || rawValue.length === 0) {
      continue;
    }

    cookieMap.set(rawName, decodeURIComponent(rawValue.join("=")));
  }

  return cookieMap;
}

function buildSessionCookie(token: string, expiresAt: Date) {
  const authUrl = getServerEnv().authUrl;
  const shouldUseSecureCookie = authUrl.startsWith("https://");
  const segments = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Expires=${expiresAt.toUTCString()}`,
    `Max-Age=${Math.floor((expiresAt.getTime() - Date.now()) / 1000)}`,
  ];

  if (shouldUseSecureCookie) {
    segments.push("Secure");
  }

  return segments.join("; ");
}

export function clearSessionCookie() {
  const authUrl = getServerEnv().authUrl;
  const secureSegment = authUrl.startsWith("https://") ? "; Secure" : "";

  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax${secureSegment}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export async function createAdminSession(userId: string) {
  await ensureAuthBootstrap();

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const db = getDb();

  await db`
    INSERT INTO admin_sessions (id, user_id, session_token_hash, expires_at)
    VALUES (${crypto.randomUUID()}, ${userId}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  return {
    token,
    expiresAt,
    cookie: buildSessionCookie(token, expiresAt),
  };
}

export async function deleteAdminSession(sessionToken: string | null) {
  if (!sessionToken) {
    return;
  }

  await ensureAuthBootstrap();

  const db = getDb();
  const tokenHash = hashSessionToken(sessionToken);

  await db`
    DELETE FROM admin_sessions
    WHERE session_token_hash = ${tokenHash}
  `;
}

export async function getAuthenticatedAdmin(request: Request): Promise<AdminUser | null> {
  const token = parseCookies(request.headers.get("cookie")).get(SESSION_COOKIE_NAME);

  if (!token) {
    return null;
  }

  await ensureAuthBootstrap();

  const db = getDb();
  const tokenHash = hashSessionToken(token);
  const rows = (await db`
    SELECT
      admin_sessions.id,
      admin_sessions.user_id,
      admin_sessions.session_token_hash,
      admin_sessions.expires_at,
      users.name,
      users.email,
      users.role
    FROM admin_sessions
    INNER JOIN users ON users.id = admin_sessions.user_id
    WHERE admin_sessions.session_token_hash = ${tokenHash}
      AND admin_sessions.expires_at > NOW()
    LIMIT 1
  `) as SessionRecord[];

  const session = rows[0];

  if (!session) {
    return null;
  }

  return {
    id: session.user_id,
    name: session.name,
    email: session.email,
    role: session.role,
  };
}

export async function authenticateAdmin(email: string, password: string) {
  await ensureAuthBootstrap();

  const db = getDb();
  const rows = (await db`
    SELECT id, name, email, password_hash, role
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `) as AdminCredentialRecord[];

  const user = rows[0];

  if (!user || user.role !== "admin") {
    return null;
  }

  if (!verifyPassword(password, user.password_hash)) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
