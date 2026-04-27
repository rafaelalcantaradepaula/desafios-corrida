function readEnvValue(value: string | undefined, fallback: string) {
  const normalized = value?.trim();

  if (!normalized) {
    return fallback;
  }

  return normalized;
}

export const appEnv = {
  apiBaseUrl: readEnvValue(import.meta.env.VITE_API_BASE_URL, "/api"),
  useMockData: import.meta.env.VITE_USE_MOCK_DATA !== "false",
} as const;

