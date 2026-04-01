import React, { useState, useCallback, memo } from "react";
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
import { storage, ProfileData } from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SettingItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  theme: typeof Colors.light;
  isDestructive?: boolean;
  right?: React.ReactNode;
}

const SettingItem = memo(
  ({ icon, label, value, onPress, theme, isDestructive, right }: SettingItemProps) => {
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
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[
          styles.item,
          { backgroundColor: theme.backgroundDefault },
          animatedStyle,
        ]}
      >
        <View
          style={[
            styles.itemIcon,
            {
              backgroundColor: isDestructive
                ? theme.error + "15"
                : theme.primary + "15",
            },
          ]}
        >
          <Feather
            name={icon as any}
            size={18}
            color={isDestructive ? theme.error : theme.primary}
          />
        </View>
        <ThemedText style={[styles.itemText, isDestructive ? { color: theme.error } : {}]}>
          {label}
        </ThemedText>

        {right ? (
          right
        ) : (
          <View style={styles.itemRight}>
            {value ? (
              <ThemedText style={styles.itemValue}>{value}</ThemedText>
            ) : null}
            {onPress ? (
              <Feather name="chevron-right" size={18} color={theme.textSecondary} />
            ) : null}
          </View>
        )}
      </AnimatedPressable>
    );
  }
);

const THEME_OPTIONS = [
  { key: "Light", icon: "sun" as const, label: "Light" },
  { key: "Dark", icon: "moon" as const, label: "Dark" },
  { key: "System", icon: "smartphone" as const, label: "System" },
];

const LANGUAGES: { code: Language; name: string }[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
];

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { email, logout, userType, isGuest } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [profile, setProfile] = useState<ProfileData>({
    name: isGuest ? "Guest" : "Admin",
    avatarColor: isGuest ? "#9BA1A6" : "#FF6B6B",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(
    themeMode === "dark" ? "Dark" : themeMode === "light" ? "Light" : "System"
  );

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [editingName, setEditingName] = useState("");

  const [gpsEnabled, setGpsEnabled] = useState(false);

  const loadProfile = useCallback(async () => {
    const data = await storage.getProfile();
    if (data) setProfile(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const changeTheme = async (value: string) => {
    setSelectedTheme(value);
    setShowThemeModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const map: Record<string, "light" | "dark" | "system"> = {
      Light: "light",
      Dark: "dark",
      System: "system",
    };
    await setThemeMode(map[value]);
  };

  const pickImage = async (camera = false) => {
    const result = camera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
        });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setShowImageModal(false);
    }
  };

  const handleOpenNameEdit = () => {
    setEditingName(profile.name);
    setShowNameModal(true);
  };

  const handleSaveName = async () => {
    const newName = editingName.trim();
    if (!newName) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const newProfile = { ...profile, name: newName };
    await storage.setProfile(newProfile);
    setProfile(newProfile);
    setShowNameModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogout = () => {
    if (isGuest) {
      logout();
      return;
    }
    Alert.alert(t.settings.logout, t.settings.logoutConfirm, [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.settings.logout,
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl * 3,
        }}
      >
        {/* PROFILE CARD */}
        <View style={[styles.header, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable
            onPress={() => setShowImageModal(true)}
            style={styles.avatarContainer}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
                <ThemedText style={styles.avatarText}>
                  {profile?.name?.charAt(0)?.toUpperCase() || "A"}
                </ThemedText>
              </View>
            )}
            <View style={[styles.avatarEditBadge, { backgroundColor: theme.primary }]}>
              <Feather name="camera" size={12} color="#FFFFFF" />
            </View>
          </Pressable>

          <Pressable onPress={handleOpenNameEdit} style={styles.nameRow}>
            <ThemedText style={styles.userName}>{profile.name}</ThemedText>
            <Feather name="edit-2" size={14} color={theme.textSecondary} style={{ marginLeft: 6 }} />
          </Pressable>
          <ThemedText style={styles.userEmail}>{isGuest ? t.settings.guestMode : email}</ThemedText>
          {userType === "admin" ? (
            <View style={[styles.roleBadge, { backgroundColor: theme.primary + "20" }]}>
              <ThemedText type="small" style={{ color: theme.primary, fontWeight: "600" }}>
                {t.settings.admin}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={{ height: Spacing.xl }} />

        {/* APP SETTINGS */}
        <View style={styles.sectionHeader}>
          <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8 }}>
            {t.settings.appearance}
          </ThemedText>
        </View>
        <View style={styles.section}>
          <View style={[styles.itemsContainer, { backgroundColor: theme.backgroundDefault }]}>
            <SettingItem
              icon="sun"
              label={t.settings.theme}
              value={selectedTheme}
              onPress={() => setShowThemeModal(true)}
              theme={theme}
            />
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
            <SettingItem
              icon="globe"
              label={t.settings.language}
              value={languageNames[language]}
              onPress={() => setShowLanguageModal(true)}
              theme={theme}
            />
          </View>
        </View>

        {/* FUNCTIONALITY */}
        <View style={styles.sectionHeader}>
          <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8 }}>
            {t.settings.appSettings}
          </ThemedText>
        </View>
        <View style={styles.section}>
          <View style={[styles.itemsContainer, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.item}>
              <View style={[styles.itemIcon, { backgroundColor: theme.primary + "15" }]}>
                <Feather name="map-pin" size={18} color={theme.primary} />
              </View>
              <ThemedText style={styles.itemText}>{t.settings.gpsAttendance}</ThemedText>
              <Switch
                value={gpsEnabled}
                onValueChange={(v) => {
                  setGpsEnabled(v);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* GUEST SIGN IN PROMPT */}
        {isGuest ? (
          <View style={styles.section}>
            <View style={[styles.guestCard, { backgroundColor: theme.primary + "12", borderColor: theme.primary + "30" }]}>
              <Feather name="lock" size={20} color={theme.primary} style={{ marginBottom: Spacing.sm }} />
              <ThemedText style={{ fontWeight: "600", marginBottom: Spacing.xs, color: theme.primary }}>
                {t.settings.guestMode}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.lg, textAlign: "center" }}>
                {t.settings.guestModeDesc}
              </ThemedText>
              <Pressable
                onPress={handleLogout}
                style={[styles.signInBtn, { backgroundColor: theme.primary }]}
              >
                <Feather name="log-in" size={16} color="#FFFFFF" />
                <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "700", marginLeft: Spacing.xs }}>
                  {t.settings.signIn}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8 }}>
                {t.settings.profile}
              </ThemedText>
            </View>
            <View style={styles.section}>
              <View style={[styles.itemsContainer, { backgroundColor: theme.backgroundDefault }]}>
                <SettingItem
                  icon="log-out"
                  label={t.settings.logout}
                  onPress={handleLogout}
                  theme={theme}
                  isDestructive
                />
              </View>
            </View>
          </>
        )}

        <View style={styles.versionContainer}>
          <ThemedText style={styles.versionText}>{t.settings.version} 1.0.0</ThemedText>
        </View>
      </ScreenScrollView>

      {/* THEME MODAL */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowThemeModal(false)}>
          <Pressable
            style={[styles.modal, { backgroundColor: theme.backgroundDefault }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />
            <ThemedText type="h3" style={styles.modalTitle}>{t.settings.theme}</ThemedText>
            {THEME_OPTIONS.map((opt, idx) => (
              <Pressable
                key={opt.key}
                onPress={() => changeTheme(opt.key)}
                style={[
                  styles.modalOption,
                  { borderColor: theme.border },
                  idx < THEME_OPTIONS.length - 1 ? { borderBottomWidth: 1 } : {},
                ]}
              >
                <View style={[styles.modalOptionIcon, { backgroundColor: theme.primary + "15" }]}>
                  <Feather name={opt.icon} size={20} color={theme.primary} />
                </View>
                <ThemedText type="body" style={{ flex: 1 }}>{opt.label}</ThemedText>
                {selectedTheme === opt.key ? (
                  <Feather name="check" size={20} color={theme.primary} />
                ) : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* LANGUAGE MODAL */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowLanguageModal(false)}>
          <Pressable
            style={[styles.modal, { backgroundColor: theme.backgroundDefault }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />
            <ThemedText type="h3" style={styles.modalTitle}>{t.settings.language}</ThemedText>
            {LANGUAGES.map((lang, idx) => (
              <Pressable
                key={lang.code}
                onPress={() => {
                  setLanguage(lang.code);
                  setShowLanguageModal(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.modalOption,
                  { borderColor: theme.border },
                  idx < LANGUAGES.length - 1 ? { borderBottomWidth: 1 } : {},
                ]}
              >
                <View style={[styles.modalOptionIcon, { backgroundColor: theme.primary + "15" }]}>
                  <ThemedText style={{ fontSize: 18 }}>
                    {lang.code === "en" ? "EN" : "हि"}
                  </ThemedText>
                </View>
                <ThemedText type="body" style={{ flex: 1 }}>{lang.name}</ThemedText>
                {language === lang.code ? (
                  <Feather name="check" size={20} color={theme.primary} />
                ) : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* IMAGE MODAL */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImageModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowImageModal(false)}>
          <Pressable
            style={[styles.modal, { backgroundColor: theme.backgroundDefault }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />
            <ThemedText type="h3" style={styles.modalTitle}>Change Photo</ThemedText>
            <Pressable
              style={[styles.modalOption, { borderColor: theme.border, borderBottomWidth: 1 }]}
              onPress={() => pickImage(true)}
            >
              <View style={[styles.modalOptionIcon, { backgroundColor: theme.primary + "15" }]}>
                <Feather name="camera" size={20} color={theme.primary} />
              </View>
              <ThemedText type="body">Take Photo</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.modalOption, { borderColor: theme.border }]}
              onPress={() => pickImage(false)}
            >
              <View style={[styles.modalOptionIcon, { backgroundColor: theme.presentGreen + "15" }]}>
                <Feather name="image" size={20} color={theme.presentGreen} />
              </View>
              <ThemedText type="body">Choose from Gallery</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* NAME EDIT MODAL */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNameModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowNameModal(false)}>
          <Pressable
            style={[styles.modal, { backgroundColor: theme.backgroundDefault }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />
            <ThemedText type="h3" style={styles.modalTitle}>Edit Name</ThemedText>
            <View style={[styles.nameInputRow, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}>
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
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowNameModal(false)}
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
              >
                <ThemedText type="body" style={{ color: theme.textSecondary }}>{t.common.cancel}</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveName}
                style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "700" }}>{t.common.save}</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 1.5,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  avatarContainer: {
    marginBottom: Spacing.lg,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "bold",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  sectionHeader: {
    marginHorizontal: Spacing.lg + Spacing.sm,
    marginBottom: Spacing.xs,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  itemsContainer: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    height: 64,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  itemText: {
    flex: 1,
    fontSize: 17,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  itemValue: {
    fontSize: 16,
    opacity: 0.5,
  },
  guestCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    alignItems: "center",
  },
  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
  versionContainer: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
    opacity: 0.3,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xl * 2,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    marginBottom: Spacing.lg,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  modalOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  nameInputRow: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    height: 52,
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  nameInput: {
    fontSize: 17,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
});
