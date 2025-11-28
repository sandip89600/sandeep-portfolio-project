import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  theme: typeof Colors.light;
  isDestructive?: boolean;
}

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  theme,
  isDestructive,
}: SettingsItemProps) {
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
        styles.settingsItem,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.settingsItemLeft}>
        <View
          style={[
            styles.iconContainer,
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
      {value ? (
        <View style={styles.settingsItemRight}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {value}
          </ThemedText>
          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </View>
      ) : onPress ? (
        <Feather name="chevron-right" size={18} color={theme.textSecondary} />
      ) : null}
    </AnimatedPressable>
  );
}

const AVATAR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA15E"
];

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { email, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  let tabBarHeight = insets.bottom;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch {
    tabBarHeight = insets.bottom;
  }
  
  const [profile, setProfile] = useState<ProfileData>({ name: "Admin", avatarColor: "#FF6B6B" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await storage.getProfile();
    setProfile(data);
    setEditName(data.name);
    setSelectedColor(data.avatarColor);
  };

  const handleSaveProfile = async () => {
    if (editName.trim()) {
      const updatedProfile: ProfileData = {
        name: editName.trim(),
        avatarColor: selectedColor || profile.avatarColor,
      };
      await storage.setProfile(updatedProfile);
      setProfile(updatedProfile);
      setShowEditModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const openEditModal = () => {
    setEditName(profile.name);
    setSelectedColor(profile.avatarColor);
    setShowEditModal(true);
  };

  const handleLanguageChange = (lang: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(lang);
  };

  const handleLogout = () => {
    Alert.alert(t.settings.logout, t.settings.logoutConfirm, [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.settings.logout,
        style: "destructive",
        onPress: async () => {
          await logout();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  return (
    <ScreenScrollView
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
    >
      <View style={styles.section}>
        <ThemedText
          type="small"
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          {t.settings.profile.toUpperCase()}
        </ThemedText>
        <Pressable onPress={openEditModal}>
          <View
            style={[
              styles.profileCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View
              style={[
                styles.avatar,
                { backgroundColor: profile.avatarColor },
              ]}
            >
              <Feather name="user" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="h3">{profile.name}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {email || "admin@haajari.com"}
              </ThemedText>
            </View>
            <Feather name="edit-3" size={20} color={theme.primary} />
          </View>
        </Pressable>
      </View>

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowEditModal(false)}
        >
          <View
            style={[
              styles.editModalContainer,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h3" style={styles.modalTitle}>Edit Profile</ThemedText>
            
            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.formLabel}>Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundRoot,
                  },
                ]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter name"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.formLabel}>Avatar Color</ThemedText>
              <View style={styles.colorGrid}>
                {AVATAR_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: color,
                        borderWidth: selectedColor === color ? 3 : 0,
                        borderColor: selectedColor === color ? "#000" : "transparent",
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => setShowEditModal(false)}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.backgroundDefault, borderWidth: 1, borderColor: theme.border },
                ]}
              >
                <ThemedText type="body">Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveProfile}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>Save</ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <View style={styles.section}>
        <ThemedText
          type="small"
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          {t.settings.language.toUpperCase()}
        </ThemedText>
        <View style={styles.languageContainer}>
          {(Object.keys(languageNames) as Language[]).map((lang) => (
            <Pressable
              key={lang}
              onPress={() => handleLanguageChange(lang)}
              style={[
                styles.languageOption,
                {
                  backgroundColor:
                    language === lang
                      ? theme.primary
                      : theme.backgroundDefault,
                  borderColor:
                    language === lang ? theme.primary : theme.border,
                },
              ]}
            >
              <View style={styles.languageContent}>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor:
                        language === lang ? "#FFFFFF" : theme.border,
                    },
                  ]}
                >
                  {language === lang ? (
                    <View
                      style={[styles.radioInner, { backgroundColor: "#FFFFFF" }]}
                    />
                  ) : null}
                </View>
                <ThemedText
                  type="body"
                  style={{
                    color: language === lang ? "#FFFFFF" : theme.text,
                    fontWeight: language === lang ? "600" : "400",
                  }}
                >
                  {languageNames[lang]}
                </ThemedText>
              </View>
              <ThemedText
                type="small"
                style={{
                  color: language === lang ? "rgba(255,255,255,0.7)" : theme.textSecondary,
                }}
              >
                {lang === "en" ? "English" : "Hindi"}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText
          type="small"
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          {t.app.name.toUpperCase()}
        </ThemedText>
        <SettingsItem
          icon="info"
          label={t.app.tagline}
          theme={theme}
        />
      </View>

      <View style={styles.section}>
        <SettingsItem
          icon="log-out"
          label={t.settings.logout}
          onPress={handleLogout}
          theme={theme}
          isDestructive
        />
      </View>

      <View style={styles.footer}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {t.app.name} v1.0.0
        </ThemedText>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  languageContainer: {
    gap: Spacing.sm,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  profileCard: {
    ...styles.profileCard,
    justifyContent: "space-between",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  editModalContainer: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing["2xl"],
  },
  modalTitle: {
    marginBottom: Spacing.lg,
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
});
