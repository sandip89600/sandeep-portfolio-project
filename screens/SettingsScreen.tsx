import React, { useState, useEffect, useCallback, memo } from "react";
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
import { Spacing, BorderRadius } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* -------------------- SETTING ITEM -------------------- */

interface SettingItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  theme: any;
  isDestructive?: boolean;
}

const SettingItem = memo(
  ({ icon, label, value, onPress, theme, isDestructive }: SettingItemProps) => {
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
        onPressIn={() => (scale.value = withSpring(0.98))}
        onPressOut={() => (scale.value = withSpring(1))}
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
        <ThemedText style={[styles.itemText, isDestructive && { color: theme.error }]}>
          {label}
        </ThemedText>

        <View style={styles.itemRight}>
          {value && (
            <ThemedText style={styles.itemValue}>
              {value}
            </ThemedText>
          )}
          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </View>
      </AnimatedPressable>
    );
  }
);

/* -------------------- CONSTANTS -------------------- */

const THEMES = ["Light", "Dark", "System"];
const LANGUAGES = [
  { code: "en" as Language, name: "English" },
  { code: "hi" as Language, name: "हिंदी" },
];

/* -------------------- SCREEN -------------------- */

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { email, logout, user, userType, isGuest } = useAuth();
  const { language, setLanguage } = useLanguage();

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

  const [gpsEnabled, setGpsEnabled] = useState(false);

  /* -------------------- PERMISSIONS -------------------- */

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        await ImagePicker.requestCameraPermissionsAsync();
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
    })();
  }, []);

  /* -------------------- LOAD PROFILE -------------------- */

  const loadProfile = useCallback(async () => {
    const data = await storage.getProfile();
    if (data) setProfile(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      if (mounted) loadProfile();
      return () => {
        mounted = false;
      };
    }, [loadProfile])
  );

  /* -------------------- ACTIONS -------------------- */

  const changeTheme = async (value: string) => {
    setSelectedTheme(value);
    setShowThemeModal(false);
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

  const handleLogout = () => {
    if (isGuest) {
      logout();
      return;
    }
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  /* -------------------- UI -------------------- */

  return (
    <ThemedView style={styles.container}>
      <ScreenScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
      >
        {/* PROFILE CARD */}
        <View style={[styles.header, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable onPress={() => setShowImageModal(true)} style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: profile.avatarColor },
                ]}
              >
                <ThemedText style={styles.avatarText}>
                  {profile?.name?.charAt(0)?.toUpperCase() || "A"}
                </ThemedText>
              </View>
            )}
          </Pressable>

          <ThemedText style={styles.userName}>{profile.name}</ThemedText>
          <ThemedText style={styles.userEmail}>{email}</ThemedText>
        </View>

        <View style={{ height: Spacing.xl }} />

        {/* APP SETTINGS */}
        <View style={styles.section}>
          <View style={styles.itemsContainer}>
            <SettingItem
              icon="sun"
              label={t.settings.theme}
              value={selectedTheme}
              onPress={() => setShowThemeModal(true)}
              theme={theme}
            />
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
        <View style={styles.section}>
          <View style={[styles.itemsContainer, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.item}>
              <View style={[styles.itemIcon, { backgroundColor: theme.primary + "15" }]}>
                <Feather name="map-pin" size={18} color={theme.primary} />
              </View>
              <ThemedText style={styles.itemText}>{t.settings.gpsAttendance}</ThemedText>
              <Switch 
                value={gpsEnabled} 
                onValueChange={setGpsEnabled}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* GUEST SIGN IN PROMPT */}
        {isGuest ? (
          <View style={[styles.section]}>
            <View
              style={[
                styles.itemsContainer,
                { backgroundColor: theme.primary + "15", borderRadius: BorderRadius.xl, padding: Spacing.xl },
              ]}
            >
              <ThemedText style={{ fontWeight: "600", marginBottom: Spacing.sm, color: theme.primary }}>
                {t.settings.guestMode}
              </ThemedText>
              <ThemedText style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
                {t.settings.guestModeDesc}
              </ThemedText>
              <SettingItem
                icon="log-in"
                label={t.settings.signIn}
                onPress={handleLogout}
                theme={theme}
              />
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.itemsContainer}>
              <SettingItem
                icon="log-out"
                label={t.settings.logout}
                onPress={handleLogout}
                theme={theme}
                isDestructive
              />
            </View>
          </View>
        )}

        <View style={styles.versionContainer}>
          <ThemedText style={styles.versionText}>{t.settings.version} 1.0.0</ThemedText>
        </View>
      </ScreenScrollView>

      {/* THEME MODAL */}
      <Modal visible={showThemeModal} transparent animationType="fade">
        <Pressable style={styles.overlay}>
          <Pressable style={[styles.modal, { backgroundColor: theme.backgroundDefault }]}>
            {THEMES.map((t) => (
              <Pressable key={t} onPress={() => changeTheme(t)}>
                <ThemedText>{t}</ThemedText>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* LANGUAGE MODAL */}
      <Modal visible={showLanguageModal} transparent animationType="fade">
        <Pressable style={styles.overlay}>
          <Pressable style={[styles.modal, { backgroundColor: theme.backgroundDefault }]}>
            {LANGUAGES.map((l) => (
              <Pressable
                key={l.code}
                onPress={() => {
                  setLanguage(l.code);
                  setShowLanguageModal(false);
                }}
              >
                <ThemedText>{l.name}</ThemedText>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* IMAGE MODAL */}
      <Modal visible={showImageModal} transparent animationType="fade">
        <Pressable style={styles.overlay}>
          <Pressable style={[styles.modal, { backgroundColor: theme.backgroundDefault }]}>
            <Pressable onPress={() => pickImage(true)}>
              <ThemedText>Take Photo</ThemedText>
            </Pressable>
            <Pressable onPress={() => pickImage(false)}>
              <ThemedText>Choose from Gallery</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

/* -------------------- STYLES -------------------- */

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
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.6,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  itemsContainer: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
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
  },
  itemValue: {
    fontSize: 16,
    marginRight: Spacing.xs,
    opacity: 0.5,
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
    gap: Spacing.md,
  },
});
