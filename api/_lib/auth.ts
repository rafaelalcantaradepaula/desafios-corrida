import {
  createHmac,
  pbkdf2Sync,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { getDb } from "./db.js";
import { getServerEnv } from "./env.js";
import type { ApiRequest } from "./http.js";

const SESSION_COOKIE_NAME = "dc_admin_session";
const PASSWORD_ALGORITHM = "pbkdf2_sha256";
const PASSWORD_ITERATIONS = 120000;
const SESSION_IDLE_TIMEOUT_MS = 1000 * 60 * 5;
const BOOTSTRAP_ADMIN_ID = "usr_admin_bootstrap";
const BOOTSTRAP_ADMIN_NAME = "Administrador Inicial";
const BOOTSTRAP_ADMIN_EMAIL = "admin@desafioscorrida.local";
const BOOTSTRAP_ADMIN_PASSWORD_HASH =
  "pbkdf2_sha256$120000$QxKOZWWGBcJLU6rUEQ6cWjQ=$GZaf0iE1O+Zes20m6q4DOasblRtYkWaX6sTbTC4XuDo=";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AdminUserRecord = AdminUser & {
  createdAt: string;
};

type SessionPayload = {
  sub: string;
  name: string;
  email: string;
  role: string;
  exp: number;
};

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string | Date;
};

let authBootstrapPromise: Promise<void> | null = null;

function toBase64(value: Buffer) {
  return value.toString("base64");
}

function fromBase64(value: string) {
  return Buffer.from(value, "base64");
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf-8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function getSessionSecret() {
  return getServerEnv().authSecret || "desafios-corrida-bootstrap-secret";
}

function signSessionPayload(encodedPayload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function createSessionToken(user: AdminUser, expiresAt: Date) {
  const payload: SessionPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: expiresAt.getTime(),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signSessionPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token: string): AdminUser | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signSessionPayload(encodedPayload);
  const providedBuffer = Buffer.from(signature, "utf-8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;

  if (payload.exp <= Date.now()) {
    return null;
  }

  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };
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

function getCookieHeader(request: ApiRequest) {
  const headerValue = request.headers.cookie;

  if (Array.isArray(headerValue)) {
    return headerValue.join("; ");
  }

  return headerValue ?? null;
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapUserRecord(row: AdminUserRow): AdminUserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
  };
}

async function runAuthBootstrap() {
  const env = getServerEnv();

  if (!env.hasDatabaseUrl) {
    return;
  }

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

export function hasUserDatabase() {
  return getServerEnv().hasDatabaseUrl;
}

async function getPersistedAdminUser(userId: string): Promise<AdminUser | null> {
  if (!getServerEnv().hasDatabaseUrl) {
    return null;
  }

  await ensureAuthBootstrap();

  const db = getDb();
  const users = (await db`
    SELECT id, name, email, password_hash, role, created_at
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `) as AdminUserRow[];

  const user = users[0];

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
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

export function clearSessionCookie() {
  const authUrl = getServerEnv().authUrl;
  const secureSegment = authUrl.startsWith("https://") ? "; Secure" : "";

  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax${secureSegment}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export async function createAdminSession(user: AdminUser) {
  const expiresAt = new Date(Date.now() + SESSION_IDLE_TIMEOUT_MS);
  const token = createSessionToken(user, expiresAt);

  return {
    token,
    expiresAt,
    cookie: buildSessionCookie(token, expiresAt),
  };
}

export async function readAuthenticatedAdminSession(request: ApiRequest) {
  const token = parseCookies(getCookieHeader(request)).get(SESSION_COOKIE_NAME);

  if (!token) {
    return null;
  }

  const user = verifySessionToken(token);

  if (!user) {
    return null;
  }

  const persistedUser = await getPersistedAdminUser(user.id);

  if (getServerEnv().hasDatabaseUrl && !persistedUser) {
    return null;
  }

  const sessionUser = persistedUser ?? user;
  const session = await createAdminSession(sessionUser);

  return {
    user: sessionUser,
    cookie: session.cookie,
    expiresAt: session.expiresAt,
  };
}

export async function deleteAdminSession(sessionToken: string | null) {
  void sessionToken;
}

export async function getAuthenticatedAdmin(request: ApiRequest): Promise<AdminUser | null> {
  const session = await readAuthenticatedAdminSession(request);
  return session?.user ?? null;
}

export async function authenticateAdmin(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

  if (getServerEnv().hasDatabaseUrl) {
    await ensureAuthBootstrap();

    const db = getDb();
    const users = (await db`
      SELECT id, name, email, password_hash, role, created_at
      FROM users
      WHERE LOWER(email) = ${normalizedEmail}
      LIMIT 1
    `) as AdminUserRow[];

    const user = users[0];

    if (user && verifyPassword(password, user.password_hash)) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }

    return null;
  }

  if (
    normalizedEmail !== BOOTSTRAP_ADMIN_EMAIL ||
    !verifyPassword(password, BOOTSTRAP_ADMIN_PASSWORD_HASH)
  ) {
    return null;
  }

  return {
    id: BOOTSTRAP_ADMIN_ID,
    name: BOOTSTRAP_ADMIN_NAME,
    email: BOOTSTRAP_ADMIN_EMAIL,
    role: "admin",
  };
}

export async function listAdminUsers() {
  if (!getServerEnv().hasDatabaseUrl) {
    return [
      {
        id: BOOTSTRAP_ADMIN_ID,
        name: BOOTSTRAP_ADMIN_NAME,
        email: BOOTSTRAP_ADMIN_EMAIL,
        role: "admin",
        createdAt: new Date(0).toISOString(),
      },
    ] as AdminUserRecord[];
  }

  await ensureAuthBootstrap();

  const db = getDb();
  const users = (await db`
    SELECT id, name, email, password_hash, role, created_at
    FROM users
    ORDER BY name ASC, email ASC
  `) as AdminUserRow[];

  return users.map(mapUserRecord);
}

export async function createAdminUserRecord(input: {
  name: string;
  email: string;
  password: string;
}) {
  if (!getServerEnv().hasDatabaseUrl) {
    return null;
  }

  await ensureAuthBootstrap();

  const db = getDb();
  const email = normalizeEmail(input.email);
  const existingUsers = (await db`
    SELECT id, name, email, password_hash, role, created_at
    FROM users
    WHERE LOWER(email) = ${email}
    LIMIT 1
  `) as AdminUserRow[];

  if (existingUsers[0]) {
    return null;
  }

  const id = `usr_${randomUUID()}`;
  const passwordHash = hashPassword(input.password);

  const users = (await db`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (${id}, ${input.name}, ${email}, ${passwordHash}, 'admin')
    RETURNING id, name, email, password_hash, role, created_at
  `) as AdminUserRow[];

  return users[0] ? mapUserRecord(users[0]) : null;
}

export async function updateAdminUserRecord(
  userId: string,
  input: {
    name?: string;
    password?: string;
  },
) {
  if (!getServerEnv().hasDatabaseUrl) {
    return null;
  }

  await ensureAuthBootstrap();

  const db = getDb();
  const users = (await db`
    SELECT id, name, email, password_hash, role, created_at
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `) as AdminUserRow[];

  const user = users[0];

  if (!user) {
    return null;
  }

  const nextName = input.name ?? user.name;
  const nextPasswordHash = input.password
    ? hashPassword(input.password)
    : user.password_hash;

  const updatedUsers = (await db`
    UPDATE users
    SET name = ${nextName},
        password_hash = ${nextPasswordHash},
        updated_at = NOW()
    WHERE id = ${userId}
    RETURNING id, name, email, password_hash, role, created_at
  `) as AdminUserRow[];

  return updatedUsers[0] ? mapUserRecord(updatedUsers[0]) : null;
}

export async function deleteAdminUserRecord(userId: string) {
  if (!getServerEnv().hasDatabaseUrl) {
    return false;
  }

  await ensureAuthBootstrap();

  const db = getDb();
  const deletedRows = (await db`
    DELETE FROM users
    WHERE id = ${userId}
    RETURNING id
  `) as Array<{ id: string }>;

  return Boolean(deletedRows[0]);
}
