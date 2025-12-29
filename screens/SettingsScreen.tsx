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
import { saveThemeMode } from "@/hooks/useThemeContext";
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
        onPressIn={() => (scale.value = withSpring(0.97))}
        onPressOut={() => (scale.value = withSpring(1))}
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
                  ? theme.error + "20"
                  : theme.primary + "20",
              },
            ]}
          >
            <Feather
              name={icon as any}
              size={18}
              color={isDestructive ? theme.error : theme.primary}
            />
          </View>
          <ThemedText style={{ color: isDestructive ? theme.error : theme.text }}>
            {label}
          </ThemedText>
        </View>

        <View style={styles.itemRight}>
          {value && (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {value}
            </ThemedText>
          )}
          {onPress && (
            <Feather name="chevron-right" size={18} color={theme.textSecondary} />
          )}
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
  const { theme, themeMode } = useTheme();
  const { email, logout, user, userType } = useAuth();
  const { language, setLanguage } = useLanguage();

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [profile, setProfile] = useState<ProfileData>({
    name: "Admin",
    avatarColor: "#FF6B6B",
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

    const map: any = { Light: "light", Dark: "dark", System: "system" };
    await saveThemeMode(map[value]);
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
    <ThemedView style={{ flex: 1 }}>
      <ScreenScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {/* PROFILE */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable onPress={() => setShowImageModal(true)}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: profile.avatarColor },
                ]}
              >
                <ThemedText type="h1" style={{ color: "#fff" }}>
                  {profile?.name?.charAt(0)?.toUpperCase() || "A"}
                </ThemedText>
              </View>
            )}
          </Pressable>

          <ThemedText type="h2">{profile.name}</ThemedText>
          <ThemedText type="small">{email}</ThemedText>
          <ThemedText type="small">{userType}</ThemedText>
        </View>

        {/* PREFERENCES */}
        <SettingItem
          icon="sun"
          label="Theme"
          value={selectedTheme}
          onPress={() => setShowThemeModal(true)}
          theme={theme}
        />

        <SettingItem
          icon="globe"
          label="Language"
          value={languageNames[language]}
          onPress={() => setShowLanguageModal(true)}
          theme={theme}
        />

        {/* TOGGLE */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.row}>
            <ThemedText>GPS Attendance</ThemedText>
            <Switch value={gpsEnabled} onValueChange={setGpsEnabled} />
          </View>
        </View>

        {/* DANGER */}
        <SettingItem
          icon="log-out"
          label="Logout"
          onPress={handleLogout}
          theme={theme}
          isDestructive
        />
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
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    width: "80%",
    gap: 16,
  },
});
