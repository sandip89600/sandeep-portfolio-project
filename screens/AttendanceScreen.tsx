import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { captureLocation, requestLocationPermission, GPSLocation } from "@/utils/gps";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import {
  storage,
  Worker,
  AttendanceRecord,
  AttendanceValue,
  getDaysInMonth,
} from "@/utils/storage";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";

const CELL_SIZE = 56;
const NAME_COLUMN_WIDTH = 120;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AttendanceCellProps {
  value: AttendanceValue | null;
  onPress: () => void;
  theme: typeof Colors.light;
}

function AttendanceCell({ value, onPress, theme }: AttendanceCellProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getCellStyle = () => {
    if (value === "P") return { backgroundColor: theme.presentGreen };
    if (value === "A") return { backgroundColor: theme.absentRed };
    if (value === "H") return { backgroundColor: theme.halfDayYellow };
    if (typeof value === "number") return { backgroundColor: theme.amountBlue };
    return { backgroundColor: theme.backgroundDefault };
  };

  const getCellText = () => {
    if (value === "P") return "P";
    if (value === "A") return "A";
    if (value === "H") return "1/2";
    if (typeof value === "number") return value.toString();
    return "";
  };

  const getTextColor = () => {
    if (value === "P" || value === "A" || value === "H" || typeof value === "number") {
      return "#FFFFFF";
    }
    return theme.textSecondary;
  };

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.cell, getCellStyle(), animatedStyle]}
    >
      <ThemedText
        type="small"
        style={[styles.cellText, { color: getTextColor() }]}
      >
        {getCellText()}
      </ThemedText>
    </AnimatedPressable>
  );
}

export default function AttendanceScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = insets.bottom + 60;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    workerId: string;
    day: number;
  } | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [capturedLocation, setCapturedLocation] = useState<GPSLocation | null>(null);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [gridHeight, setGridHeight] = useState(0);

  // Refs for synchronized scrolling
  const namesScrollRef = useRef<ScrollView>(null);
  const cellsScrollRef = useRef<ScrollView>(null);

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const monthNames = [
    t.months.january, t.months.february, t.months.march, t.months.april,
    t.months.may, t.months.june, t.months.july, t.months.august,
    t.months.september, t.months.october, t.months.november, t.months.december,
  ];

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const loadedWorkers = await storage.getWorkers();
      const loadedAttendance = await storage.getAttendanceForMonth(selectedYear, selectedMonth);
      setWorkers(loadedWorkers);
      setAttendance(loadedAttendance);
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceValue = (workerId: string, day: number): AttendanceValue | null => {
    const record = attendance.find(
      (a) => a.workerId === workerId && a.year === selectedYear && a.month === selectedMonth && a.day === day
    );
    return record?.value ?? null;
  };

  const handleCellPress = (workerId: string, day: number) => {
    setSelectedCell({ workerId, day });
    setShowInputModal(true);
    setCustomAmount("");
    setCapturedLocation(null);
  };

  const captureGPSLocation = async () => {
    if (Platform.OS === "web") {
      Alert.alert("GPS", "Run in Expo Go to use GPS attendance.");
      return;
    }
    setIsCapturingGPS(true);
    try {
      const permission = await requestLocationPermission();
      if (permission !== "granted") {
        Alert.alert(t.gps.permissionDenied, t.gps.permissionRequired);
        return;
      }
      const loc = await captureLocation();
      if (loc) {
        setCapturedLocation(loc);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(t.common.error, t.attendance.gpsFailed);
      }
    } catch {
      Alert.alert(t.common.error, t.attendance.gpsFailed);
    } finally {
      setIsCapturingGPS(false);
    }
  };

  const markAttendance = async (value: AttendanceValue) => {
    if (!selectedCell) return;

    const record: AttendanceRecord = {
      workerId: selectedCell.workerId,
      year: selectedYear,
      month: selectedMonth,
      day: selectedCell.day,
      value,
      location: capturedLocation ?? undefined,
      timestamp: Date.now(),
    };

    await storage.setAttendanceRecord(record);
    await loadData();
    setShowInputModal(false);
    setSelectedCell(null);
    setCapturedLocation(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCustomAmount = () => {
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      markAttendance(amount);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t.common.error, t.attendance.invalidAmount);
    }
  };

  const handleVerticalScroll = (y: number) => {
    namesScrollRef.current?.scrollTo({ y, animated: false });
  };

  const renderMonthPicker = () => (
    <Modal
      visible={showMonthPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowMonthPicker(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setShowMonthPicker(false)}>
        <View style={[styles.monthPickerContainer, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.yearSelector}>
            <Pressable onPress={() => setSelectedYear(selectedYear - 1)} style={styles.yearArrow}>
              <Feather name="chevron-left" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="h3">{selectedYear}</ThemedText>
            <Pressable onPress={() => setSelectedYear(selectedYear + 1)} style={styles.yearArrow}>
              <Feather name="chevron-right" size={24} color={theme.text} />
            </Pressable>
          </View>
          <View style={styles.monthGrid}>
            {monthNames.map((month, index) => (
              <Pressable
                key={index}
                onPress={() => { setSelectedMonth(index); setShowMonthPicker(false); }}
                style={[
                  styles.monthItem,
                  { backgroundColor: selectedMonth === index ? theme.primary : "transparent" },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{ color: selectedMonth === index ? "#FFFFFF" : theme.text }}
                >
                  {month.substring(0, 3)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );

  const renderInputModal = () => (
    <Modal
      visible={showInputModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowInputModal(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setShowInputModal(false)}>
        <View style={[styles.inputModalContainer, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h3" style={styles.inputModalTitle}>
            {t.attendance.tapToMark}
          </ThemedText>

          <View style={styles.quickOptions}>
            <Pressable
              onPress={() => markAttendance("P")}
              style={[styles.quickOption, { backgroundColor: theme.presentGreen }]}
            >
              <ThemedText style={styles.quickOptionText}>{t.attendance.present}</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => markAttendance("A")}
              style={[styles.quickOption, { backgroundColor: theme.absentRed }]}
            >
              <ThemedText style={styles.quickOptionText}>{t.attendance.absent}</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => markAttendance("H")}
              style={[styles.quickOption, { backgroundColor: theme.halfDayYellow }]}
            >
              <ThemedText style={styles.quickOptionText}>{t.attendance.halfDay}</ThemedText>
            </Pressable>
          </View>

          <View style={styles.customAmountContainer}>
            <TextInput
              style={[
                styles.customAmountInput,
                { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
              ]}
              placeholder={`${t.common.currency} (100, 200, 500...)`}
              placeholderTextColor={theme.textSecondary}
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
            />
            <Pressable
              onPress={handleCustomAmount}
              style={[styles.customAmountButton, { backgroundColor: theme.amountBlue }]}
            >
              <Feather name="check" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <Pressable
            onPress={captureGPSLocation}
            disabled={isCapturingGPS}
            style={[
              styles.gpsButton,
              {
                backgroundColor: capturedLocation ? theme.presentGreen + "15" : theme.backgroundSecondary,
                borderColor: capturedLocation ? theme.presentGreen : theme.border,
              },
            ]}
          >
            <Feather
              name="map-pin"
              size={14}
              color={capturedLocation ? theme.presentGreen : theme.textSecondary}
            />
            <ThemedText
              type="small"
              style={{ color: capturedLocation ? theme.presentGreen : theme.textSecondary, marginLeft: 6 }}
            >
              {isCapturingGPS ? t.attendance.gpsCapturing : capturedLocation ? t.attendance.gpsCaptured : t.attendance.captureGPS}
            </ThemedText>
            {capturedLocation ? (
              <Feather name="check-circle" size={14} color={theme.presentGreen} style={{ marginLeft: "auto" }} />
            ) : null}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.emptyContainer, { paddingTop: headerHeight + Spacing.xl }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  if (workers.length === 0) {
    return (
      <ThemedView
        style={[styles.emptyContainer, { paddingTop: headerHeight + Spacing.xl, paddingBottom: tabBarHeight + Spacing.xl }]}
      >
        <Feather name="users" size={64} color={theme.textSecondary} style={styles.emptyIcon} />
        <ThemedText type="h3" style={styles.emptyTitle}>{t.attendance.noWorkers}</ThemedText>
        <ThemedText type="body" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          {t.attendance.addWorkerFirst}
        </ThemedText>
      </ThemedView>
    );
  }

  const cellsHeight = gridHeight > 0 ? gridHeight - CELL_SIZE : undefined;

  return (
    <ThemedView style={styles.container}>
      {/* Month selector */}
      <Pressable
        onPress={() => setShowMonthPicker(true)}
        style={[
          styles.monthSelector,
          { top: headerHeight + Spacing.sm, backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <ThemedText type="h4">{monthNames[selectedMonth]} {selectedYear}</ThemedText>
        <Feather name="chevron-down" size={18} color={theme.text} />
      </Pressable>

      {/* Grid container */}
      <View
        style={[styles.gridContainer, { marginTop: headerHeight + Spacing["4xl"] + Spacing.sm, marginBottom: tabBarHeight }]}
        onLayout={(e) => setGridHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.gridInner}>

          {/* ── Frozen left column (worker names) ── */}
          <View style={styles.frozenCol}>
            {/* Corner cell */}
            <View style={[styles.cornerCell, { backgroundColor: theme.primaryDark }]}>
              <ThemedText style={styles.cornerText}>{t.workers.title}</ThemedText>
            </View>

            {/* Worker name cells — scroll controlled by right side */}
            <ScrollView
              ref={namesScrollRef}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              style={cellsHeight ? { height: cellsHeight } : { flex: 1 }}
            >
              {workers.map((worker) => (
                <View
                  key={worker.id}
                  style={[styles.workerNameCell, { backgroundColor: theme.backgroundSecondary }]}
                >
                  {worker.photoUri ? (
                    <Image source={{ uri: worker.photoUri }} style={styles.workerAvatar} />
                  ) : (
                    <View style={[styles.workerAvatarPlaceholder, { backgroundColor: theme.primary + "25" }]}>
                      <ThemedText style={[styles.workerAvatarInitial, { color: theme.primary }]}>
                        {(worker.name || "?").charAt(0).toUpperCase()}
                      </ThemedText>
                    </View>
                  )}
                  <ThemedText type="small" style={styles.workerName} numberOfLines={2}>
                    {worker.name}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ── Right scrollable area (single horizontal ScrollView) ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            bounces={false}
            style={{ flex: 1 }}
          >
            <View>
              {/* Days header row — always visible at top */}
              <View style={styles.daysHeaderRow}>
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <View key={i} style={[styles.dayCell, { backgroundColor: theme.primaryDark }]}>
                    <ThemedText style={styles.dayText}>{i + 1}</ThemedText>
                  </View>
                ))}
              </View>

              {/* Attendance cells — vertically scrollable, drives left column */}
              <ScrollView
                ref={cellsScrollRef}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                bounces={false}
                style={cellsHeight ? { height: cellsHeight } : { flex: 1 }}
                onScroll={(e) => handleVerticalScroll(e.nativeEvent.contentOffset.y)}
              >
                {workers.map((worker) => (
                  <View key={worker.id} style={styles.attendanceCellRow}>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <AttendanceCell
                        key={i}
                        value={getAttendanceValue(worker.id, i + 1)}
                        onPress={() => handleCellPress(worker.id, i + 1)}
                        theme={theme}
                      />
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

        </View>
      </View>

      {renderMonthPicker()}
      {renderInputModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
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
  monthSelector: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    gap: Spacing.xs,
    zIndex: 10,
  },

  // ─ Grid layout ──────────────────────────────────────
  gridContainer: {
    flex: 1,
  },
  gridInner: {
    flex: 1,
    flexDirection: "row",
  },

  // ─ Frozen left column ───────────────────────────────
  frozenCol: {
    width: NAME_COLUMN_WIDTH,
  },
  cornerCell: {
    width: NAME_COLUMN_WIDTH,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.2)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  cornerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  workerNameCell: {
    width: NAME_COLUMN_WIDTH,
    height: CELL_SIZE,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
    gap: Spacing.xs,
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  workerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    flexShrink: 0,
  },
  workerAvatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  workerAvatarInitial: {
    fontSize: 12,
    fontWeight: "700",
  },
  workerName: {
    flex: 1,
    fontWeight: "500",
    fontSize: 11,
  },

  // ─ Days header ──────────────────────────────────────
  daysHeaderRow: {
    flexDirection: "row",
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.2)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  dayText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // ─ Attendance cells ──────────────────────────────────
  attendanceCellRow: {
    flexDirection: "row",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  cellText: {
    fontWeight: "600",
    fontSize: 12,
  },

  // ─ Modals ────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  monthPickerContainer: {
    width: "85%",
    maxWidth: 320,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  yearSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  yearArrow: {
    padding: Spacing.sm,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  monthItem: {
    width: "30%",
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  inputModalContainer: {
    width: "85%",
    maxWidth: 320,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  inputModalTitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  quickOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
  },
  quickOptionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  customAmountContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  customAmountInput: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  customAmountButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
});
