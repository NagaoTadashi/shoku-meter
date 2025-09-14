import { useFoodBudget } from '@/contexts/FoodBudgetContext';
import React, { useMemo } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ReportScreen() {
  const { monthlyTarget, currentMonth } = useFoodBudget();

  const { daysInMonth, currentDay, dailySeries, remainingDays, totalSpent, displayPct, barPct, isOver, monthLabel } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const days = new Date(y, m + 1, 0).getDate();

    // Build daily series and sum monthly total
    const series: number[] = [];
    let total = 0;
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, m, d);
      const key = date.toISOString().split('T')[0];
      const daily = currentMonth.dailyBudgets[key]?.totalSpent ?? 0;
      series.push(daily);
      total += daily;
    }

    const today = now.getDate();
    const remaining = Math.max(0, days - today + 1);
    const pct = monthlyTarget > 0 ? (total / monthlyTarget) * 100 : 0;

    return {
      daysInMonth: days,
      currentDay: today,
      dailySeries: series,
      remainingDays: remaining,
      totalSpent: total,
      displayPct: pct, // can exceed 100
      barPct: Math.max(0, Math.min(pct, 100)), // clamp for bar width
      isOver: total > monthlyTarget,
      monthLabel: `${y}年${m + 1}月`,
    };
  }, [currentMonth, monthlyTarget]);

  const progressColor = isOver ? '#FF3B30' : '#34C759';
  // Bar chart sizing
  const barWidth = 14;
  const barGap = 8;
  const chartHeight = 160;
  const chartPadding = 16;
  const yAxisWidth = 44; // space for y-axis labels
  const contentWidth = daysInMonth * (barWidth + barGap) + chartPadding * 2 + yAxisWidth;
  const maxValue = Math.max(1, ...dailySeries);
  const xStart = chartPadding + yAxisWidth;
  const svgWidth = Math.max(contentWidth - 32, width - 72);
  const xEnd = svgWidth - chartPadding;

  // Build nice y-axis ticks
  const ticks = (() => {
    const count = 4;
    const raw = maxValue / count;
    const p = Math.pow(10, Math.floor(Math.log10(raw || 1)));
    const d = raw / p;
    const f = d <= 1 ? 1 : d <= 2 ? 2 : d <= 5 ? 5 : 10;
    const step = f * p;
    const values: number[] = [];
    for (let v = 0; v <= maxValue; v += step) values.push(Math.round(v));
    if (values[values.length - 1] !== maxValue) values.push(maxValue);
    return values;
  })();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TrendingUp size={32} color="#34C759" />
            <Text style={[styles.title, { marginLeft: 8 }]}>レポート</Text>
          </View>
          <Text style={styles.subtitle}>{monthLabel}の支出をビジュアルで確認</Text>
        </View>

        {/* Simple summary with progress bar and three stats */}
        <View style={styles.summaryCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.statLabel}>進捗</Text>
            <Text style={[styles.statValue, { color: progressColor }]}>
              {displayPct.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${barPct}%`, backgroundColor: progressColor }]} />
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>今月使った金額</Text>
            <Text style={styles.statValue}>¥{totalSpent.toLocaleString()}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>目標金額</Text>
            <Text style={styles.statValue}>¥{monthlyTarget.toLocaleString()}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>残り日数</Text>
            <Text style={styles.statValue}>{remainingDays} 日</Text>
          </View>
        </View>

        {/* 日別支出グラフ（簡易） */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>日別支出（今月）</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.chartCard, { width: Math.max(contentWidth, width - 40) }]}> 
              <Svg width={svgWidth} height={chartHeight + chartPadding * 2}>
                {/* Y-axis ticks and labels */}
                {ticks.map((v, i) => {
                  const y = chartPadding + (chartHeight - (v / maxValue) * chartHeight);
                  return (
                    <>
                      <Line
                        key={`ytick-${i}`}
                        x1={xStart - 4}
                        y1={y}
                        x2={xStart}
                        y2={y}
                        stroke="#D1D5DB"
                        strokeWidth={1}
                      />
                      {/* Horizontal grid line */}
                      <Line
                        key={`ygrid-${i}`}
                        x1={xStart}
                        y1={y}
                        x2={xEnd}
                        y2={y}
                        stroke="#F2F2F7"
                        strokeWidth={1}
                      />
                      <SvgText
                        key={`ylabel-${i}`}
                        x={xStart - 8}
                        y={y + 4}
                        fontSize={10}
                        fill="#86868B"
                        textAnchor="end"
                      >
                        {`¥${v.toLocaleString()}`}
                      </SvgText>
                    </>
                  );
                })}

                {/* Bars */}
                {dailySeries.map((v, idx) => {
                  const h = (v / maxValue) * chartHeight;
                  const x = xStart + idx * (barWidth + barGap);
                  const y = chartPadding + (chartHeight - h);
                  return (
                    <Rect
                      key={`bar-${idx}`}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(2, h)}
                      rx={6}
                      fill={'#34C759'}
                    />
                  );
                })}
              </Svg>
              <View style={styles.xLabelsRow}>
                {dailySeries.map((_, idx) => (
                  <View key={`xl-${idx}`} style={{ width: barWidth + barGap, alignItems: 'center' }}>
                    {(idx + 1) % 5 === 0 || idx === 0 ? (
                      <Text style={styles.xLabel}>{idx + 1}</Text>
                    ) : (
                      <Text style={styles.xLabelSpacer}> </Text>
                    )}
                  </View>
                ))}
              </View>
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
    paddingHorizontal: 20,
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
  summaryCard: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EEF2EF',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F2F2F7',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statLabel: {
    fontSize: 15,
    color: '#86868B',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EEF2EF',
  },
  xLabelsRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 16,
  },
  xLabel: {
    fontSize: 10,
    color: '#86868B',
  },
  xLabelSpacer: {
    fontSize: 10,
    color: 'transparent',
  },
  bottomSpacer: {
    height: 32,
  },
});
