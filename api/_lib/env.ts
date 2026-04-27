type ServerEnv = {
  apiBaseUrl: string;
  authUrl: string;
  authSecret: string;
  databaseUrl: string;
  hasDatabaseUrl: boolean;
};

function requireValue(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getServerEnv(): ServerEnv {
  const apiBaseUrl = process.env.VITE_API_BASE_URL ?? "/api";
  const authUrl = process.env.BETTER_AUTH_URL ?? "";
  const authSecret = process.env.BETTER_AUTH_SECRET ?? "";
  const databaseUrl = process.env.DATABASE_URL ?? "";

  return {
    apiBaseUrl,
    authUrl,
    authSecret,
    databaseUrl,
    hasDatabaseUrl: Boolean(databaseUrl),
  };
}

export function getDatabaseUrl(): string {
  return requireValue("DATABASE_URL", process.env.DATABASE_URL);
}

