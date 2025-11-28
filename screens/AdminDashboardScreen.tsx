import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { storage, User } from "@/utils/storage";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function AdminDashboardScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom + 60;

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    loggedIn: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const loadUsers = async () => {
    const loadedUsers = await storage.getUsers();
    setUsers(loadedUsers);
    setFilteredUsers(loadedUsers);
    updateStats(loadedUsers);
  };

  const updateStats = (userList: User[]) => {
    setStats({
      total: userList.length,
      active: userList.filter((u) => u.isActive).length,
      inactive: userList.filter((u) => !u.isActive).length,
      loggedIn: userList.filter((u) => u.loginHistory && u.loginHistory.length > 0).length,
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleToggleActive = async (user: User) => {
    const updated = { ...user, isActive: !user.isActive };
    await storage.updateUser(updated);
    await loadUsers();
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert("Delete User", `Delete ${user.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await storage.deleteUser(user.id);
          await loadUsers();
        },
      },
    ]);
  };

  const StatCard = ({ label, value, color }: any) => (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: color + "30",
          borderWidth: 1,
        },
      ]}
    >
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
      <ThemedText type="h2" style={{ color, marginTop: Spacing.xs }}>
        {value}
      </ThemedText>
    </View>
  );

  const UserCard = ({ user }: { user: User }) => (
    <View
      style={[
        styles.userCard,
        { backgroundColor: theme.backgroundDefault },
      ]}
    >
      <View style={styles.userInfo}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: user.avatarColor },
          ]}
        >
          <ThemedText type="h3" style={{ color: "#FFFFFF" }}>
            {user.name[0].toUpperCase()}
          </ThemedText>
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="h3">{user.name}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {user.email}
          </ThemedText>
          <View style={styles.userMeta}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: user.isActive
                    ? theme.presentGreen + "20"
                    : theme.error + "20",
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: user.isActive ? theme.presentGreen : theme.error,
                }}
              >
                {user.isActive ? "Active" : "Inactive"}
              </ThemedText>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.primary + "20" },
              ]}
            >
              <ThemedText type="small" style={{ color: theme.primary }}>
                {user.role}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => handleToggleActive(user)}
          style={[
            styles.actionBtn,
            {
              backgroundColor: user.isActive ? theme.error + "15" : theme.presentGreen + "15",
            },
          ]}
        >
          <Feather
            name={user.isActive ? "lock" : "unlock"}
            size={18}
            color={user.isActive ? theme.error : theme.presentGreen}
          />
        </Pressable>
        <Pressable
          onPress={() => handleDeleteUser(user)}
          style={[styles.actionBtn, { backgroundColor: theme.error + "15" }]}
        >
          <Feather name="trash-2" size={18} color={theme.error} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
      >
        <ThemedText type="h1" style={{ marginBottom: Spacing.lg }}>
          Admin Dashboard
        </ThemedText>

        <View style={styles.statsContainer}>
          <StatCard label="Total Users" value={stats.total} color={theme.primary} />
          <StatCard label="Active" value={stats.active} color={theme.presentGreen} />
          <StatCard label="Inactive" value={stats.inactive} color={theme.error} />
        </View>

        <View style={styles.statsContainer}>
          <StatCard label="Users Logged In" value={stats.loggedIn} color={theme.primary + "dd"} />
        </View>

        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search users..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <ThemedText
          type="h3"
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          Users ({filteredUsers.length})
        </ThemedText>

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <UserCard user={item} />}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          ListEmptyComponent={
            <ThemedText
              type="body"
              style={{
                textAlign: "center",
                marginTop: Spacing.xl,
                color: theme.textSecondary,
              }}
            >
              No users found
            </ThemedText>
          }
        />
      </ScreenScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  userMeta: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
});
