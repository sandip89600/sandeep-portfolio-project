import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { storage, AuthData, User, generateId } from "@/utils/storage";

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  userId: string;
  userType: "admin" | "user";
  email: string;
  user: User | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_CREDENTIALS = {
  email: "sandeep@gmail.com",
  password: "sandeep121",
};

const AVATAR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA15E"
];

export function useAuthProvider() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [userType, setUserType] = useState<"admin" | "user">("user");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const auth = await storage.getAuth();
      if (auth?.isLoggedIn && auth?.rememberMe) {
        setIsLoggedIn(true);
        setUserId(auth.userId);
        setUserType(auth.userType);
        setEmail(auth.email);
        if (auth.userType === "user") {
          const userData = await storage.getUserById(auth.userId);
          setUser(userData);
        }
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

      // Check admin credentials
      if (
        emailLower === ADMIN_CREDENTIALS.email &&
        password === ADMIN_CREDENTIALS.password
      ) {
        const authData: AuthData = {
          isLoggedIn: true,
          userId: "admin",
          userType: "admin",
          email: emailLower,
          rememberMe,
        };
        await storage.setAuth(authData);
        setIsLoggedIn(true);
        setUserId("admin");
        setUserType("admin");
        setEmail(emailLower);
        return true;
      }

      // Check user credentials
      const userData = await storage.getUserByEmail(emailLower);
      if (userData && userData.password === password && userData.isActive) {
        await storage.recordUserLogin(userData.id);
        const authData: AuthData = {
          isLoggedIn: true,
          userId: userData.id,
          userType: "user",
          email: emailLower,
          rememberMe,
        };
        await storage.setAuth(authData);
        setIsLoggedIn(true);
        setUserId(userData.id);
        setUserType("user");
        setEmail(emailLower);
        setUser(userData);
        return true;
      }

      return false;
    },
    []
  );

  const signup = useCallback(
    async (
      inputEmail: string,
      password: string,
      name: string
    ): Promise<boolean> => {
      const emailLower = inputEmail.toLowerCase().trim();

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(emailLower);
      if (existingUser) {
        return false;
      }

      // Create new user
      const newUser: User = {
        id: generateId(),
        email: emailLower,
        password,
        name,
        phone: "",
        address: "",
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        role: "user",
        isActive: true,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        loginHistory: [Date.now()],
      };

      await storage.addUser(newUser);

      // Auto login
      const authData: AuthData = {
        isLoggedIn: true,
        userId: newUser.id,
        userType: "user",
        email: emailLower,
        rememberMe: true,
      };
      await storage.setAuth(authData);
      setIsLoggedIn(true);
      setUserId(newUser.id);
      setUserType("user");
      setEmail(emailLower);
      setUser(newUser);

      return true;
    },
    []
  );

  const logout = useCallback(async () => {
    await storage.clearAuth();
    setIsLoggedIn(false);
    setUserId("");
    setUserType("user");
    setEmail("");
    setUser(null);
  }, []);

  return {
    isLoggedIn,
    isLoading,
    userId,
    userType,
    email,
    user,
    login,
    signup,
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
