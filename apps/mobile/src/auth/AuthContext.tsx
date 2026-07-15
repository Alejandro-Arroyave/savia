import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apolloClient, setDevUserEmail } from "../apollo";

const STORAGE_KEY = "savia.auth.email";

interface AuthState {
  /** Email del usuario en sesión (null = sin sesión). */
  email: string | null;
  /** true mientras se restaura la sesión guardada al abrir la app. */
  restoring: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

// NOTA: mientras no haya Auth0, "iniciar sesión" solo identifica al usuario por su
// email (modo desarrollo). Al integrar Auth0, aquí se guardará el access token real.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!active) return;
        if (stored) {
          setDevUserEmail(stored);
          setEmail(stored);
        }
      })
      .finally(() => {
        if (active) setRestoring(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (nextEmail: string) => {
    const normalized = nextEmail.trim().toLowerCase();
    setDevUserEmail(normalized);
    await AsyncStorage.setItem(STORAGE_KEY, normalized);
    setEmail(normalized);
  }, []);

  const signOut = useCallback(async () => {
    setDevUserEmail(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
    setEmail(null);
    await apolloClient.clearStore();
  }, []);

  const value = useMemo<AuthState>(
    () => ({ email, restoring, signIn, signOut }),
    [email, restoring, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
