import React, { useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
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
  PaymentRecord,
  calculateWorkerSummary,
  generateId,
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
  totalPaid: number;
  balance: number;
  payments: PaymentRecord[];
}

interface SummaryCardProps {
  summary: WorkerSummary;
  theme: typeof Colors.light;
  t: any;
  index: number;
  onMarkPaid: (summary: WorkerSummary) => void;
  onDeletePayment: (paymentId: string) => void;
}

function SummaryCard({ summary, theme, t, index, onMarkPaid, onDeletePayment }: SummaryCardProps) {
  const [showPayments, setShowPayments] = useState(false);
  const isPaid = summary.balance <= 0;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, marginRight: Spacing.sm }}>
          <ThemedText type="h3">{summary.worker.name}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {t.workers.dailyRate}: {t.common.currency} {summary.worker.dailyRate}
          </ThemedText>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <ThemedText
            type="h2"
            style={[styles.totalAmount, { color: theme.primary }]}
          >
            {t.common.currency} {summary.totalAmount.toFixed(0)}
          </ThemedText>
          {isPaid ? (
            <View style={[styles.paidBadge, { backgroundColor: theme.presentGreen + "25" }]}>
              <Feather name="check-circle" size={12} color={theme.presentGreen} />
              <ThemedText type="small" style={{ color: theme.presentGreen, fontWeight: "600", marginLeft: 4 }}>
                {t.payment.paid}
              </ThemedText>
            </View>
          ) : summary.totalPaid > 0 ? (
            <ThemedText type="small" style={{ color: theme.halfDayYellow }}>
              {t.payment.balance}: {t.common.currency} {summary.balance.toFixed(0)}
            </ThemedText>
          ) : null}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statPill, { backgroundColor: theme.presentGreen + "20" }]}>
            <Feather name="check-circle" size={14} color={theme.presentGreen} />
            <ThemedText type="small" style={[styles.statValue, { color: theme.presentGreen }]}>
              {summary.presentDays}
            </ThemedText>
          </View>
          <ThemedText type="small" style={[styles.statLabel, { color: theme.textSecondary }]}>
            {t.summary.totalPresent}
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statPill, { backgroundColor: theme.halfDayYellow + "20" }]}>
            <Feather name="clock" size={14} color={theme.halfDayYellow} />
            <ThemedText type="small" style={[styles.statValue, { color: theme.halfDayYellow }]}>
              {summary.halfDays}
            </ThemedText>
          </View>
          <ThemedText type="small" style={[styles.statLabel, { color: theme.textSecondary }]}>
            {t.summary.totalHalfDays}
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statPill, { backgroundColor: theme.absentRed + "20" }]}>
            <Feather name="x-circle" size={14} color={theme.absentRed} />
            <ThemedText type="small" style={[styles.statValue, { color: theme.absentRed }]}>
              {summary.absentDays}
            </ThemedText>
          </View>
          <ThemedText type="small" style={[styles.statLabel, { color: theme.textSecondary }]}>
            {t.summary.totalAbsent}
          </ThemedText>
        </View>
      </View>

      {summary.totalPaid > 0 && (
        <Pressable
          onPress={() => setShowPayments(!showPayments)}
          style={[styles.paymentSummaryRow, { borderColor: theme.border }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
            <Feather name="dollar-sign" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {t.payment.paid}: {t.common.currency} {summary.totalPaid.toFixed(0)}
            </ThemedText>
          </View>
          <Feather
            name={showPayments ? "chevron-up" : "chevron-down"}
            size={14}
            color={theme.textSecondary}
          />
        </Pressable>
      )}

      {showPayments && summary.payments.map((payment) => (
        <View
          key={payment.id}
          style={[styles.paymentRow, { backgroundColor: theme.backgroundSecondary }]}
        >
          <Feather name="check" size={14} color={theme.presentGreen} />
          <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.xs }}>
            {t.common.currency} {payment.amount.toFixed(0)}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginRight: Spacing.sm }}>
            {new Date(payment.paidAt).toLocaleDateString()}
          </ThemedText>
          <Pressable onPress={() => onDeletePayment(payment.id)}>
            <Feather name="trash-2" size={14} color={theme.error} />
          </Pressable>
        </View>
      ))}

      {!isPaid && (
        <Pressable
          onPress={() => onMarkPaid(summary)}
          style={[styles.markPaidBtn, { backgroundColor: theme.primary }]}
        >
          <Feather name="dollar-sign" size={16} color="#FFFFFF" />
          <ThemedText
            type="small"
            style={{ color: "#FFFFFF", fontWeight: "700", marginLeft: Spacing.xs }}
          >
            {t.payment.markPaid}
          </ThemedText>
        </Pressable>
      )}
    </Animated.View>
  );
}

export default function SummaryScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = insets.bottom + 60;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summaries, setSummaries] = useState<WorkerSummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [grandTotal, setGrandTotal] = useState(0);
  const [grandTotalPaid, setGrandTotalPaid] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentWorker, setPaymentWorker] = useState<WorkerSummary | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

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
    setIsLoading(true);
    try {
      const loadedWorkers = await storage.getWorkers();
      const loadedAttendance = await storage.getAttendanceForMonth(selectedYear, selectedMonth);
      const loadedPayments = await storage.getPaymentsForMonth(selectedYear, selectedMonth);

      setWorkers(loadedWorkers);
      setAttendance(loadedAttendance);

      const workerSummaries: WorkerSummary[] = loadedWorkers.map((worker) => {
        const summary = calculateWorkerSummary(worker.id, loadedAttendance, worker.dailyRate);
        const workerPayments = loadedPayments.filter((p) => p.workerId === worker.id);
        const totalPaid = workerPayments.reduce((sum, p) => sum + p.amount, 0);
        return {
          worker,
          ...summary,
          totalPaid,
          balance: Math.max(0, summary.totalAmount - totalPaid),
          payments: workerPayments,
        };
      });

      setSummaries(workerSummaries);
      setGrandTotal(workerSummaries.reduce((sum, s) => sum + s.totalAmount, 0));
      setGrandTotalPaid(workerSummaries.reduce((sum, s) => sum + s.totalPaid, 0));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaid = (summary: WorkerSummary) => {
    setPaymentWorker(summary);
    setPaymentAmount(summary.balance.toFixed(0));
    setShowPaymentModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddPayment = async () => {
    if (!paymentWorker) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t.common.error, t.attendance.invalidAmount);
      return;
    }

    const payment: PaymentRecord = {
      id: generateId(),
      workerId: paymentWorker.worker.id,
      year: selectedYear,
      month: selectedMonth,
      amount,
      paidAt: Date.now(),
    };

    await storage.addPayment(payment);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowPaymentModal(false);
    setPaymentAmount("");
    setPaymentWorker(null);
    loadSummaries();
  };

  const handleDeletePayment = async (paymentId: string) => {
    Alert.alert(t.payment.deletePayment, t.payment.deletePaymentConfirm, [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.common.delete,
        style: "destructive",
        onPress: async () => {
          await storage.deletePayment(paymentId);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          loadSummaries();
        },
      },
    ]);
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
      const html = type === "attendance" ? generateAttendanceHTML(data) : generateSummaryHTML(data);
      const filename = `${t.app.name}_${type}_${monthNames[selectedMonth]}_${selectedYear}.pdf`;
      const success = await exportToPDF(html, filename);
      if (success) Alert.alert(t.common.success, t.export.success);
    } catch {
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
      if (success) Alert.alert(t.common.success, t.export.success);
    } catch {
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
    } catch {
      Alert.alert(t.common.error, t.export.error);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const renderSummary = ({ item, index }: { item: WorkerSummary; index: number }) => (
    <SummaryCard
      summary={item}
      theme={theme}
      t={t}
      index={index}
      onMarkPaid={handleMarkPaid}
      onDeletePayment={handleDeletePayment}
    />
  );

  const renderHeader = () => {
    const grandBalance = grandTotal - grandTotalPaid;
    return (
      <View style={styles.headerContent}>
        <View style={styles.topRow}>
          <Pressable
            onPress={() => setShowMonthPicker(true)}
            style={[styles.monthSelector, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          >
            <ThemedText type="h4">
              {monthNames[selectedMonth]} {selectedYear}
            </ThemedText>
            <Feather name="chevron-down" size={18} color={theme.text} />
          </Pressable>

          <Pressable
            onPress={() => setShowExportModal(true)}
            style={[styles.exportButton, { backgroundColor: theme.primary }]}
          >
            <Feather name="share" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={[styles.grandTotalCard, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.grandTotalLabel}>{t.summary.totalAmount}</ThemedText>
          <ThemedText style={styles.grandTotalValue}>
            {t.common.currency} {grandTotal.toFixed(0)}
          </ThemedText>
          {grandTotalPaid > 0 && (
            <View style={styles.grandTotalMeta}>
              <View style={styles.grandTotalMetaItem}>
                <ThemedText style={styles.grandTotalMetaLabel}>{t.payment.paid}</ThemedText>
                <ThemedText style={styles.grandTotalMetaValue}>
                  {t.common.currency} {grandTotalPaid.toFixed(0)}
                </ThemedText>
              </View>
              <View style={[styles.grandTotalDivider]} />
              <View style={styles.grandTotalMetaItem}>
                <ThemedText style={styles.grandTotalMetaLabel}>{t.payment.due}</ThemedText>
                <ThemedText style={styles.grandTotalMetaValue}>
                  {t.common.currency} {Math.max(0, grandBalance).toFixed(0)}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={[styles.emptyContainer, { paddingTop: Spacing["4xl"] }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Feather name="bar-chart-2" size={64} color={theme.textSecondary} style={styles.emptyIcon} />
        <ThemedText type="h3" style={styles.emptyTitle}>
          {t.summary.noData}
        </ThemedText>
      </View>
    );
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

  const renderPaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPaymentModal(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowPaymentModal(false)}
      >
        <Pressable
          style={[styles.paymentModalContainer, { backgroundColor: theme.backgroundDefault }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ThemedText type="h3" style={styles.paymentModalTitle}>
            {t.payment.addPayment}
          </ThemedText>
          {paymentWorker ? (
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginBottom: Spacing.lg }}>
              {paymentWorker.worker.name} — {t.payment.balance}: {t.common.currency} {paymentWorker.balance.toFixed(0)}
            </ThemedText>
          ) : null}

          <View style={[styles.paymentInputRow, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="h3" style={{ color: theme.textSecondary }}>{t.common.currency}</ThemedText>
            <TextInput
              style={[styles.paymentInput, { color: theme.text }]}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
              placeholder={t.payment.enterAmount}
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />
          </View>

          {paymentWorker && paymentWorker.balance > 0 && (
            <Pressable
              onPress={() => setPaymentAmount(paymentWorker.balance.toFixed(0))}
              style={[styles.fullAmountBtn, { borderColor: theme.primary + "60" }]}
            >
              <ThemedText type="small" style={{ color: theme.primary }}>
                {t.payment.fullAmount}: {t.common.currency} {paymentWorker.balance.toFixed(0)}
              </ThemedText>
            </Pressable>
          )}

          <View style={styles.paymentModalActions}>
            <Pressable
              onPress={() => setShowPaymentModal(false)}
              style={[styles.paymentCancelBtn, { borderColor: theme.border }]}
            >
              <ThemedText type="body" style={{ color: theme.textSecondary }}>{t.common.cancel}</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleAddPayment}
              style={[styles.paymentSaveBtn, { backgroundColor: theme.primary }]}
            >
              <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "700" }}>
                {t.common.save}
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
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
      <Pressable style={styles.modalOverlay} onPress={() => !isExporting && setShowExportModal(false)}>
        <View style={[styles.exportModalContainer, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h3" style={styles.exportModalTitle}>{t.export.title}</ThemedText>

          {isExporting ? (
            <View style={styles.exportingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText type="body" style={styles.exportingText}>{t.export.generating}</ThemedText>
            </View>
          ) : (
            <View style={styles.exportOptions}>
              <Pressable
                onPress={() => handleExportPDF("attendance")}
                style={[styles.exportOption, { backgroundColor: theme.backgroundSecondary }]}
              >
                <View style={[styles.exportIconContainer, { backgroundColor: theme.error + "20" }]}>
                  <Feather name="file-text" size={24} color={theme.error} />
                </View>
                <View style={styles.exportOptionText}>
                  <ThemedText type="h4">{t.export.attendanceReport}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>{t.export.pdf}</ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>

              <Pressable
                onPress={() => handleExportPDF("summary")}
                style={[styles.exportOption, { backgroundColor: theme.backgroundSecondary }]}
              >
                <View style={[styles.exportIconContainer, { backgroundColor: theme.primary + "20" }]}>
                  <Feather name="bar-chart-2" size={24} color={theme.primary} />
                </View>
                <View style={styles.exportOptionText}>
                  <ThemedText type="h4">{t.export.summaryReport}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>{t.export.pdf}</ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>

              <Pressable
                onPress={handleExportCSV}
                style={[styles.exportOption, { backgroundColor: theme.backgroundSecondary }]}
              >
                <View style={[styles.exportIconContainer, { backgroundColor: theme.presentGreen + "20" }]}>
                  <Feather name="file" size={24} color={theme.presentGreen} />
                </View>
                <View style={styles.exportOptionText}>
                  <ThemedText type="h4">{t.export.csv}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>{t.export.spreadsheet}</ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>

              <Pressable
                onPress={handlePrint}
                style={[styles.exportOption, { backgroundColor: theme.backgroundSecondary }]}
              >
                <View style={[styles.exportIconContainer, { backgroundColor: theme.info + "20" }]}>
                  <Feather name="printer" size={24} color={theme.info} />
                </View>
                <View style={styles.exportOptionText}>
                  <ThemedText type="h4">{t.export.print}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>{t.export.attendanceReport}</ThemedText>
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
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadSummaries}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {renderMonthPicker()}
      {renderPaymentModal()}
      {renderExportModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg },
  headerContent: { marginBottom: Spacing.lg },
  topRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.lg },
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
  grandTotalLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: Spacing.xs },
  grandTotalValue: { color: "#FFFFFF", fontSize: 32, fontWeight: "700" },
  grandTotalMeta: {
    flexDirection: "row",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  grandTotalMetaItem: { alignItems: "center" },
  grandTotalMetaLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginBottom: 2 },
  grandTotalMetaValue: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  grandTotalDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.3)" },
  summaryCard: { borderRadius: BorderRadius.sm, padding: Spacing.lg },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  totalAmount: { fontWeight: "700" },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  statItem: { alignItems: "center" },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    marginBottom: Spacing.xs,
  },
  statValue: { fontWeight: "600" },
  statLabel: { fontSize: 11 },
  paymentSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    marginTop: Spacing.xs,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.xs,
  },
  markPaidBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  separator: { height: Spacing.sm },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Spacing["5xl"],
  },
  emptyIcon: { marginBottom: Spacing.lg, opacity: 0.5 },
  emptyTitle: { textAlign: "center" },
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
  yearArrow: { padding: Spacing.sm },
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
  paymentModalContainer: {
    width: "90%",
    maxWidth: 360,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
  },
  paymentModalTitle: { textAlign: "center", marginBottom: Spacing.sm },
  paymentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  paymentInput: { flex: 1, fontSize: 28, fontWeight: "700" },
  fullAmountBtn: {
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  paymentModalActions: { flexDirection: "row", gap: Spacing.md },
  paymentCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  paymentSaveBtn: {
    flex: 1,
    borderRadius: BorderRadius.xs,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  exportModalContainer: {
    width: "90%",
    maxWidth: 360,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  exportModalTitle: { textAlign: "center", marginBottom: Spacing.lg },
  exportingContainer: { alignItems: "center", paddingVertical: Spacing["3xl"] },
  exportingText: { marginTop: Spacing.lg },
  exportOptions: { gap: Spacing.sm },
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
  exportOptionText: { flex: 1 },
});
