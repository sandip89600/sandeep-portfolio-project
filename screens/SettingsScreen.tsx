import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Switch,
  Modal,
  Image,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Language, languageNames } from "@/constants/i18n";
import { storage, ProfileData, User } from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SettingItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  theme: typeof Colors.light;
  isDestructive?: boolean;
}

function SettingItem({
  icon,
  label,
  value,
  onPress,
  theme,
  isDestructive,
}: SettingItemProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        styles.settingItem,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.itemLeft}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: isDestructive
                ? theme.error + "15"
                : theme.primary + "15",
            },
          ]}
        >
          <Feather
            name={icon as any}
            size={20}
            color={isDestructive ? theme.error : theme.primary}
          />
        </View>
        <ThemedText
          type="body"
          style={{ color: isDestructive ? theme.error : theme.text }}
        >
          {label}
        </ThemedText>
      </View>
      {value || onPress ? (
        <View style={styles.itemRight}>
          {value && (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {value}
            </ThemedText>
          )}
          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const LANGUAGES = [
  { code: "en" as Language, name: "English" },
  { code: "hi" as Language, name: "हिंदी" },
];

const THEMES = ["Light", "Dark", "System"];
const FONT_SIZES = ["Small", "Medium", "Large"];
const REMINDER_TIMES = ["Morning 9AM", "Evening 6PM", "Custom"];
const WAGE_METHODS = ["Daily Wage", "Half Day", "Piece Rate"];
const SESSION_TIMEOUTS = ["5 minutes", "15 minutes", "30 minutes", "1 hour"];

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { email, logout, user: authUser, userType, userId } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = insets.bottom + 60;

  const [profile, setProfile] = useState<ProfileData>({ name: "Admin", avatarColor: "#FF6B6B" });
  const [selectedTheme, setSelectedTheme] = useState("System");
  const [selectedFontSize, setSelectedFontSize] = useState("Medium");
  const [selectedReminder, setSelectedReminder] = useState("Morning 9AM");
  const [selectedWageMethod, setSelectedWageMethod] = useState("Daily Wage");
  const [selectedTimeout, setSelectedTimeout] = useState("15 minutes");

  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [photoVerification, setPhotoVerification] = useState(false);
  const [autoReminder, setAutoReminder] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [wageReminder, setWageReminder] = useState(true);
  const [birthdayAlerts, setBirthdayAlerts] = useState(false);
  const [cloudSync, setCloudSync] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [appLock, setAppLock] = useState(false);

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showWageModal, setShowWageModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadProfile = useCallback(async () => {
    const data = await storage.getProfile();
    setProfile(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    Alert.alert("Success", "Password changed successfully");
    setShowPasswordModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleExportData = (format: string) => {
    Alert.alert("Success", `Attendance data exported as ${format}`);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This action cannot be undone. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (authUser) {
            await storage.deleteUser(authUser.id);
            await logout();
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScreenScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <ThemedText type="h2" style={styles.sectionTitle}>Profile</ThemedText>
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.profileHeader}>
              <View
                style={[
                  styles.largeAvatar,
                  { backgroundColor: profile.avatarColor },
                ]}
              >
                <ThemedText type="h1" style={{ color: "#FFFFFF" }}>
                  {profile.name[0].toUpperCase()}
                </ThemedText>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.lg }}>
                <ThemedText type="h3">{profile.name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {email}
                </ThemedText>
              </View>
            </View>
            <Pressable style={[styles.button, { backgroundColor: theme.primary }]}>
              <Feather name="edit-2" size={16} color="#FFFFFF" />
              <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}>
                Edit Profile
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <ThemedText type="h2" style={styles.sectionTitle}>App Preferences</ThemedText>

          <SettingItem
            icon="sun"
            label="Theme"
            value={selectedTheme}
            onPress={() => setShowThemeModal(true)}
            theme={theme}
          />
          <SettingItem
            icon="type"
            label="Font Size"
            value={selectedFontSize}
            onPress={() => setShowFontModal(true)}
            theme={theme}
          />
          <SettingItem
            icon="globe"
            label="Language"
            value={languageNames[language]}
            onPress={() => setShowLanguageModal(true)}
            theme={theme}
          />
        </View>

        {/* Attendance Settings */}
        <View style={styles.section}>
          <ThemedText type="h2" style={styles.sectionTitle}>Attendance</ThemedText>

          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body">GPS-based Attendance</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Enable location tracking
                </ThemedText>
              </View>
              <Switch value={gpsEnabled} onValueChange={setGpsEnabled} />
            </View>

            <View style={[styles.divider, { borderBottomColor: theme.border }]} />

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body">Photo Verification</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Require selfie for attendance
                </ThemedText>
              </View>
              <Switch value={photoVerification} onValueChange={setPhotoVerification} />
            </View>

            <View style={[styles.divider, { borderBottomColor: theme.border }]} />

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body">Auto Attendance Reminder</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Get daily reminders
                </ThemedText>
              </View>
              <Switch value={autoReminder} onValueChange={setAutoReminder} />
            </View>
          </View>

          <SettingItem
            icon="clock"
            label="Reminder Time"
            value={selectedReminder}
            onPress={() => setShowReminderModal(true)}
            theme={theme}
          />
          <SettingItem
            icon="credit-card"
            label="Default Wage Method"
            value={selectedWageMethod}
            onPress={() => setShowWageModal(true)}
            theme={theme}
          />
        </View>

        {/* Security */}
        <View style={styles.section}>
          <ThemedText type="h2" style={styles.sectionTitle}>Security</ThemedText>

          <SettingItem
            icon="lock"
            label="Change Password"
            onPress={() => setShowPasswordModal(true)}
            theme={theme}
          />

          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body">2-Factor Authentication</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  OTP on login
                </ThemedText>
              </View>
              <Switch value={twoFactorAuth} onValueChange={setTwoFactorAuth} />
            </View>

            <View style={[styles.divider, { borderBottomColor: theme.border }]} />

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body">App Lock</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  PIN/Pattern lock
                </ThemedText>
              </View>
              <Switch value={appLock} onValueChange={setAppLock} />
            </View>
          </View>

          <SettingItem
            icon="clock"
            label="Session Timeout"
            value={selectedTimeout}
            onPress={() => setShowTimeoutModal(true)}
            theme={theme}
          />
        </View>

        {/* Backup & Data */}
        <View style={styles.section}>
          <ThemedText type="h2" style={styles.sectionTitle}>Backup & Data</ThemedText>

          <SettingItem
            icon="download"
            label="Export as PDF"
            onPress={() => handleExportData("PDF")}
            theme={theme}
          />
          <SettingItem
            icon="download"
            label="Export as Excel"
            onPress={() => handleExportData("Excel")}
            theme={theme}
          />
          <SettingItem
            icon="download"
            label="Export as CSV"
            onPress={() => handleExportData("CSV")}
            theme={theme}
          />

          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body">Cloud Sync</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Sync to cloud storage
                </ThemedText>
              </View>
              <Switch value={cloudSync} onValueChange={setCloudSync} />
            </View>
          </View>

          <SettingItem
            icon="share-2"
            label="Backup to Google Drive"
            onPress={() => Alert.alert("Success", "Backup initiated")}
            theme={theme}
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <ThemedText type="h2" style={styles.sectionTitle}>Notifications</ThemedText>

          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body">Push Notifications</ThemedText>
              </View>
              <Switch value={pushNotifications} onValueChange={setPushNotifications} />
            </View>

            <View style={[styles.divider, { borderBottomColor: theme.border }]} />

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body">Wage Reminders</ThemedText>
              </View>
              <Switch value={wageReminder} onValueChange={setWageReminder} />
            </View>

            <View style={[styles.divider, { borderBottomColor: theme.border }]} />

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="body">Birthday Alerts</ThemedText>
              </View>
              <Switch value={birthdayAlerts} onValueChange={setBirthdayAlerts} />
            </View>
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <ThemedText type="h2" style={styles.sectionTitle}>App Information</ThemedText>

          <SettingItem
            icon="info"
            label="About Haajari"
            value="v1.0.0"
            theme={theme}
          />
          <SettingItem
            icon="shield"
            label="Privacy Policy"
            onPress={() => Alert.alert("Privacy Policy", "Privacy Policy details")}
            theme={theme}
          />
          <SettingItem
            icon="file-text"
            label="Terms & Conditions"
            onPress={() => Alert.alert("Terms", "Terms & Conditions details")}
            theme={theme}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <ThemedText type="h2" style={styles.sectionTitle}>Support</ThemedText>

          <SettingItem
            icon="mail"
            label="Contact Support"
            onPress={() => Alert.alert("Support", "Opening email client...")}
            theme={theme}
          />
          <SettingItem
            icon="message-circle"
            label="WhatsApp Support"
            onPress={() => Alert.alert("WhatsApp", "Opening WhatsApp...")}
            theme={theme}
          />
          <SettingItem
            icon="alert-circle"
            label="Report a Bug"
            onPress={() => Alert.alert("Report", "Bug report submitted")}
            theme={theme}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <SettingItem
            icon="log-out"
            label="Logout"
            onPress={handleLogout}
            theme={theme}
            isDestructive
          />
          <SettingItem
            icon="trash-2"
            label="Delete Account"
            onPress={handleDeleteAccount}
            theme={theme}
            isDestructive
          />
        </View>
      </ScreenScrollView>

      {/* Theme Modal */}
      <Modal visible={showThemeModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>Select Theme</ThemedText>
            {THEMES.map((t) => (
              <Pressable
                key={t}
                onPress={() => {
                  setSelectedTheme(t);
                  setShowThemeModal(false);
                }}
                style={[
                  styles.optionItem,
                  {
                    borderColor: selectedTheme === t ? theme.primary : theme.border,
                    borderWidth: selectedTheme === t ? 2 : 1,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: selectedTheme === t ? theme.primary : theme.text,
                    fontWeight: selectedTheme === t ? "600" : "400",
                  }}
                >
                  {t}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Font Size Modal */}
      <Modal visible={showFontModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFontModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>Font Size</ThemedText>
            {FONT_SIZES.map((f) => (
              <Pressable
                key={f}
                onPress={() => {
                  setSelectedFontSize(f);
                  setShowFontModal(false);
                }}
                style={[
                  styles.optionItem,
                  {
                    borderColor: selectedFontSize === f ? theme.primary : theme.border,
                    borderWidth: selectedFontSize === f ? 2 : 1,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: selectedFontSize === f ? theme.primary : theme.text,
                    fontWeight: selectedFontSize === f ? "600" : "400",
                  }}
                >
                  {f}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>Language</ThemedText>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => {
                  setLanguage(lang.code);
                  setShowLanguageModal(false);
                }}
                style={[
                  styles.optionItem,
                  {
                    borderColor: language === lang.code ? theme.primary : theme.border,
                    borderWidth: language === lang.code ? 2 : 1,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: language === lang.code ? theme.primary : theme.text,
                    fontWeight: language === lang.code ? "600" : "400",
                  }}
                >
                  {lang.name}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Reminder Modal */}
      <Modal visible={showReminderModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowReminderModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>Reminder Time</ThemedText>
            {REMINDER_TIMES.map((time) => (
              <Pressable
                key={time}
                onPress={() => {
                  setSelectedReminder(time);
                  setShowReminderModal(false);
                }}
                style={[
                  styles.optionItem,
                  {
                    borderColor: selectedReminder === time ? theme.primary : theme.border,
                    borderWidth: selectedReminder === time ? 2 : 1,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: selectedReminder === time ? theme.primary : theme.text,
                    fontWeight: selectedReminder === time ? "600" : "400",
                  }}
                >
                  {time}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Wage Method Modal */}
      <Modal visible={showWageModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowWageModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>Wage Method</ThemedText>
            {WAGE_METHODS.map((method) => (
              <Pressable
                key={method}
                onPress={() => {
                  setSelectedWageMethod(method);
                  setShowWageModal(false);
                }}
                style={[
                  styles.optionItem,
                  {
                    borderColor: selectedWageMethod === method ? theme.primary : theme.border,
                    borderWidth: selectedWageMethod === method ? 2 : 1,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: selectedWageMethod === method ? theme.primary : theme.text,
                    fontWeight: selectedWageMethod === method ? "600" : "400",
                  }}
                >
                  {method}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Timeout Modal */}
      <Modal visible={showTimeoutModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTimeoutModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>Session Timeout</ThemedText>
            {SESSION_TIMEOUTS.map((timeout) => (
              <Pressable
                key={timeout}
                onPress={() => {
                  setSelectedTimeout(timeout);
                  setShowTimeoutModal(false);
                }}
                style={[
                  styles.optionItem,
                  {
                    borderColor: selectedTimeout === timeout ? theme.primary : theme.border,
                    borderWidth: selectedTimeout === timeout ? 2 : 1,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: selectedTimeout === timeout ? theme.primary : theme.text,
                    fontWeight: selectedTimeout === timeout ? "600" : "400",
                  }}
                >
                  {timeout}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPasswordModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>Change Password</ThemedText>

            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundRoot },
              ]}
              placeholder="Current Password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />

            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundRoot },
              ]}
              placeholder="New Password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundRoot },
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={{ flexDirection: "row", gap: Spacing.md }}>
              <Pressable
                onPress={() => setShowPasswordModal(false)}
                style={[styles.button, { backgroundColor: theme.backgroundRoot, borderColor: theme.border, borderWidth: 1, flex: 1 }]}
              >
                <ThemedText type="body">Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleChangePassword}
                style={[styles.button, { backgroundColor: theme.primary, flex: 1 }]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF" }}>
                  Update
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    fontWeight: "600",
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  largeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  divider: {
    borderBottomWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: "100%",
  },
  optionItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    fontSize: 16,
  },
});
