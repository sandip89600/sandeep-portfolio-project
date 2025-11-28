import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { storage, AuthData } from "@/utils/storage";

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  email: string;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_CREDENTIALS = {
  email: "haajri121",
  password: "12345678",
};

export function useAuthProvider() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const auth = await storage.getAuth();
      if (auth?.isLoggedIn && auth?.rememberMe) {
        setIsLoggedIn(true);
        setEmail(auth.email);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(
    async (
      inputEmail: string,
      password: string,
      rememberMe: boolean
    ): Promise<boolean> => {
      const emailLower = inputEmail.toLowerCase().trim();
      const isValid =
        emailLower === DEMO_CREDENTIALS.email &&
        password === DEMO_CREDENTIALS.password;

      if (isValid) {
        const authData: AuthData = {
          isLoggedIn: true,
          email: emailLower,
          rememberMe,
        };
        await storage.setAuth(authData);
        setIsLoggedIn(true);
        setEmail(emailLower);
        return true;
      }
      return false;
    },
    []
  );

  const logout = useCallback(async () => {
    await storage.clearAuth();
    setIsLoggedIn(false);
    setEmail("");
  }, []);

  return {
    isLoggedIn,
    isLoading,
    email,
    login,
    logout,
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
