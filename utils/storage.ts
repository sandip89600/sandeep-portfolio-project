import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language } from "@/constants/i18n";

const STORAGE_KEYS = {
  AUTH: "@haajari/auth",
  WORKERS: "@haajari/workers",
  ATTENDANCE: "@haajari/attendance",
  SETTINGS: "@haajari/settings",
  LANGUAGE: "@haajari/language",
};

export interface AuthData {
  isLoggedIn: boolean;
  email: string;
  rememberMe: boolean;
}

export interface Worker {
  id: string;
  name: string;
  category: WorkerCategory;
  dailyRate: number;
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
}

export interface Settings {
  defaultMonth: number;
  defaultYear: number;
}

export const storage = {
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

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
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
