import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
  Modal,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useHeaderHeight } from "@react-navigation/elements";
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
import { storage, ProfileData, User } from "@/utils/storage";
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
  const { email, logout, user: authUser, userType, userId } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = insets.bottom + 60;
  
  const [profile, setProfile] = useState<ProfileData>({ name: "Admin", avatarColor: "#FF6B6B" });
  const [user, setUser] = useState<User | null>(authUser || null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    if (userType === "user" && authUser) {
      setUser(authUser);
    }
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    }
    return true;
  };

  const requestLibraryPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === "granted";
    }
    return true;
  };

  const handlePickFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera permission is required");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      saveProfileImage(result.assets[0]);
      setShowImageModal(false);
    }
  };

  const handlePickFromLibrary = async () => {
    const hasPermission = await requestLibraryPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Photo library permission is required");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      saveProfileImage(result.assets[0]);
      setShowImageModal(false);
    }
  };

  const saveProfileImage = (imageAsset: any) => {
    const base64 = imageAsset.base64
      ? `data:image/jpeg;base64,${imageAsset.base64}`
      : imageAsset.uri;
    setProfileImage(base64);
    Alert.alert("Success", "Profile picture updated");
  };

  const handleRemoveProfileImage = () => {
    Alert.alert("Remove Picture", "Remove profile picture?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setProfileImage(null);
          Alert.alert("Success", "Profile picture removed");
        },
      },
    ]);
  };

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

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (userType === "admin") {
      // For admin user
      const adminPassword = "sandeep121";
      if (oldPassword !== adminPassword) {
        Alert.alert("Error", "Current password is incorrect");
        return;
      }
      // In production, this would be updated in backend
      Alert.alert("Success", "Password changed successfully");
    } else if (userType === "user" && user) {
      // For regular user
      if (user.password !== oldPassword) {
        Alert.alert("Error", "Current password is incorrect");
        return;
      }
      const updatedUser = { ...user, password: newPassword };
      await storage.updateUser(updatedUser);
      setUser(updatedUser);
      Alert.alert("Success", "Password changed successfully");
    }

    setShowPasswordModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
    <ThemedView style={{ flex: 1 }}>
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
        <Pressable onPress={openEditModal} style={[styles.profileCardPressable, { backgroundColor: theme.backgroundDefault }]}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
            }}
          >
            {profileImage && userType === "admin" ? (
              <Image
                source={{ uri: profileImage }}
                style={[styles.avatar, { width: 56, height: 56 }]}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: profile.avatarColor },
                ]}
              >
                <Feather name="user" size={32} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.profileInfo}>
              <ThemedText type="h3">{profile.name}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {email || "sandeep@gmail.com"}
              </ThemedText>
            </View>
          </View>
          <Pressable onPress={() => userType === "admin" && setShowImageModal(true)}>
            <Feather name={userType === "admin" ? "camera" : "edit-3"} size={20} color={theme.primary} />
          </Pressable>
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText
          type="small"
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          SECURITY
        </ThemedText>
        <SettingsItem
          icon="lock"
          label="Change Password"
          onPress={() => setShowPasswordModal(true)}
          theme={theme}
        />
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

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPasswordModal(false)}
        >
          <View
            style={[
              styles.editModalContainer,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h3" style={styles.modalTitle}>Change Password</ThemedText>
            
            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.formLabel}>Current Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundRoot,
                  },
                ]}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Enter current password"
                secureTextEntry
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.formLabel}>New Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundRoot,
                  },
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.formLabel}>Confirm Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundRoot,
                  },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => setShowPasswordModal(false)}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.backgroundDefault, borderWidth: 1, borderColor: theme.border },
                ]}
              >
                <ThemedText type="body">Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleChangePassword}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>Change</ThemedText>
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

      {userType === "admin" && (
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowImageModal(false)}
        >
          <View
            style={[
              styles.editModalContainer,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h3" style={styles.modalTitle}>Update Profile Picture</ThemedText>

            <Pressable
              onPress={handlePickFromCamera}
              style={[styles.imageButton, { backgroundColor: theme.primary }]}
            >
              <Feather name="camera" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.md }}>
                Take Photo
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handlePickFromLibrary}
              style={[styles.imageButton, { backgroundColor: theme.backgroundRoot, borderColor: theme.primary, borderWidth: 1, marginTop: Spacing.lg }]}
            >
              <Feather name="image" size={20} color={theme.primary} />
              <ThemedText type="body" style={{ color: theme.primary, marginLeft: Spacing.md }}>
                Choose from Library
              </ThemedText>
            </Pressable>

            {profileImage && (
              <Pressable
                onPress={handleRemoveProfileImage}
                style={[styles.imageButton, { backgroundColor: theme.error + "15", marginTop: Spacing.lg }]}
              >
                <Feather name="trash-2" size={20} color={theme.error} />
                <ThemedText type="body" style={{ color: theme.error, marginLeft: Spacing.md }}>
                  Remove Picture
                </ThemedText>
              </Pressable>
            )}

            <Pressable
              onPress={() => setShowImageModal(false)}
              style={[styles.imageButton, { backgroundColor: theme.backgroundRoot, borderColor: theme.border, borderWidth: 1, marginTop: Spacing.lg }]}
            >
              <ThemedText type="body">Cancel</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      )}
    </ThemedView>
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
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  profileCardPressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
  },
});
