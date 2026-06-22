import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Language } from "@/constants/i18n";

const STORAGE_KEYS = {
  AUTH: "@haajari/auth",
  USERS: "@haajari/users",
  WORKERS: "@haajari/workers",
  ATTENDANCE: "@haajari/attendance",
  SETTINGS: "@haajari/settings",
  LANGUAGE: "@haajari/language",
  PROFILE: "@haajari/profile",
  THEME: "@haajari/theme",
};

export interface AuthData {
  isLoggedIn: boolean;
  userId: string;
  userType: "admin" | "user";
  email: string;
  rememberMe: boolean;
}

export interface ProfileData {
  name: string;
  avatarColor: string;
  photoUri?: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  avatarColor: string;
  profileImage?: string;
  role: "user" | "premium" | "moderator";
  isActive: boolean;
  createdAt: number;
  lastLogin?: number;
  loginHistory: number[];
}

export interface Worker {
  id: string;
  name: string;
  category: WorkerCategory;
  dailyRate: number;
  phone?: string;
  address?: string;
  notes?: string;
  photoUri?: string;
  createdAt: number;
}

export type WorkerCategory =
  | "labour"
  | "bai"
  | "mistri"
  | "bandkam"
  | "plaster"
  | "tiles"
  | "sutar";

export type AttendanceValue = "P" | "A" | "H" | number;

export interface AttendanceRecord {
  workerId: string;
  year: number;
  month: number;
  day: number;
  value: AttendanceValue;
  location?: { latitude: number; longitude: number; accuracy?: number };
  timestamp?: number;
}

export interface Settings {
  defaultMonth: number;
  defaultYear: number;
}

export interface PaymentRecord {
  id: string;
  workerId: string;
  year: number;
  month: number;
  amount: number;
  paidAt: number;
  note?: string;
}

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEYS_EXT = {
  PAYMENTS: "@haajari/payments",
  NOTIFICATION_SETTINGS: "@haajari/notification_settings",
};

export interface NotificationSettings {
  attendanceReminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  salaryReminderEnabled: boolean;
}

export const storage = {
  // Auth methods
  async getAuth(): Promise<AuthData | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AUTH);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setAuth(auth: AuthData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
    } catch (error) {
      console.error("Error saving auth:", error);
    }
  },

  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch (error) {
      console.error("Error clearing auth:", error);
    }
  },

  // User methods
  async getUsers(): Promise<User[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async getUserById(userId: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === userId) || null;
  },

  async getUserByPhone(phone: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.phone === phone) || null;
  },

  async addUser(user: User): Promise<void> {
    const users = await this.getUsers();
    users.push(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  async updateUser(updatedUser: User): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  async deleteUser(userId: string): Promise<void> {
    const users = await this.getUsers();
    const filtered = users.filter((u) => u.id !== userId);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async recordUserLogin(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (user) {
      user.lastLogin = Date.now();
      user.loginHistory = [...(user.loginHistory || []), Date.now()].slice(-20);
      await this.updateUser(user);
    }
  },

  // Language methods
  async getLanguage(): Promise<Language> {
    try {
      const lang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return (lang as Language) || "en";
    } catch {
      return "en";
    }
  },

  async setLanguage(language: Language): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  },

  // Worker methods
  async getWorkers(): Promise<Worker[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setWorkers(workers: Worker[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
    } catch (error) {
      console.error("Error saving workers:", error);
    }
  },

  async addWorker(worker: Worker): Promise<void> {
    const workers = await this.getWorkers();
    workers.push(worker);
    await this.setWorkers(workers);
  },

  async updateWorker(updatedWorker: Worker): Promise<void> {
    const workers = await this.getWorkers();
    const index = workers.findIndex((w) => w.id === updatedWorker.id);
    if (index !== -1) {
      workers[index] = updatedWorker;
      await this.setWorkers(workers);
    }
  },

  async deleteWorker(workerId: string): Promise<void> {
    const workers = await this.getWorkers();
    const filtered = workers.filter((w) => w.id !== workerId);
    await this.setWorkers(filtered);
    const attendance = await this.getAttendance();
    const filteredAttendance = attendance.filter(
      (a) => a.workerId !== workerId
    );
    await this.setAttendance(filteredAttendance);
  },

  // Attendance methods
  async getAttendance(): Promise<AttendanceRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setAttendance(records: AttendanceRecord[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ATTENDANCE,
        JSON.stringify(records)
      );
    } catch (error) {
      console.error("Error saving attendance:", error);
    }
  },

  async setAttendanceRecord(record: AttendanceRecord): Promise<void> {
    const records = await this.getAttendance();
    const existingIndex = records.findIndex(
      (r) =>
        r.workerId === record.workerId &&
        r.year === record.year &&
        r.month === record.month &&
        r.day === record.day
    );
    if (existingIndex !== -1) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    await this.setAttendance(records);
  },

  async getAttendanceForMonth(
    year: number,
    month: number
  ): Promise<AttendanceRecord[]> {
    const records = await this.getAttendance();
    return records.filter((r) => r.year === year && r.month === month);
  },

  // Settings methods
  async getSettings(): Promise<Settings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fall through to default
    }
    const now = new Date();
    return {
      defaultMonth: now.getMonth(),
      defaultYear: now.getFullYear(),
    };
  },

  async setSettings(settings: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  },

  // Profile methods
  async getProfile(): Promise<ProfileData> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fall through to default
    }
    return { name: "Admin", avatarColor: "#FF6B6B" };
  },

  async setProfile(profile: ProfileData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  },

  // Payment methods
  async getPayments(): Promise<PaymentRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS_EXT.PAYMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addPayment(payment: PaymentRecord): Promise<void> {
    try {
      const payments = await this.getPayments();
      payments.push(payment);
      await AsyncStorage.setItem(STORAGE_KEYS_EXT.PAYMENTS, JSON.stringify(payments));
    } catch (error) {
      console.error("Error saving payment:", error);
    }
  },

  async deletePayment(paymentId: string): Promise<void> {
    try {
      const payments = await this.getPayments();
      const filtered = payments.filter((p) => p.id !== paymentId);
      await AsyncStorage.setItem(STORAGE_KEYS_EXT.PAYMENTS, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  },

  async getPaymentsForMonth(year: number, month: number): Promise<PaymentRecord[]> {
    const payments = await this.getPayments();
    return payments.filter((p) => p.year === year && p.month === month);
  },

  async getPaymentsForWorkerMonth(workerId: string, year: number, month: number): Promise<PaymentRecord[]> {
    const payments = await this.getPayments();
    return payments.filter(
      (p) => p.workerId === workerId && p.year === year && p.month === month
    );
  },

  async getNotificationSettings(): Promise<NotificationSettings | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS_EXT.NOTIFICATION_SETTINGS);
    return data ? JSON.parse(data) : null;
  },

  async setNotificationSettings(settings: NotificationSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS_EXT.NOTIFICATION_SETTINGS, JSON.stringify(settings));
  },

  async exportAllData(): Promise<string> {
    const [workers, attendance, payments, settings, profile] = await Promise.all([
      this.getWorkers(),
      this.getAttendance(),
      this.getPayments(),
      this.getSettings(),
      this.getProfile(),
    ]);
    const backup = { version: 1, exportedAt: Date.now(), appName: "Haajari", workers, attendance, payments, settings, profile };
    return JSON.stringify(backup);
  },

  async importAllData(json: string): Promise<void> {
    const backup = JSON.parse(json);
    if (!backup.appName || backup.appName !== "Haajari") throw new Error("Invalid backup file");
    await Promise.all([
      backup.workers ? this.setWorkers(backup.workers) : Promise.resolve(),
      backup.attendance ? this.setAttendance(backup.attendance) : Promise.resolve(),
      backup.payments
        ? AsyncStorage.setItem(STORAGE_KEYS_EXT.PAYMENTS, JSON.stringify(backup.payments))
        : Promise.resolve(),
      backup.settings ? this.setSettings(backup.settings) : Promise.resolve(),
      backup.profile ? this.setProfile(backup.profile) : Promise.resolve(),
    ]);
  },

  async saveBiometricCredentials(email: string, password: string): Promise<void> {
    try {
      if (Platform.OS === "web") return;
      await SecureStore.setItemAsync("@haajari_bio_email", email);
      await SecureStore.setItemAsync("@haajari_bio_pass", password);
    } catch {}
  },

  async getBiometricCredentials(): Promise<{ email: string; password: string } | null> {
    try {
      if (Platform.OS === "web") return null;
      const email = await SecureStore.getItemAsync("@haajari_bio_email");
      const password = await SecureStore.getItemAsync("@haajari_bio_pass");
      if (email && password) return { email, password };
      return null;
    } catch { return null; }
  },

  async clearBiometricCredentials(): Promise<void> {
    try {
      if (Platform.OS === "web") return;
      await SecureStore.deleteItemAsync("@haajari_bio_email");
      await SecureStore.deleteItemAsync("@haajari_bio_pass");
    } catch {}
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        ...Object.values(STORAGE_KEYS),
        STORAGE_KEYS_EXT.PAYMENTS,
      ]);
      await this.clearBiometricCredentials();
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  },
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function calculateWorkerSummary(
  workerId: string,
  attendance: AttendanceRecord[],
  dailyRate: number
): {
  presentDays: number;
  halfDays: number;
  absentDays: number;
  totalAmount: number;
} {
  const workerAttendance = attendance.filter((a) => a.workerId === workerId);

  let presentDays = 0;
  let halfDays = 0;
  let absentDays = 0;
  let customAmount = 0;

  workerAttendance.forEach((record) => {
    if (record.value === "P") {
      presentDays++;
    } else if (record.value === "A") {
      absentDays++;
    } else if (record.value === "H") {
      halfDays++;
    } else if (typeof record.value === "number") {
      customAmount += record.value;
    }
  });

  const totalAmount =
    presentDays * dailyRate + halfDays * (dailyRate / 2) + customAmount;

  return { presentDays, halfDays, absentDays, totalAmount };
}
