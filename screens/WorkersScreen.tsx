import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  FlatList,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { storage, Worker, WorkerCategory } from "@/utils/storage";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/MainTabNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface WorkerCardProps {
  worker: Worker;
  onEdit: () => void;
  onDelete: () => void;
  theme: typeof Colors.light;
  t: any;
  index: number;
}

function WorkerCard({
  worker,
  onEdit,
  onDelete,
  theme,
  t,
  index,
}: WorkerCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getCategoryColor = (category: WorkerCategory) => {
    const colors: Record<WorkerCategory, string> = {
      labour: theme.presentGreen,
      bai: "#E91E63",
      mistri: theme.primaryDark,
      bandkam: "#795548",
      plaster: "#9C27B0",
      tiles: "#00BCD4",
      sutar: "#FF9800",
    };
    return colors[category] || theme.primary;
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <AnimatedPressable
        onPress={onEdit}
        onPressIn={() => {
          scale.value = withSpring(0.98);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={[
          styles.workerCard,
          { backgroundColor: theme.backgroundDefault },
          animatedStyle,
        ]}
      >
        <View style={styles.workerInfo}>
          <ThemedText type="h3" style={styles.workerName}>
            {worker.name}
          </ThemedText>
          <View style={styles.workerDetails}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(worker.category) + "20" },
              ]}
            >
              <ThemedText
                type="small"
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(worker.category) },
                ]}
              >
                {t.categories[worker.category]}
              </ThemedText>
            </View>
            <ThemedText type="body" style={styles.rateText}>
              {t.common.currency} {worker.dailyRate}/day
            </ThemedText>
          </View>
        </View>
        <View style={styles.workerActions}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onEdit();
            }}
            style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="edit-2" size={18} color={theme.primary} />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onDelete();
            }}
            style={[styles.actionButton, { backgroundColor: theme.error + "15" }]}
          >
            <Feather name="trash-2" size={18} color={theme.error} />
          </Pressable>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function WorkersScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [workers, setWorkers] = useState<Worker[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadWorkers();
    }, [])
  );

  const loadWorkers = async () => {
    const loadedWorkers = await storage.getWorkers();
    setWorkers(loadedWorkers.sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleAddWorker = () => {
    navigation.navigate("AddWorker");
  };

  const handleEditWorker = (worker: Worker) => {
    navigation.navigate("AddWorker", { workerId: worker.id });
  };

  const handleDeleteWorker = (worker: Worker) => {
    Alert.alert(t.workers.delete, t.workers.deleteConfirm, [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.common.delete,
        style: "destructive",
        onPress: async () => {
          await storage.deleteWorker(worker.id);
          await loadWorkers();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const renderWorker = ({ item, index }: { item: Worker; index: number }) => (
    <WorkerCard
      worker={item}
      onEdit={() => handleEditWorker(item)}
      onDelete={() => handleDeleteWorker(item)}
      theme={theme}
      t={t}
      index={index}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather
        name="user-plus"
        size={64}
        color={theme.textSecondary}
        style={styles.emptyIcon}
      />
      <ThemedText type="h3" style={styles.emptyTitle}>
        {t.workers.noWorkers}
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.emptySubtitle, { color: theme.textSecondary }]}
      >
        {t.workers.addFirst}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={workers}
        renderItem={renderWorker}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl + Spacing.fabSize + Spacing.xl,
          },
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <AnimatedPressable
        onPress={handleAddWorker}
        style={[
          styles.fab,
          {
            backgroundColor: theme.primary,
            bottom: tabBarHeight + Spacing.xl,
          },
          Shadows.fab,
        ]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </AnimatedPressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    marginBottom: Spacing.xs,
  },
  workerDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
  },
  categoryText: {
    fontWeight: "600",
    fontSize: 11,
  },
  rateText: {
    opacity: 0.7,
  },
  workerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    height: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Spacing["5xl"],
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: Spacing.fabSize,
    height: Spacing.fabSize,
    borderRadius: Spacing.fabSize / 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
