import { apiFetch } from "./api";

export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type ApiEnvelope<T> = {
  data: T;
};

export async function listAdminUsers() {
  const response = await apiFetch<ApiEnvelope<AdminUserListItem[]>>("/admin/users");
  return response.data;
}

export async function createAdminUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await apiFetch<ApiEnvelope<AdminUserListItem>>("/admin/users", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function updateAdminUser(
  userId: string,
  input: {
    name?: string;
    password?: string;
  },
) {
  const response = await apiFetch<ApiEnvelope<AdminUserListItem>>(
    `/admin/users/${userId}`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function deleteAdminUser(userId: string) {
  return apiFetch<{ success: boolean }>(`/admin/users/${userId}`, {
    method: "DELETE",
  });
}
