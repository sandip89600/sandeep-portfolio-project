import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import {
  storage,
  Worker,
  AttendanceRecord,
  calculateWorkerSummary,
} from "@/utils/storage";
import {
  generateAttendanceHTML,
  generateSummaryHTML,
  generateCSV,
  exportToPDF,
  printHTML,
  shareCSV,
} from "@/utils/export";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface WorkerSummary {
  worker: Worker;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  totalAmount: number;
}

interface SummaryCardProps {
  summary: WorkerSummary;
  theme: typeof Colors.light;
  t: any;
  index: number;
}

function SummaryCard({ summary, theme, t, index }: SummaryCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.cardHeader}>
        <ThemedText type="h3">{summary.worker.name}</ThemedText>
        <ThemedText
          type="h2"
          style={[styles.totalAmount, { color: theme.primary }]}
        >
          {t.common.currency} {summary.totalAmount.toFixed(0)}
        </ThemedText>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View
            style={[styles.statPill, { backgroundColor: theme.presentGreen + "20" }]}
          >
            <Feather name="check-circle" size={14} color={theme.presentGreen} />
            <ThemedText
              type="small"
              style={[styles.statValue, { color: theme.presentGreen }]}
            >
              {summary.presentDays}
            </ThemedText>
          </View>
          <ThemedText
            type="small"
            style={[styles.statLabel, { color: theme.textSecondary }]}
          >
            {t.summary.totalPresent}
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <View
            style={[styles.statPill, { backgroundColor: theme.halfDayYellow + "20" }]}
          >
            <Feather name="clock" size={14} color={theme.halfDayYellow} />
            <ThemedText
              type="small"
              style={[styles.statValue, { color: theme.halfDayYellow }]}
            >
              {summary.halfDays}
            </ThemedText>
          </View>
          <ThemedText
            type="small"
            style={[styles.statLabel, { color: theme.textSecondary }]}
          >
            {t.summary.totalHalfDays}
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <View
            style={[styles.statPill, { backgroundColor: theme.absentRed + "20" }]}
          >
            <Feather name="x-circle" size={14} color={theme.absentRed} />
            <ThemedText
              type="small"
              style={[styles.statValue, { color: theme.absentRed }]}
            >
              {summary.absentDays}
            </ThemedText>
          </View>
          <ThemedText
            type="small"
            style={[styles.statLabel, { color: theme.textSecondary }]}
          >
            {t.summary.totalAbsent}
          </ThemedText>
        </View>
      </View>

      <View style={styles.rateInfo}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {t.workers.dailyRate}: {t.common.currency} {summary.worker.dailyRate}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

export default function SummaryScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch {
    tabBarHeight = insets.bottom;
  }

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summaries, setSummaries] = useState<WorkerSummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [grandTotal, setGrandTotal] = useState(0);

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

  useFocusEffect(
    useCallback(() => {
      loadSummaries();
    }, [selectedMonth, selectedYear])
  );

  const loadSummaries = async () => {
    const loadedWorkers = await storage.getWorkers();
    const loadedAttendance = await storage.getAttendanceForMonth(
      selectedYear,
      selectedMonth
    );

    setWorkers(loadedWorkers);
    setAttendance(loadedAttendance);

    const workerSummaries: WorkerSummary[] = loadedWorkers.map((worker) => {
      const summary = calculateWorkerSummary(
        worker.id,
        loadedAttendance,
        worker.dailyRate
      );
      return {
        worker,
        ...summary,
      };
    });

    setSummaries(workerSummaries);
    setGrandTotal(
      workerSummaries.reduce((sum, s) => sum + s.totalAmount, 0)
    );
  };

  const getExportData = () => ({
    workers,
    attendance,
    year: selectedYear,
    month: selectedMonth,
    monthName: monthNames[selectedMonth],
    currency: t.common.currency,
    translations: t,
  });

  const handleExportPDF = async (type: "attendance" | "summary") => {
    if (workers.length === 0) {
      Alert.alert(t.common.error, t.export.noDataToExport);
      return;
    }

    setIsExporting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const data = getExportData();
      const html =
        type === "attendance"
          ? generateAttendanceHTML(data)
          : generateSummaryHTML(data);
      const filename = `${t.app.name}_${type}_${monthNames[selectedMonth]}_${selectedYear}.pdf`;

      const success = await exportToPDF(html, filename);
      if (success) {
        Alert.alert(t.common.success, t.export.success);
      }
    } catch (error) {
      Alert.alert(t.common.error, t.export.error);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const handleExportCSV = async () => {
    if (workers.length === 0) {
      Alert.alert(t.common.error, t.export.noDataToExport);
      return;
    }

    setIsExporting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const data = getExportData();
      const csv = generateCSV(data);
      const filename = `${t.app.name}_${monthNames[selectedMonth]}_${selectedYear}.csv`;

      const success = await shareCSV(csv, filename);
      if (success) {
        Alert.alert(t.common.success, t.export.success);
      }
    } catch (error) {
      Alert.alert(t.common.error, t.export.error);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const handlePrint = async () => {
    if (workers.length === 0) {
      Alert.alert(t.common.error, t.export.noDataToExport);
      return;
    }

    setIsExporting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const data = getExportData();
      const html = generateAttendanceHTML(data);
      await printHTML(html);
    } catch (error) {
      Alert.alert(t.common.error, t.export.error);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const renderSummary = ({
    item,
    index,
  }: {
    item: WorkerSummary;
    index: number;
  }) => (
    <SummaryCard summary={item} theme={theme} t={t} index={index} />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.topRow}>
        <Pressable
          onPress={() => setShowMonthPicker(true)}
          style={[
            styles.monthSelector,
            {
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

        <Pressable
          onPress={() => setShowExportModal(true)}
          style={[
            styles.exportButton,
            { backgroundColor: theme.primary },
          ]}
        >
          <Feather name="share" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <View
        style={[
          styles.grandTotalCard,
          { backgroundColor: theme.primary },
        ]}
      >
        <ThemedText style={styles.grandTotalLabel}>
          {t.summary.totalAmount}
        </ThemedText>
        <ThemedText style={styles.grandTotalValue}>
          {t.common.currency} {grandTotal.toFixed(0)}
        </ThemedText>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather
        name="bar-chart-2"
        size={64}
        color={theme.textSecondary}
        style={styles.emptyIcon}
      />
      <ThemedText type="h3" style={styles.emptyTitle}>
        {t.summary.noData}
      </ThemedText>
    </View>
  );

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

  const renderExportModal = () => (
    <Modal
      visible={showExportModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowExportModal(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => !isExporting && setShowExportModal(false)}
      >
        <View
          style={[
            styles.exportModalContainer,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText type="h3" style={styles.exportModalTitle}>
            {t.export.title}
          </ThemedText>

          {isExporting ? (
            <View style={styles.exportingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText type="body" style={styles.exportingText}>
                {t.export.generating}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.exportOptions}>
              <Pressable
                onPress={() => handleExportPDF("attendance")}
                style={[
                  styles.exportOption,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <View
                  style={[
                    styles.exportIconContainer,
                    { backgroundColor: theme.error + "20" },
                  ]}
                >
                  <Feather name="file-text" size={24} color={theme.error} />
                </View>
                <View style={styles.exportOptionText}>
                  <ThemedText type="h4">
                    {t.export.attendanceReport}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {t.export.pdf}
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>

              <Pressable
                onPress={() => handleExportPDF("summary")}
                style={[
                  styles.exportOption,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <View
                  style={[
                    styles.exportIconContainer,
                    { backgroundColor: theme.primary + "20" },
                  ]}
                >
                  <Feather name="bar-chart-2" size={24} color={theme.primary} />
                </View>
                <View style={styles.exportOptionText}>
                  <ThemedText type="h4">
                    {t.export.summaryReport}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {t.export.pdf}
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>

              <Pressable
                onPress={handleExportCSV}
                style={[
                  styles.exportOption,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <View
                  style={[
                    styles.exportIconContainer,
                    { backgroundColor: theme.presentGreen + "20" },
                  ]}
                >
                  <Feather name="file" size={24} color={theme.presentGreen} />
                </View>
                <View style={styles.exportOptionText}>
                  <ThemedText type="h4">{t.export.csv}</ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    Excel/Spreadsheet
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>

              <Pressable
                onPress={handlePrint}
                style={[
                  styles.exportOption,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <View
                  style={[
                    styles.exportIconContainer,
                    { backgroundColor: theme.info + "20" },
                  ]}
                >
                  <Feather name="printer" size={24} color={theme.info} />
                </View>
                <View style={styles.exportOptionText}>
                  <ThemedText type="h4">{t.export.print}</ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {t.export.attendanceReport}
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={summaries}
        renderItem={renderSummary}
        keyExtractor={(item) => item.worker.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {renderMonthPicker()}
      {renderExportModal()}
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
  headerContent: {
    marginBottom: Spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  monthSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  grandTotalCard: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    alignItems: "center",
  },
  grandTotalLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  grandTotalValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },
  summaryCard: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  totalAmount: {
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: "center",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 11,
  },
  rateInfo: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: Spacing.sm,
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
  exportModalContainer: {
    width: "90%",
    maxWidth: 360,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  exportModalTitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  exportingContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  exportingText: {
    marginTop: Spacing.lg,
  },
  exportOptions: {
    gap: Spacing.sm,
  },
  exportOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  exportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  exportOptionText: {
    flex: 1,
  },
});
