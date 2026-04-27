import { apiFetch } from "./api";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function loginAdmin(email: string, password: string) {
  return apiFetch<{ user: SessionUser }>("/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function getAdminSession() {
  return apiFetch<{ user: SessionUser }>("/auth/session");
}

export async function logoutAdmin() {
  return apiFetch<{ success: boolean }>("/auth/logout", {
    method: "POST",
  });
}
