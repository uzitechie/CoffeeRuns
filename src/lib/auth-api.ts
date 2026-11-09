export type SessionUser = {
  id: string;
  username: string;
  email: string;
};

type ApiError = {
  error?: string;
};

let csrfTokenCache = "";

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiError;
    return data.error ?? "Request failed.";
  } catch {
    return "Request failed.";
  }
}

export async function getSession() {
  const response = await fetch("/api/session", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = (await response.json()) as { user: SessionUser | null; csrfToken?: string };
  csrfTokenCache = data.csrfToken ?? "";
  return data;
}

export async function registerUser(payload: {
  username: string;
  email: string;
  password: string;
  gdprConsent: boolean;
}) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = (await response.json()) as { user: SessionUser; csrfToken?: string };
  csrfTokenCache = data.csrfToken ?? csrfTokenCache;
  return data;
}

export async function loginUser(payload: { username: string; password: string }) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = (await response.json()) as { user: SessionUser; csrfToken?: string };
  csrfTokenCache = data.csrfToken ?? csrfTokenCache;
  return data;
}

export async function logoutUser() {
  if (!csrfTokenCache) {
    await getSession();
  }

  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfTokenCache,
    },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}

export async function requestPasswordReset(email: string) {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as { message: string; resetToken?: string | null };
}

export async function resetPassword(payload: { token: string; newPassword: string }) {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as { message: string };
}
