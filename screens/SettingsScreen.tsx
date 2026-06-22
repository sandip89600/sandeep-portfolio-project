import React, { useState, useCallback, useRef, memo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Switch,
  Modal,
  Image,
  Platform,
  TextInput,
  ScrollView,
  Dimensions,
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
  withTiming,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Language, languageNames } from "@/constants/i18n";
import { storage, ProfileData, NotificationSettings } from "@/utils/storage";
import {
  scheduleAttendanceReminder,
  cancelAttendanceReminder,
  scheduleSalaryReminder,
  cancelAllReminders,
  requestNotificationPermission,
  formatReminderTime,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "@/utils/notifications";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const THEME_OPTIONS = [
  { key: "Light", icon: "sun" as const, label: "Light Mode", desc: "Clean & bright" },
  { key: "Dark", icon: "moon" as const, label: "Dark Mode", desc: "Easy on the eyes" },
  { key: "System", icon: "smartphone" as const, label: "System Default", desc: "Follows device setting" },
];

const LANGUAGES: { code: Language; name: string; native: string; flag: string }[] = [
  { code: "en", name: "English", native: "English", flag: "EN" },
  { code: "hi", name: "Hindi", native: "हिंदी", flag: "हि" },
];

// ─── Reusable Row ────────────────────────────────────────────────────────────
interface RowProps {
  icon: string;
  iconColor: string;
  label: string;
  sublabel?: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  isDestructive?: boolean;
  theme: typeof Colors.light;
  isLast?: boolean;
  delay?: number;
}

const Row = memo(function Row({
  icon, iconColor, label, sublabel, value, onPress, right, isDestructive, theme, isLast, delay = 0,
}: RowProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const textColor = isDestructive ? "#EF5350" : theme.text;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(300)}>
      <AnimatedPressable
        onPress={() => { if (onPress) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); } }}
        onPressIn={() => { if (onPress) scale.value = withSpring(0.97, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
        style={[styles.row, animatedStyle]}
      >
        <View style={[styles.rowIcon, { backgroundColor: iconColor + "18" }]}>
          <Feather name={icon as any} size={18} color={iconColor} />
        </View>
        <View style={styles.rowContent}>
          <ThemedText style={[styles.rowLabel, { color: textColor }]}>{label}</ThemedText>
          {sublabel ? (
            <ThemedText type="small" style={[styles.rowSublabel, { color: theme.textSecondary }]}>
              {sublabel}
            </ThemedText>
          ) : null}
        </View>
        {right ? (
          right
        ) : (
          <View style={styles.rowRight}>
            {value ? (
              <View style={[styles.valuePill, { backgroundColor: theme.primary + "18" }]}>
                <ThemedText type="small" style={[styles.valuePillText, { color: theme.primary }]}>
                  {value}
                </ThemedText>
              </View>
            ) : null}
            {onPress ? (
              <Feather name="chevron-right" size={16} color={theme.textSecondary} style={{ marginLeft: 4 }} />
            ) : null}
          </View>
        )}
      </AnimatedPressable>
      {!isLast ? <View style={[styles.rowDivider, { backgroundColor: theme.border }]} /> : null}
    </Animated.View>
  );
});

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ children, theme }: { children: React.ReactNode; theme: typeof Colors.light }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
      {children}
    </View>
  );
}

function SectionLabel({ label, theme }: { label: string; theme: typeof Colors.light }) {
  return (
    <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
      {label}
    </ThemedText>
  );
}

// ─── Bottom Sheet Modal ────────────────────────────────────────────────────────
function BottomSheet({
  visible, onClose, title, children, theme,
}: {
  visible: boolean; onClose: () => void; title: string; children: React.ReactNode; theme: typeof Colors.light;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.backgroundDefault }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
          <ThemedText type="h3" style={styles.sheetTitle}>{title}</ThemedText>
          {children}
          <View style={{ height: Spacing["2xl"] }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const { email, logout, userType, isGuest } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [profile, setProfile] = useState<ProfileData>({
    name: isGuest ? "Guest" : "Admin",
    avatarColor: isGuest ? "#9BA1A6" : "#FF6B35",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(
    themeMode === "dark" ? "Dark" : themeMode === "light" ? "Light" : "System"
  );
  const [showThemeSheet, setShowThemeSheet] = useState(false);
  const [showLangSheet, setShowLangSheet] = useState(false);
  const [showImageSheet, setShowImageSheet] = useState(false);
  const [showNameSheet, setShowNameSheet] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [showTimeSheet, setShowTimeSheet] = useState(false);
  const [editingHour, setEditingHour] = useState(9);
  const [editingMinute, setEditingMinute] = useState(0);
  const [editingAmPm, setEditingAmPm] = useState<"AM" | "PM">("AM");

  const loadProfile = useCallback(async () => {
    const data = await storage.getProfile();
    if (data) {
      setProfile(data);
      if (data.photoUri) setProfileImage(data.photoUri);
    }
  }, []);

  const loadNotifSettings = useCallback(async () => {
    const saved = await storage.getNotificationSettings();
    if (saved) setNotifSettings(saved);
  }, []);

  useFocusEffect(useCallback(() => { loadProfile(); loadNotifSettings(); }, [loadProfile, loadNotifSettings]));

  const changeTheme = async (value: string) => {
    setSelectedTheme(value);
    setShowThemeSheet(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const map: Record<string, "light" | "dark" | "system"> = { Light: "light", Dark: "dark", System: "system" };
    await setThemeMode(map[value]);
  };

  const handleAttendanceReminderToggle = async (enabled: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) { Alert.alert(t.notifications.permissionDenied, t.notifications.permissionRequired); return; }
      await scheduleAttendanceReminder(notifSettings.reminderHour, notifSettings.reminderMinute);
    } else {
      await cancelAttendanceReminder();
    }
    const updated = { ...notifSettings, attendanceReminderEnabled: enabled };
    setNotifSettings(updated);
    await storage.setNotificationSettings(updated);
  };

  const handleSalaryReminderToggle = async (enabled: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) { Alert.alert(t.notifications.permissionDenied, t.notifications.permissionRequired); return; }
      await scheduleSalaryReminder();
    } else {
      await cancelAllReminders();
      if (notifSettings.attendanceReminderEnabled) {
        await scheduleAttendanceReminder(notifSettings.reminderHour, notifSettings.reminderMinute);
      }
    }
    const updated = { ...notifSettings, salaryReminderEnabled: enabled };
    setNotifSettings(updated);
    await storage.setNotificationSettings(updated);
  };

  const pickImage = async (camera = false) => {
    const result = camera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      setShowImageSheet(false);
      const newProfile = { ...profile, photoUri: uri };
      setProfile(newProfile);
      await storage.setProfile(newProfile);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSaveName = async () => {
    const newName = editingName.trim();
    if (!newName) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }
    const newProfile = { ...profile, name: newName };
    await storage.setProfile(newProfile);
    setProfile(newProfile);
    setShowNameSheet(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogout = () => {
    if (isGuest) { logout(); return; }
    Alert.alert(t.settings.logout, t.settings.logoutConfirm, [
      { text: t.common.cancel, style: "cancel" },
      { text: t.settings.logout, style: "destructive", onPress: async () => { await logout(); } },
    ]);
  };

  const handleOpenTimePicker = () => {
    const h24 = notifSettings.reminderHour;
    const ampm = h24 < 12 ? "AM" : "PM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    setEditingHour(h12);
    setEditingMinute(notifSettings.reminderMinute);
    setEditingAmPm(ampm as "AM" | "PM");
    setShowTimeSheet(true);
  };

  const handleSaveTime = async () => {
    const h24 = editingAmPm === "AM"
      ? (editingHour === 12 ? 0 : editingHour)
      : (editingHour === 12 ? 12 : editingHour + 12);
    const updated = { ...notifSettings, reminderHour: h24, reminderMinute: editingMinute };
    setNotifSettings(updated);
    await storage.setNotificationSettings(updated);
    if (notifSettings.attendanceReminderEnabled) {
      await scheduleAttendanceReminder(h24, editingMinute);
    }
    setShowTimeSheet(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleBackup = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const json = await storage.exportAllData();
      const filename = (FileSystem.documentDirectory ?? "") + `haajari_backup_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(filename, json, { encoding: FileSystem.EncodingType.UTF8 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filename, { mimeType: "application/json", UTI: "public.json" });
      } else {
        Alert.alert(t.common.success, "Backup saved to device.");
      }
    } catch {
      Alert.alert(t.common.error, "Failed to create backup.");
    }
  };

  const handleRestore = () => {
    Alert.alert(
      "Restore Data",
      "This will replace ALL current data with the backup. This cannot be undone.",
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: "application/json",
                copyToCacheDirectory: true,
              });
              if (result.canceled) return;
              const json = await FileSystem.readAsStringAsync(result.assets[0].uri);
              await storage.importAllData(json);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(t.common.success, "Data restored. Restart the app to see changes.");
            } catch (e: any) {
              Alert.alert(
                t.common.error,
                e?.message === "Invalid backup file"
                  ? "Invalid Haajari backup file."
                  : "Failed to restore backup."
              );
            }
          },
        },
      ]
    );
  };

  const initials = profile.name?.charAt(0)?.toUpperCase() || "A";
  const ORANGE = "#FF6B35";
  const NAVY = "#1E3A5F";

  return (
    <ThemedView style={styles.container}>
      <ScreenScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["5xl"],
          paddingHorizontal: Spacing.lg,
        }}
      >

        {/* ── PROFILE HERO CARD ── */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.heroCard}>
          <LinearGradient
            colors={["#1E3A5F", "#0D1F35"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            {/* Decorative circles */}
            <View style={styles.heroBubble1} />
            <View style={styles.heroBubble2} />

            <View style={styles.heroContent}>
              {/* Avatar */}
              <Pressable onPress={() => setShowImageSheet(true)} style={styles.heroAvatarWrap}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.heroAvatar} />
                ) : (
                  <LinearGradient colors={[ORANGE, "#FF8C35"]} style={styles.heroAvatar}>
                    <ThemedText style={styles.heroAvatarText}>{initials}</ThemedText>
                  </LinearGradient>
                )}
                <View style={styles.heroAvatarBadge}>
                  <Feather name="camera" size={11} color="#fff" />
                </View>
              </Pressable>

              {/* Info */}
              <View style={styles.heroInfo}>
                <Pressable onPress={() => { setEditingName(profile.name); setShowNameSheet(true); }}
                  style={styles.heroNameRow}>
                  <ThemedText style={styles.heroName}>{profile.name}</ThemedText>
                  <View style={styles.heroEditBadge}>
                    <Feather name="edit-2" size={10} color="#fff" />
                  </View>
                </Pressable>
                <ThemedText style={styles.heroEmail}>{isGuest ? t.settings.guestMode : email}</ThemedText>
                <View style={styles.heroBadgeRow}>
                  {userType === "admin" ? (
                    <View style={styles.adminBadge}>
                      <Feather name="shield" size={10} color={ORANGE} />
                      <ThemedText style={styles.adminBadgeText}>{t.settings.admin}</ThemedText>
                    </View>
                  ) : null}
                  {isGuest ? (
                    <View style={[styles.adminBadge, { backgroundColor: "#9BA1A620" }]}>
                      <ThemedText style={[styles.adminBadgeText, { color: "#9BA1A6" }]}>Guest</ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Edit profile button */}
            {!isGuest ? (
              <Pressable
                onPress={() => { setEditingName(profile.name); setShowNameSheet(true); }}
                style={styles.heroEditBtn}
              >
                <ThemedText style={styles.heroEditBtnText}>Edit Profile</ThemedText>
              </Pressable>
            ) : null}
          </LinearGradient>
        </Animated.View>

        {/* ── GUEST CARD ── */}
        {isGuest ? (
          <Animated.View entering={FadeInDown.delay(80).duration(350)}>
            <View style={[styles.guestBanner, { backgroundColor: ORANGE + "12", borderColor: ORANGE + "40" }]}>
              <Feather name="lock" size={18} color={ORANGE} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.guestBannerTitle, { color: ORANGE }]}>{t.settings.guestMode}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>{t.settings.guestModeDesc}</ThemedText>
              </View>
              <Pressable onPress={handleLogout} style={[styles.guestSignInBtn, { backgroundColor: ORANGE }]}>
                <ThemedText style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{t.settings.signIn}</ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        ) : null}

        {/* ── APPEARANCE ── */}
        <SectionLabel label={t.settings.appearance} theme={theme} />
        <SectionCard theme={theme}>
          <Row
            icon="sun" iconColor={ORANGE}
            label={t.settings.theme} value={selectedTheme}
            onPress={() => setShowThemeSheet(true)}
            theme={theme} delay={60}
          />
          <Row
            icon="globe" iconColor="#42A5F5"
            label={t.settings.language} value={languageNames[language]}
            onPress={() => setShowLangSheet(true)}
            theme={theme} isLast delay={80}
          />
        </SectionCard>

        {/* ── ATTENDANCE SETTINGS ── */}
        <SectionLabel label={t.settings.appSettings} theme={theme} />
        <SectionCard theme={theme}>
          <Row
            icon="map-pin" iconColor="#4CAF50"
            label={t.settings.gpsAttendance}
            sublabel={t.settings.gpsAttendanceDesc}
            theme={theme}
            delay={100}
            right={
              <Switch
                value={gpsEnabled}
                onValueChange={(v) => { setGpsEnabled(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                trackColor={{ false: theme.border, true: ORANGE }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <Row
            icon="bell" iconColor="#FF9800"
            label={t.settings.attendanceReminder}
            sublabel={notifSettings.attendanceReminderEnabled
              ? formatReminderTime(notifSettings.reminderHour, notifSettings.reminderMinute)
              : undefined}
            theme={theme}
            delay={120}
            right={
              <Switch
                value={notifSettings.attendanceReminderEnabled}
                onValueChange={handleAttendanceReminderToggle}
                trackColor={{ false: theme.border, true: "#FF9800" }}
                thumbColor="#FFFFFF"
              />
            }
          />
          {notifSettings.attendanceReminderEnabled ? (
            <Row
              icon="clock" iconColor="#FF9800"
              label="Reminder Time"
              value={formatReminderTime(notifSettings.reminderHour, notifSettings.reminderMinute)}
              onPress={handleOpenTimePicker}
              theme={theme} delay={130}
            />
          ) : null}
          <Row
            icon="dollar-sign" iconColor={ORANGE}
            label={t.settings.salaryReminder}
            sublabel={notifSettings.salaryReminderEnabled ? t.notifications.enabled : t.notifications.disabled}
            theme={theme} isLast delay={140}
            right={
              <Switch
                value={notifSettings.salaryReminderEnabled}
                onValueChange={handleSalaryReminderToggle}
                trackColor={{ false: theme.border, true: ORANGE }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </SectionCard>

        {/* ── SUBSCRIPTION CARD ── */}
        <Animated.View entering={FadeInDown.delay(160).duration(350)}>
          <LinearGradient
            colors={[NAVY + "EE", "#0D1F35EE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.subCard}
          >
            <View style={styles.subCardLeft}>
              <View style={styles.subPlanBadge}>
                <ThemedText style={styles.subPlanBadgeText}>FREE PLAN</ThemedText>
              </View>
              <ThemedText style={styles.subTitle}>Haajari Basic</ThemedText>
              <ThemedText style={styles.subDesc}>Upgrade to unlock cloud sync, multi-site {"&"} team features</ThemedText>
            </View>
            <Pressable style={styles.subUpgradeBtn}>
              <LinearGradient colors={[ORANGE, "#FF8C35"]} style={styles.subUpgradeGrad}>
                <ThemedText style={styles.subUpgradeText}>Upgrade</ThemedText>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {/* ── DATA MANAGEMENT ── */}
        <SectionLabel label="Data Management" theme={theme} />
        <SectionCard theme={theme}>
          <Row
            icon="download" iconColor="#4CAF50"
            label="Backup Data"
            sublabel="Export all workers & attendance as JSON"
            onPress={handleBackup}
            theme={theme} delay={170}
          />
          <Row
            icon="upload" iconColor="#FF5722"
            label="Restore Data"
            sublabel="Import from a Haajari backup file"
            onPress={handleRestore}
            theme={theme} isLast delay={180}
          />
        </SectionCard>

        {/* ── SUPPORT & ABOUT ── */}
        <SectionLabel label="Support & About" theme={theme} />
        <SectionCard theme={theme}>
          <Row icon="help-circle" iconColor="#9C27B0" label="Help & Support" onPress={() => {}} theme={theme} delay={200} />
          <Row icon="file-text" iconColor="#607D8B" label="Terms & Conditions" onPress={() => {}} theme={theme} delay={210} />
          <Row icon="shield" iconColor="#2196F3" label="Privacy Policy" onPress={() => {}} theme={theme} delay={220} />
          <Row icon="star" iconColor="#FFC107" label="Rate Haajari" onPress={() => {}} theme={theme} delay={230} />
          <Row
            icon="info" iconColor="#9BA1A6"
            label={t.settings.version}
            value="1.0.0"
            theme={theme} isLast delay={240}
          />
        </SectionCard>

        {/* ── LOGOUT ── */}
        {!isGuest ? (
          <Animated.View entering={FadeInDown.delay(260).duration(350)}>
            <Pressable
              onPress={handleLogout}
              style={[styles.logoutBtn, { borderColor: "#EF5350" + "60" }]}
              onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <View style={[styles.logoutIcon, { backgroundColor: "#EF535018" }]}>
                <Feather name="log-out" size={18} color="#EF5350" />
              </View>
              <ThemedText style={styles.logoutText}>{t.settings.logout}</ThemedText>
            </Pressable>
          </Animated.View>
        ) : null}

        <ThemedText style={[styles.versionFooter, { color: theme.textSecondary }]}>
          Haajari — Labour Attendance Manager{"\n"}v1.0.0
        </ThemedText>

      </ScreenScrollView>

      {/* ── THEME BOTTOM SHEET ── */}
      <BottomSheet visible={showThemeSheet} onClose={() => setShowThemeSheet(false)} title={t.settings.theme} theme={theme}>
        {THEME_OPTIONS.map((opt, idx) => (
          <Pressable
            key={opt.key}
            onPress={() => changeTheme(opt.key)}
            style={[styles.sheetOption, idx < THEME_OPTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: theme.border }]}
          >
            <View style={[styles.sheetOptionIcon, { backgroundColor: theme.primary + "18" }]}>
              <Feather name={opt.icon} size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.sheetOptionLabel}>{opt.label}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{opt.desc}</ThemedText>
            </View>
            {selectedTheme === opt.key ? (
              <View style={[styles.sheetCheck, { backgroundColor: theme.primary }]}>
                <Feather name="check" size={14} color="#fff" />
              </View>
            ) : (
              <View style={[styles.sheetCheckEmpty, { borderColor: theme.border }]} />
            )}
          </Pressable>
        ))}
      </BottomSheet>

      {/* ── LANGUAGE BOTTOM SHEET ── */}
      <BottomSheet visible={showLangSheet} onClose={() => setShowLangSheet(false)} title={t.settings.language} theme={theme}>
        {LANGUAGES.map((lang, idx) => (
          <Pressable
            key={lang.code}
            onPress={() => { setLanguage(lang.code); setShowLangSheet(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[styles.sheetOption, idx < LANGUAGES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: theme.border }]}
          >
            <View style={[styles.sheetFlagBox, { backgroundColor: theme.primary + "18" }]}>
              <ThemedText style={[styles.sheetFlagText, { color: theme.primary }]}>{lang.flag}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.sheetOptionLabel}>{lang.name}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{lang.native}</ThemedText>
            </View>
            {language === lang.code ? (
              <View style={[styles.sheetCheck, { backgroundColor: theme.primary }]}>
                <Feather name="check" size={14} color="#fff" />
              </View>
            ) : (
              <View style={[styles.sheetCheckEmpty, { borderColor: theme.border }]} />
            )}
          </Pressable>
        ))}
      </BottomSheet>

      {/* ── IMAGE BOTTOM SHEET ── */}
      <BottomSheet visible={showImageSheet} onClose={() => setShowImageSheet(false)} title="Change Photo" theme={theme}>
        <Pressable
          onPress={() => pickImage(true)}
          style={[styles.sheetOption, { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: theme.border }]}
        >
          <View style={[styles.sheetOptionIcon, { backgroundColor: "#FF6B3518" }]}>
            <Feather name="camera" size={20} color="#FF6B35" />
          </View>
          <ThemedText style={styles.sheetOptionLabel}>Take Photo</ThemedText>
        </Pressable>
        <Pressable onPress={() => pickImage(false)} style={styles.sheetOption}>
          <View style={[styles.sheetOptionIcon, { backgroundColor: "#4CAF5018" }]}>
            <Feather name="image" size={20} color="#4CAF50" />
          </View>
          <ThemedText style={styles.sheetOptionLabel}>Choose from Gallery</ThemedText>
        </Pressable>
      </BottomSheet>

      {/* ── TIME PICKER BOTTOM SHEET ── */}
      <BottomSheet visible={showTimeSheet} onClose={() => setShowTimeSheet(false)} title="Set Reminder Time" theme={theme}>
        <View style={styles.timePicker}>
          <View style={styles.timeColumn}>
            <Pressable onPress={() => setEditingHour(editingHour === 12 ? 1 : editingHour + 1)} style={styles.timeArrow}>
              <Feather name="chevron-up" size={22} color={theme.primary} />
            </Pressable>
            <View style={[styles.timeValueBox, { backgroundColor: theme.primary + "14" }]}>
              <ThemedText style={[styles.timeValue, { color: theme.primary }]}>{String(editingHour).padStart(2, "0")}</ThemedText>
            </View>
            <Pressable onPress={() => setEditingHour(editingHour === 1 ? 12 : editingHour - 1)} style={styles.timeArrow}>
              <Feather name="chevron-down" size={22} color={theme.primary} />
            </Pressable>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>Hour</ThemedText>
          </View>

          <ThemedText style={[styles.timeColon, { color: theme.text }]}>:</ThemedText>

          <View style={styles.timeColumn}>
            <Pressable onPress={() => setEditingMinute(editingMinute === 45 ? 0 : editingMinute + 15)} style={styles.timeArrow}>
              <Feather name="chevron-up" size={22} color={theme.primary} />
            </Pressable>
            <View style={[styles.timeValueBox, { backgroundColor: theme.primary + "14" }]}>
              <ThemedText style={[styles.timeValue, { color: theme.primary }]}>{String(editingMinute).padStart(2, "0")}</ThemedText>
            </View>
            <Pressable onPress={() => setEditingMinute(editingMinute === 0 ? 45 : editingMinute - 15)} style={styles.timeArrow}>
              <Feather name="chevron-down" size={22} color={theme.primary} />
            </Pressable>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>Min</ThemedText>
          </View>

          <View style={styles.timeColumn}>
            <Pressable
              onPress={() => setEditingAmPm("AM")}
              style={[styles.ampmBtn, { backgroundColor: editingAmPm === "AM" ? theme.primary : theme.primary + "14" }]}
            >
              <ThemedText style={{ color: editingAmPm === "AM" ? "#fff" : theme.primary, fontWeight: "700" }}>AM</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setEditingAmPm("PM")}
              style={[styles.ampmBtn, { backgroundColor: editingAmPm === "PM" ? theme.primary : theme.primary + "14", marginTop: Spacing.sm }]}
            >
              <ThemedText style={{ color: editingAmPm === "PM" ? "#fff" : theme.primary, fontWeight: "700" }}>PM</ThemedText>
            </Pressable>
          </View>
        </View>
        <Pressable onPress={handleSaveTime} style={{ marginTop: Spacing.lg }}>
          <LinearGradient colors={["#FF6B35", "#FF8C35"]} style={styles.nameSaveBtn}>
            <ThemedText style={{ color: "#fff", fontWeight: "700" }}>{t.common.save}</ThemedText>
          </LinearGradient>
        </Pressable>
      </BottomSheet>

      {/* ── NAME EDIT BOTTOM SHEET ── */}
      <BottomSheet visible={showNameSheet} onClose={() => setShowNameSheet(false)} title="Edit Name" theme={theme}>
        <View style={[styles.nameInputWrap, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="user" size={18} color={theme.textSecondary} style={{ marginRight: Spacing.sm }} />
          <TextInput
            style={[styles.nameInput, { color: theme.text }]}
            value={editingName}
            onChangeText={setEditingName}
            autoFocus
            placeholder="Your name"
            placeholderTextColor={theme.textSecondary}
            returnKeyType="done"
            onSubmitEditing={handleSaveName}
          />
        </View>
        <View style={styles.nameActions}>
          <Pressable onPress={() => setShowNameSheet(false)} style={[styles.nameCancelBtn, { borderColor: theme.border }]}>
            <ThemedText style={{ color: theme.textSecondary, fontWeight: "600" }}>{t.common.cancel}</ThemedText>
          </Pressable>
          <Pressable onPress={handleSaveName} style={{ flex: 1 }}>
            <LinearGradient colors={["#FF6B35", "#FF8C35"]} style={styles.nameSaveBtn}>
              <ThemedText style={{ color: "#fff", fontWeight: "700" }}>{t.common.save}</ThemedText>
            </LinearGradient>
          </Pressable>
        </View>
      </BottomSheet>

    </ThemedView>
  );
}

const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ─ Section labels ──────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
    marginTop: Spacing.xl,
    marginLeft: Spacing.xs,
  },

  // ─ Card ────────────────────────────
  card: {
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
  },

  // ─ Row ─────────────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    minHeight: 60,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15.5, fontWeight: "500" },
  rowSublabel: { marginTop: 2, fontSize: 12 },
  rowRight: { flexDirection: "row", alignItems: "center" },
  rowDivider: { height: StyleSheet.hairlineWidth, marginLeft: 68 },
  valuePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  valuePillText: { fontSize: 13, fontWeight: "600" },

  // ─ Hero Card ───────────────────────
  heroCard: { borderRadius: CARD_RADIUS + 4, overflow: "hidden", marginBottom: Spacing.md },
  heroGradient: { padding: Spacing.xl, paddingBottom: Spacing.lg, position: "relative" },
  heroBubble1: {
    position: "absolute", width: 160, height: 160, borderRadius: 80,
    backgroundColor: "#FF6B3510", top: -40, right: -40,
  },
  heroBubble2: {
    position: "absolute", width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#FFFFFF08", bottom: -20, left: 40,
  },
  heroContent: { flexDirection: "row", alignItems: "center" },
  heroAvatarWrap: { position: "relative", marginRight: Spacing.lg },
  heroAvatar: {
    width: 76, height: 76, borderRadius: 38,
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "rgba(255,255,255,0.25)",
  },
  heroAvatarText: { color: "#FFFFFF", fontSize: 30, fontWeight: "800" },
  heroAvatarBadge: {
    position: "absolute", bottom: 2, right: 2,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#FF6B35", justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#1E3A5F",
  },
  heroInfo: { flex: 1 },
  heroNameRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  heroName: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  heroEditBadge: {
    marginLeft: 8, width: 20, height: 20, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center",
  },
  heroEmail: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: Spacing.sm },
  heroBadgeRow: { flexDirection: "row", gap: 8 },
  adminBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FF6B3522", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  adminBadgeText: { color: "#FF6B35", fontSize: 11, fontWeight: "700" },
  heroEditBtn: {
    marginTop: Spacing.lg,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  heroEditBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },

  // ─ Guest Banner ─────────────────────
  guestBanner: {
    flexDirection: "row", alignItems: "center", gap: Spacing.md,
    padding: Spacing.lg, borderRadius: CARD_RADIUS, borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  guestBannerTitle: { fontWeight: "700", marginBottom: 2 },
  guestSignInBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: 20,
  },

  // ─ Subscription Card ─────────────────
  subCard: {
    borderRadius: CARD_RADIUS, padding: Spacing.xl,
    flexDirection: "row", alignItems: "center",
    marginBottom: Spacing.xs, marginTop: Spacing.xl,
  },
  subCardLeft: { flex: 1, marginRight: Spacing.lg },
  subPlanBadge: {
    alignSelf: "flex-start", backgroundColor: "#FF6B3522",
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: Spacing.sm,
  },
  subPlanBadgeText: { color: "#FF6B35", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  subTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "700", marginBottom: 6 },
  subDesc: { color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 17 },
  subUpgradeBtn: { borderRadius: 16, overflow: "hidden" },
  subUpgradeGrad: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: 16 },
  subUpgradeText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },

  // ─ Logout ──────────────────────────
  logoutBtn: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: CARD_RADIUS,
    padding: Spacing.lg, marginTop: Spacing.xl,
  },
  logoutIcon: {
    width: 38, height: 38, borderRadius: 11,
    justifyContent: "center", alignItems: "center", marginRight: Spacing.md,
  },
  logoutText: { fontSize: 15.5, fontWeight: "600", color: "#EF5350", flex: 1 },

  // ─ Version ─────────────────────────
  versionFooter: { textAlign: "center", fontSize: 12, marginTop: Spacing["3xl"], lineHeight: 20, opacity: 0.4 },

  // ─ Overlay / Bottom Sheet ──────────
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: Spacing.xl, paddingTop: Spacing.lg,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: Spacing.xl },
  sheetTitle: { fontWeight: "700", marginBottom: Spacing.lg },
  sheetOption: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: Spacing.lg, gap: Spacing.md,
  },
  sheetOptionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  sheetOptionLabel: { fontSize: 16, fontWeight: "600" },
  sheetFlagBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  sheetFlagText: { fontSize: 16, fontWeight: "700" },
  sheetCheck: { width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  sheetCheckEmpty: { width: 26, height: 26, borderRadius: 13, borderWidth: 2 },

  // ─ Name Edit ───────────────────────
  nameInputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderRadius: 14, paddingHorizontal: Spacing.md,
    height: 52, marginBottom: Spacing.lg,
  },
  nameInput: { flex: 1, fontSize: 16 },
  nameActions: { flexDirection: "row", gap: Spacing.md },
  nameCancelBtn: {
    flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5,
    justifyContent: "center", alignItems: "center",
  },
  nameSaveBtn: { height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },

  // ─ Time Picker ─────────────────────
  timePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  timeColumn: { alignItems: "center", gap: Spacing.xs },
  timeArrow: { padding: Spacing.sm },
  timeValueBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  timeValue: { fontSize: 32, fontWeight: "700" },
  timeColon: { fontSize: 32, fontWeight: "700", marginBottom: Spacing["2xl"] },
  ampmBtn: {
    width: 60,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
});
