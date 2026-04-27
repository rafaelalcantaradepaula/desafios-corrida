import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { getServerEnv } from "./env.js";
import type { ApiRequest } from "./http.js";

const SESSION_COOKIE_NAME = "dc_admin_session";
const PASSWORD_ALGORITHM = "pbkdf2_sha256";
const PASSWORD_ITERATIONS = 120000;
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const BOOTSTRAP_ADMIN_ID = "usr_admin_bootstrap";
const BOOTSTRAP_ADMIN_NAME = "Administrador Inicial";
const BOOTSTRAP_ADMIN_EMAIL = "admin@desafioscorrida.local";
const BOOTSTRAP_ADMIN_PASSWORD_HASH =
  "pbkdf2_sha256$120000$QxKOZWWGBcJLU6rUEQ6cWjQ=$GZaf0iE1O+Zes20m6q4DOasblRtYkWaX6sTbTC4XuDo=";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type SessionPayload = {
  sub: string;
  name: string;
  email: string;
  role: string;
  exp: number;
};

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
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = createSessionToken(user, expiresAt);

  return {
    token,
    expiresAt,
    cookie: buildSessionCookie(token, expiresAt),
  };
}

export async function deleteAdminSession(sessionToken: string | null) {
  void sessionToken;
}

export async function getAuthenticatedAdmin(request: ApiRequest): Promise<AdminUser | null> {
  const token = parseCookies(getCookieHeader(request)).get(SESSION_COOKIE_NAME);

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function authenticateAdmin(email: string, password: string) {
  if (email !== BOOTSTRAP_ADMIN_EMAIL) {
    return null;
  }

  if (!verifyPassword(password, BOOTSTRAP_ADMIN_PASSWORD_HASH)) {
    return null;
  }

  return {
    id: BOOTSTRAP_ADMIN_ID,
    name: BOOTSTRAP_ADMIN_NAME,
    email: BOOTSTRAP_ADMIN_EMAIL,
    role: "admin",
  };
}
