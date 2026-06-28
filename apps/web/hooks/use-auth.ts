"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type ApiUser } from "@/lib/api";
import { clearAuthSession, getStoredToken, getStoredUser, storeAuthSession } from "@/lib/auth";

interface UseAuthOptions {
  redirectToLogin?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (!storedToken) {
      setIsLoading(false);
      if (options.redirectToLogin) router.replace("/login");
      return;
    }

    setToken(storedToken);
    setUser(storedUser);

    api
      .me(storedToken)
      .then((freshUser) => {
        setUser(freshUser);
        storeAuthSession(storedToken, freshUser);
      })
      .catch(() => {
        clearAuthSession();
        setToken(null);
        setUser(null);
        if (options.redirectToLogin) router.replace("/login");
      })
      .finally(() => setIsLoading(false));
  }, [options.redirectToLogin, router]);

  function logout() {
    clearAuthSession();
    setToken(null);
    setUser(null);
    router.replace("/login");
  }

  return { token, user, isLoading, logout };
}
