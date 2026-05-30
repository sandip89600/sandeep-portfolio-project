import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
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
    if (value === "P") {
      return { backgroundColor: theme.presentGreen };
    }
    if (value === "A") {
      return { backgroundColor: theme.absentRed };
    }
    if (value === "H") {
      return { backgroundColor: theme.halfDayYellow };
    }
    if (typeof value === "number") {
      return { backgroundColor: theme.amountBlue };
    }
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
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    workerId: string;
    day: number;
  } | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [capturedLocation, setCapturedLocation] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);

  const horizontalScrollRef = useRef<ScrollView>(null);
  const verticalScrollRef = useRef<ScrollView>(null);

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const monthNames = [
    t.months.january,
    t.months.february,
    t.months.march,
    t.months.april,
    t.months.may,
    t.months.june,
    t.months.july,
    t.months.august,
    t.months.september,
    t.months.october,
    t.months.november,
    t.months.december,
  ];

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    const loadedWorkers = await storage.getWorkers();
    const loadedAttendance = await storage.getAttendanceForMonth(
      selectedYear,
      selectedMonth
    );
    setWorkers(loadedWorkers);
    setAttendance(loadedAttendance);
  };

  const getAttendanceValue = (
    workerId: string,
    day: number
  ): AttendanceValue | null => {
    const record = attendance.find(
      (a) =>
        a.workerId === workerId &&
        a.year === selectedYear &&
        a.month === selectedMonth &&
        a.day === day
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
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (!canAskAgain && Platform.OS !== "web") {
          Alert.alert(t.gps.permissionDenied, t.gps.permissionRequired, [
            { text: t.common.cancel, style: "cancel" },
            { text: t.gps.openSettings, onPress: () => { try { Linking.openSettings(); } catch {} } },
          ]);
        } else {
          Alert.alert(t.gps.permissionDenied, t.gps.permissionRequired);
        }
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCapturedLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const renderMonthPicker = () => (
    <Modal
      visible={showMonthPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowMonthPicker(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowMonthPicker(false)}
      >
        <View
          style={[
            styles.monthPickerContainer,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.yearSelector}>
            <Pressable
              onPress={() => setSelectedYear(selectedYear - 1)}
              style={styles.yearArrow}
            >
              <Feather name="chevron-left" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="h3">{selectedYear}</ThemedText>
            <Pressable
              onPress={() => setSelectedYear(selectedYear + 1)}
              style={styles.yearArrow}
            >
              <Feather name="chevron-right" size={24} color={theme.text} />
            </Pressable>
          </View>
          <View style={styles.monthGrid}>
            {monthNames.map((month, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setSelectedMonth(index);
                  setShowMonthPicker(false);
                }}
                style={[
                  styles.monthItem,
                  {
                    backgroundColor:
                      selectedMonth === index
                        ? theme.primary
                        : "transparent",
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color:
                      selectedMonth === index ? "#FFFFFF" : theme.text,
                  }}
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
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowInputModal(false)}
      >
        <View
          style={[
            styles.inputModalContainer,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText type="h3" style={styles.inputModalTitle}>
            {t.attendance.tapToMark}
          </ThemedText>

          <View style={styles.quickOptions}>
            <Pressable
              onPress={() => markAttendance("P")}
              style={[
                styles.quickOption,
                { backgroundColor: theme.presentGreen },
              ]}
            >
              <ThemedText style={styles.quickOptionText}>
                {t.attendance.present}
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => markAttendance("A")}
              style={[
                styles.quickOption,
                { backgroundColor: theme.absentRed },
              ]}
            >
              <ThemedText style={styles.quickOptionText}>
                {t.attendance.absent}
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => markAttendance("H")}
              style={[
                styles.quickOption,
                { backgroundColor: theme.halfDayYellow },
              ]}
            >
              <ThemedText style={styles.quickOptionText}>
                {t.attendance.halfDay}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.customAmountContainer}>
            <TextInput
              style={[
                styles.customAmountInput,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
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

          {/* GPS Location Capture */}
          <Pressable
            onPress={captureGPSLocation}
            disabled={isCapturingGPS}
            style={[
              styles.gpsButton,
              {
                backgroundColor: capturedLocation
                  ? theme.presentGreen + "15"
                  : theme.backgroundSecondary,
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
              {isCapturingGPS
                ? t.attendance.gpsCapturing
                : capturedLocation
                ? t.attendance.gpsCaptured
                : t.attendance.captureGPS}
            </ThemedText>
            {capturedLocation ? (
              <Feather name="check-circle" size={14} color={theme.presentGreen} style={{ marginLeft: "auto" }} />
            ) : null}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );

  if (workers.length === 0) {
    return (
      <ThemedView
        style={[
          styles.emptyContainer,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
      >
        <Feather
          name="users"
          size={64}
          color={theme.textSecondary}
          style={styles.emptyIcon}
        />
        <ThemedText type="h3" style={styles.emptyTitle}>
          {t.attendance.noWorkers}
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.emptySubtitle, { color: theme.textSecondary }]}
        >
          {t.attendance.addWorkerFirst}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Pressable
        onPress={() => setShowMonthPicker(true)}
        style={[
          styles.monthSelector,
          {
            top: headerHeight + Spacing.sm,
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
          },
        ]}
      >
        <ThemedText type="h4">
          {monthNames[selectedMonth]} {selectedYear}
        </ThemedText>
        <Feather name="chevron-down" size={18} color={theme.text} />
      </Pressable>

      <View
        style={[
          styles.gridContainer,
          {
            marginTop: headerHeight + Spacing["4xl"] + Spacing.sm,
            marginBottom: tabBarHeight,
          },
        ]}
      >
        <View style={styles.gridHeader}>
          <View
            style={[
              styles.cornerCell,
              { backgroundColor: theme.primaryDark },
            ]}
          >
            <ThemedText style={styles.cornerText}>
              {t.workers.title}
            </ThemedText>
          </View>
          <ScrollView
            ref={horizontalScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            <View style={styles.daysRow}>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dayCell,
                    { backgroundColor: theme.primaryDark },
                  ]}
                >
                  <ThemedText style={styles.dayText}>{i + 1}</ThemedText>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <ScrollView
          ref={verticalScrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.workersScrollContent}
        >
          {workers.map((worker) => (
            <View key={worker.id} style={styles.workerRow}>
              <View
                style={[
                  styles.workerNameCell,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <ThemedText
                  type="small"
                  style={styles.workerName}
                  numberOfLines={2}
                >
                  {worker.name}
                </ThemedText>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
              >
                <View style={styles.attendanceRow}>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <AttendanceCell
                      key={i}
                      value={getAttendanceValue(worker.id, i + 1)}
                      onPress={() => handleCellPress(worker.id, i + 1)}
                      theme={theme}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
        </ScrollView>
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
  gridContainer: {
    flex: 1,
  },
  gridHeader: {
    flexDirection: "row",
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
  daysRow: {
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
  workersScrollContent: {
    flexGrow: 1,
  },
  workerRow: {
    flexDirection: "row",
  },
  workerNameCell: {
    width: NAME_COLUMN_WIDTH,
    height: CELL_SIZE,
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  workerName: {
    fontWeight: "500",
  },
  attendanceRow: {
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
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  quickOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.xs,
    alignItems: "center",
    borderRadius: BorderRadius.xs,
  },
  quickOptionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  customAmountContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  customAmountInput: {
    flex: 1,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  customAmountButton: {
    width: Spacing.inputHeight,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
});
