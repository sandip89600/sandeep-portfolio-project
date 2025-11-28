import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import {
  storage,
  Worker,
  WorkerCategory,
  generateId,
} from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/MainTabNavigator";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";

const CATEGORIES: WorkerCategory[] = [
  "labour",
  "bai",
  "mistri",
  "bandkam",
  "plaster",
  "tiles",
  "sutar",
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AddWorkerScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "AddWorker">>();
  const insets = useSafeAreaInsets();

  const workerId = route.params?.workerId;
  const isEditing = !!workerId;

  const [name, setName] = useState("");
  const [category, setCategory] = useState<WorkerCategory>("labour");
  const [dailyRate, setDailyRate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const saveButtonScale = useSharedValue(1);

  const animatedSaveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  useEffect(() => {
    if (workerId) {
      loadWorker();
    }
  }, [workerId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing ? t.workers.editWorker : t.workers.addWorker,
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ThemedText style={{ color: theme.primary }}>
            {t.common.cancel}
          </ThemedText>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable onPress={handleSave} style={styles.headerButton}>
          <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>
            {t.common.save}
          </ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, name, category, dailyRate, isEditing]);

  const loadWorker = async () => {
    const workers = await storage.getWorkers();
    const worker = workers.find((w) => w.id === workerId);
    if (worker) {
      setName(worker.name);
      setCategory(worker.category);
      setDailyRate(worker.dailyRate.toString());
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t.common.error, "Please enter worker name");
      return;
    }

    const rate = parseFloat(dailyRate);
    if (isNaN(rate) || rate <= 0) {
      Alert.alert(t.common.error, "Please enter a valid daily rate");
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && workerId) {
        const workers = await storage.getWorkers();
        const existingWorker = workers.find((w) => w.id === workerId);
        if (existingWorker) {
          const updatedWorker: Worker = {
            ...existingWorker,
            name: name.trim(),
            category,
            dailyRate: rate,
          };
          await storage.updateWorker(updatedWorker);
        }
      } else {
        const newWorker: Worker = {
          id: generateId(),
          name: name.trim(),
          category,
          dailyRate: rate,
          createdAt: Date.now(),
        };
        await storage.addWorker(newWorker);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Alert.alert(t.common.error, "Failed to save worker");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (cat: WorkerCategory) => {
    const colors: Record<WorkerCategory, string> = {
      labour: theme.presentGreen,
      bai: "#E91E63",
      mistri: theme.primaryDark,
      bandkam: "#795548",
      plaster: "#9C27B0",
      tiles: "#00BCD4",
      sutar: "#FF9800",
    };
    return colors[cat] || theme.primary;
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenKeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formGroup}>
          <ThemedText type="h4" style={styles.label}>
            {t.workers.name}
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder={t.workers.name}
            placeholderTextColor={theme.textSecondary}
            autoFocus={!isEditing}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText type="h4" style={styles.label}>
            {t.workers.category}
          </ThemedText>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCategory(cat);
                }}
                style={[
                  styles.categoryItem,
                  {
                    backgroundColor:
                      category === cat
                        ? getCategoryColor(cat)
                        : theme.backgroundDefault,
                    borderColor:
                      category === cat ? getCategoryColor(cat) : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: category === cat ? "#FFFFFF" : theme.text,
                    fontWeight: category === cat ? "600" : "400",
                  }}
                >
                  {t.categories[cat]}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <ThemedText type="h4" style={styles.label}>
            {t.workers.dailyRate} ({t.common.currency})
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
            value={dailyRate}
            onChangeText={setDailyRate}
            placeholder="500"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <AnimatedPressable
          onPress={handleSave}
          onPressIn={() => {
            saveButtonScale.value = withSpring(0.96);
          }}
          onPressOut={() => {
            saveButtonScale.value = withSpring(1);
          }}
          disabled={isLoading}
          style={[
            styles.saveButton,
            { backgroundColor: theme.primary, opacity: isLoading ? 0.6 : 1 },
            animatedSaveStyle,
          ]}
        >
          <ThemedText style={styles.saveButtonText}>
            {isLoading ? t.common.loading : t.common.save}
          </ThemedText>
        </AnimatedPressable>
      </ScreenKeyboardAwareScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  headerButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  formGroup: {
    marginBottom: Spacing["2xl"],
  },
  label: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  saveButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
