import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Modal,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { storage, User } from "@/utils/storage";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Spacing, BorderRadius } from "@/constants/theme";

const AVATAR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA15E"
];

export default function UserProfileScreen() {
  const { theme } = useTheme();
  const { user: authUser, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom + 60;

  const [user, setUser] = useState<User | null>(authUser || null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editAvatarColor, setEditAvatarColor] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (authUser) {
      loadUserData();
    }
  }, [authUser]);

  const loadUserData = async () => {
    if (authUser) {
      const userData = await storage.getUserById(authUser.id);
      if (userData) {
        setUser(userData);
      }
    }
  };

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
      Alert.alert("Permission Denied", "Camera permission is required to take photos");
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
      await saveProfileImage(result.assets[0]);
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
      await saveProfileImage(result.assets[0]);
      setShowImageModal(false);
    }
  };

  const saveProfileImage = async (imageAsset: any) => {
    if (user) {
      const base64 = imageAsset.base64
        ? `data:image/jpeg;base64,${imageAsset.base64}`
        : imageAsset.uri;

      const updated = {
        ...user,
        profileImage: base64,
      };
      await storage.updateUser(updated);
      setUser(updated);
      Alert.alert("Success", "Profile picture updated successfully");
    }
  };

  const handleRemoveProfileImage = () => {
    Alert.alert("Remove Picture", "Remove profile picture?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          if (user) {
            const updated = { ...user, profileImage: undefined };
            await storage.updateUser(updated);
            setUser(updated);
            Alert.alert("Success", "Profile picture removed");
          }
        },
      },
    ]);
  };

  const openEditModal = () => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || "");
      setEditAddress(user.address || "");
      setEditAvatarColor(user.avatarColor);
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = async () => {
    if (user) {
      const updated = {
        ...user,
        name: editName,
        phone: editPhone,
        address: editAddress,
        avatarColor: editAvatarColor,
      };
      await storage.updateUser(updated);
      setUser(updated);
      setShowEditModal(false);
      Alert.alert("Success", "Profile updated successfully");
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (user && user.password !== oldPassword) {
      Alert.alert("Error", "Old password is incorrect");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (user) {
      const updated = { ...user, password: newPassword };
      await storage.updateUser(updated);
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Password changed successfully");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (user) {
              await storage.deleteUser(user.id);
              await logout();
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScreenScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
      >
        <ThemedText type="h1" style={{ marginBottom: Spacing["2xl"] }}>
          My Profile
        </ThemedText>

        <Pressable
          onPress={() => setShowImageModal(true)}
          style={[styles.profileCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            {user.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View
                style={[
                  styles.largeAvatar,
                  { backgroundColor: user.avatarColor },
                ]}
              >
                <ThemedText type="h1" style={{ color: "#FFFFFF" }}>
                  {user.name[0].toUpperCase()}
                </ThemedText>
              </View>
            )}
            <View style={{ flex: 1, marginLeft: Spacing.lg }}>
              <ThemedText type="h3">{user.name}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {user.email}
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.primary, marginTop: Spacing.xs }}
              >
                {user.role}
              </ThemedText>
            </View>
          </View>
          <Feather name="camera" size={20} color={theme.primary} />
        </Pressable>

        <View style={styles.section}>
          <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>
            Account Information
          </ThemedText>

          <View style={styles.infoRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Email
            </ThemedText>
            <ThemedText type="body">{user.email}</ThemedText>
          </View>

          {user.phone && (
            <View style={styles.infoRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Phone
              </ThemedText>
              <ThemedText type="body">{user.phone}</ThemedText>
            </View>
          )}

          {user.address && (
            <View style={styles.infoRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Address
              </ThemedText>
              <ThemedText type="body">{user.address}</ThemedText>
            </View>
          )}

          <View style={styles.infoRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Member Since
            </ThemedText>
            <ThemedText type="body">
              {new Date(user.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={() => setShowPasswordModal(true)}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Feather name="lock" size={18} color="#FFFFFF" />
            <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}>
              Change Password
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={openEditModal}
            style={[styles.button, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, borderWidth: 1, marginTop: Spacing.lg }]}
          >
            <Feather name="edit-2" size={18} color={theme.primary} />
            <ThemedText type="body" style={{ color: theme.primary, marginLeft: Spacing.sm }}>
              Edit Profile
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleDeleteAccount}
            style={[styles.button, { backgroundColor: theme.error + "15", marginTop: Spacing.lg }]}
          >
            <Feather name="trash-2" size={18} color={theme.error} />
            <ThemedText type="body" style={{ color: theme.error, marginLeft: Spacing.sm }}>
              Delete Account
            </ThemedText>
          </Pressable>
        </View>
      </ScreenScrollView>

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
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>
              Edit Profile
            </ThemedText>

            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
              Name
            </ThemedText>
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
              placeholder="Name"
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.lg }}>
              Phone
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.backgroundRoot,
                },
              ]}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Phone"
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.lg }}>
              Address
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.backgroundRoot,
                },
              ]}
              value={editAddress}
              onChangeText={setEditAddress}
              placeholder="Address"
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md, marginTop: Spacing.lg }}>
              Avatar Color
            </ThemedText>
            <View style={styles.colorGrid}>
              {AVATAR_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setEditAvatarColor(color)}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color,
                      borderWidth: editAvatarColor === color ? 3 : 0,
                      borderColor: editAvatarColor === color ? "#FFFFFF" : "transparent",
                    },
                  ]}
                />
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: Spacing.md, marginTop: Spacing.xl }}>
              <Pressable
                onPress={() => setShowEditModal(false)}
                style={[styles.modalButton, { backgroundColor: theme.backgroundRoot, borderColor: theme.border, borderWidth: 1 }]}
              >
                <ThemedText type="body">Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveProfile}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF" }}>
                  Save
                </ThemedText>
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
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>
              Change Password
            </ThemedText>

            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
              Current Password
            </ThemedText>
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
              placeholder="Current password"
              secureTextEntry
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.lg }}>
              New Password
            </ThemedText>
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
              placeholder="New password"
              secureTextEntry
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.lg }}>
              Confirm Password
            </ThemedText>
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
              placeholder="Confirm password"
              secureTextEntry
              placeholderTextColor={theme.textSecondary}
            />

            <View style={{ flexDirection: "row", gap: Spacing.md, marginTop: Spacing.xl }}>
              <Pressable
                onPress={() => setShowPasswordModal(false)}
                style={[styles.modalButton, { backgroundColor: theme.backgroundRoot, borderColor: theme.border, borderWidth: 1 }]}
              >
                <ThemedText type="body">Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleChangePassword}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF" }}>
                  Change
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

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
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>
              Update Profile Picture
            </ThemedText>

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

            {user.profileImage && (
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing["2xl"],
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: Spacing.lg,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  infoRow: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing["2xl"],
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  colorGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
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
