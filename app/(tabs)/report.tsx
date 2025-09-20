import CircularProgress from '@/components/CircularProgress';
import { useFoodBudget } from '@/contexts/FoodBudgetContext';
import { BarChartBig, Wallet } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function ReportScreen() {
  const { monthlyTarget, currentMonth } = useFoodBudget();

  const {
    remainingDays,
    totalSpent,
    progressValue,
    monthLabel,
    remainingBalance,
    dailyAllowance,
    daysInMonth,
    dailyStacks,
    maxDailyTotal,
  } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const days = new Date(y, m + 1, 0).getDate();

    // Use aggregated month total when available
    const total = currentMonth?.totalSpent ?? 0;

    const today = now.getDate();
    const remaining = Math.max(0, days - today + 1);
    const ratio = monthlyTarget > 0 ? total / monthlyTarget : 0;
    const clampedProgress = monthlyTarget > 0 ? Math.min(Math.max(ratio, 0), 1) : 0;
    const balance = monthlyTarget - total;
    const remainingForMonth = Math.max(0, balance);
    const perDay = remaining > 0 ? remainingForMonth / remaining : 0;

    const dayStacks: Array<{ day: number; breakfast: number; lunch: number; dinner: number; total: number }> = [];
    let maxTotal = 0;
    for (let d = 1; d <= days; d++) {
      const isoDate = new Date(y, m, d).toISOString().split('T')[0];
      const daily = currentMonth?.dailyBudgets?.[isoDate];
      let breakfast = 0;
      let lunch = 0;
      let dinner = 0;
      daily?.meals?.forEach(meal => {
        if (meal.type === 'breakfast') breakfast += meal.amount;
        if (meal.type === 'lunch') lunch += meal.amount;
        if (meal.type === 'dinner') dinner += meal.amount;
      });
      const totalForDay = breakfast + lunch + dinner;
      maxTotal = Math.max(maxTotal, totalForDay);
      dayStacks.push({ day: d, breakfast, lunch, dinner, total: totalForDay });
    }

    return {
      remainingDays: remaining,
      totalSpent: total,
      progressValue: clampedProgress,
      monthLabel: `${y}年${m + 1}月`,
      remainingBalance: balance,
      dailyAllowance: perDay,
      daysInMonth: days,
      dailyStacks: dayStacks,
      maxDailyTotal: maxTotal,
    };
  }, [currentMonth, monthlyTarget]);

  const status = useMemo(() => {
    if (remainingBalance < 0) return 'over';
    const ratio = monthlyTarget > 0 ? remainingBalance / monthlyTarget : 0;
    if (ratio > 0.5) return 'excellent';
    if (ratio > 0) return 'good';
    return 'over';
  }, [remainingBalance, monthlyTarget]);

  const statusBg = status === 'over' ? '#FEEAEA' : '#E8F5E8';
  const progressColor = status === 'over' ? '#FF3B30' : '#34C759';
  const dailyAllowanceDisplay = Math.max(0, Math.floor(dailyAllowance));
  const centerAmount = Math.max(0, Math.floor(Math.abs(remainingBalance)));
  const centerLabel = remainingBalance >= 0 ? '残り' : '超過';
  const chartHeight = 220;
  const barWidth = 18;
  const barGap = 12;
  const chartPadding = 24;
  const yAxisWidth = 56;
  const svgWidth = Math.max(daysInMonth * (barWidth + barGap) + chartPadding * 2 + yAxisWidth, width - 48);
  const axisX = chartPadding + yAxisWidth;
  const chartRight = svgWidth - chartPadding;
  const maxValue = Math.max(maxDailyTotal, 1);
  const ticks = useMemo(() => {
    const tickCount = 4;
    const step = maxValue / tickCount;
    if (step === 0) return [0];
    const magnitude = Math.pow(10, Math.floor(Math.log10(step)));
    const normalized = step / magnitude;
    const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    const niceStep = niceNormalized * magnitude;
    const values: number[] = [];
    for (let v = 0; v <= maxValue; v += niceStep) {
      values.push(Math.round(v));
    }
    if (values[values.length - 1] !== Math.round(maxValue)) {
      values.push(Math.round(maxValue));
    }
    return values;
  }, [maxValue]);

  const mealSegments = [
    { key: 'breakfast' as const, color: '#F59E0B', label: '朝食' },
    { key: 'lunch' as const, color: '#34C759', label: '昼食' },
    { key: 'dinner' as const, color: '#6366F1', label: '夕食' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <BarChartBig size={32} color="#34C759" />
            <Text style={[styles.title, { marginLeft: 8 }]}>レポート</Text>
          </View>
          <Text style={styles.subtitle}>{monthLabel}の支出をビジュアルで確認</Text>
        </View>

        {/* Summary with circular progress and key stats */}
        <View style={styles.budgetSection}>
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Wallet size={20} color="#34C759" />
                <Text style={[styles.budgetTitle, { marginLeft: 8 }]}>今月の食費</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                <Text style={styles.statusPillDate}>{monthLabel}</Text>
              </View>
            </View>

            <View style={styles.circularProgressContainer}>
              <CircularProgress
                size={180}
                strokeWidth={8}
                progress={progressValue}
                color={progressColor}
                backgroundColor="#F2F2F7"
              >
                <View style={styles.budgetCenter}>
                  <Text style={styles.budgetAmount}>¥{centerAmount.toLocaleString()}</Text>
                  <Text style={styles.budgetLabel}>{centerLabel}</Text>
                </View>
              </CircularProgress>
            </View>

            <View style={styles.sectionDivider} />

            <View style={styles.miniCardsRow}>
              <View style={[styles.miniCard, styles.miniCardCenter, status === 'over' && styles.miniCardOver]}>
                <Text style={[styles.miniCardLabel, styles.centerText]}>使用済み</Text>
                <Text
                  style={[
                    styles.miniCardValue,
                    styles.centerText,
                    status === 'over' && styles.miniCardValueOver,
                  ]}
                >
                  ¥{totalSpent.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.miniCard, styles.miniCardCenter]}>
                <Text style={[styles.miniCardLabel, styles.centerText]}>使える金額</Text>
                <Text style={[styles.miniCardValue, styles.centerText]}>¥{monthlyTarget.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.remainingCard}>
          <View style={styles.remainingColumn}>
            <Text style={styles.remainingLabel}>残り日数</Text>
            <Text style={styles.remainingValue}>{remainingDays}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.remainingColumn}>
            <Text style={styles.remainingLabel}>1日あたりの食費目安</Text>
            <Text style={styles.remainingValue}>¥{dailyAllowanceDisplay.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>日別の支出内訳</Text>
            <View style={styles.legendRow}>
              {mealSegments.map(segment => (
                <View key={segment.key} style={styles.legendItem}>
                  <View style={[styles.legendSwatch, { backgroundColor: segment.color }]} />
                  <Text style={styles.legendLabel}>{segment.label}</Text>
                </View>
              ))}
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.chartCard, { width: Math.max(svgWidth + 16, width - 48) }]}>
              <Svg width={svgWidth} height={chartHeight + chartPadding * 2}>
                {ticks.map((v, idx) => {
                  const y = chartPadding + chartHeight - (v / maxValue) * chartHeight;
                  return (
                    <React.Fragment key={`tick-${idx}`}>
                      <Line
                        x1={axisX}
                        y1={y}
                        x2={chartRight}
                        y2={y}
                        stroke="#F2F2F7"
                        strokeWidth={1}
                      />
                      <SvgText
                        x={axisX - 12}
                        y={y}
                        fontSize={10}
                        fill="#86868B"
                        textAnchor="end"
                        alignmentBaseline="central"
                      >
                        {`¥${v.toLocaleString()}`}
                      </SvgText>
                    </React.Fragment>
                  );
                })}

                {dailyStacks.map((stack, idx) => {
                  const x = axisX + idx * (barWidth + barGap);
                  let currentY = chartPadding + chartHeight;
                  return mealSegments.map(segment => {
                    const value = stack[segment.key];
                    if (value <= 0) return null;
                    const barHeight = (value / maxValue) * chartHeight;
                    currentY -= barHeight;
                    return (
                      <Rect
                        key={`${segment.key}-${idx}`}
                        x={x}
                        y={currentY}
                        width={barWidth}
                        height={Math.max(barHeight, 1)}
                        rx={4}
                        fill={segment.color}
                      />
                    );
                  });
                })}

                {dailyStacks.map((stack, idx) => {
                  const x = axisX + idx * (barWidth + barGap) + barWidth / 2;
                  return (
                    <SvgText
                      key={`xlabel-${idx}`}
                      x={x}
                      y={chartPadding + chartHeight + 16}
                      fontSize={10}
                      fill="#86868B"
                      textAnchor="middle"
                    >
                      {stack.day}
                    </SvgText>
                  );
                })}
              </Svg>
            </View>
          </ScrollView>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#86868B',
    fontWeight: '500',
  },
  budgetSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  budgetCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EEF2EF',
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  budgetTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  statusPill: {
    paddingHorizontal: 10,
    minHeight: 22,
    paddingVertical: 6,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillDate: {
    marginTop: 2,
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  budgetCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetAmount: {
    fontSize: 38,
    fontWeight: '700',
    color: '#34C759',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginBottom: 16,
  },
  miniCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  miniCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EEF2EF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  miniCardCenter: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  miniCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
    marginBottom: 6,
  },
  miniCardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  miniCardOver: {
    borderColor: '#FFCDD2',
    backgroundColor: '#FFF5F5',
  },
  miniCardValueOver: {
    color: '#FF3B30',
  },
  chartSection: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EEF2EF',
  },
  remainingCard: {
    marginTop: 16,
    marginHorizontal: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EEF2EF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remainingColumn: {
    flex: 1,
    alignItems: 'center',
  },
  remainingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#86868B',
  },
  remainingValue: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.5,
  },
  remainingUnit: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#86868B',
  },
  remainingHint: {
    marginTop: 4,
    fontSize: 12,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#F1F1F5',
    marginHorizontal: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});
