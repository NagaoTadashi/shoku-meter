import CircularProgress from '@/components/CircularProgress';
import MealCard from '@/components/MealCard';
import MealInputModal from '@/components/MealInputModal';
import { useFoodBudget } from '@/contexts/FoodBudgetContext';
import { MealEntry } from '@/types';
import { Coffee, Moon, Plus, Sun, Utensils, Wallet } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';


const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const {
    monthlyTarget,
    dailyBudgetAmount,
    todaySpent,
    todayRemaining,
    daysRemaining,
    currentMonth,
    addMealEntry,
    updateMealEntry,
    deleteMealEntry,
    getTodayMeals,
  } = useFoodBudget();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealEntry['type']>('breakfast');
  const [editingMeal, setEditingMeal] = useState<MealEntry | undefined>();
  const [refreshing, setRefreshing] = useState(false);

  const todayMeals = getTodayMeals();
  const totalSpent = currentMonth.totalSpent;
  const remainingBudget = monthlyTarget - totalSpent;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleAddMeal = (mealType: MealEntry['type']) => {
    setSelectedMealType(mealType);
    setEditingMeal(undefined);
    setModalVisible(true);
  };

  const handleEditMeal = (meal: MealEntry) => {
    setSelectedMealType(meal.type);
    setEditingMeal(meal);
    setModalVisible(true);
  };

  const handleMealSubmit = (amount: number) => {
    if (editingMeal) {
      updateMealEntry(editingMeal.id, amount);
    } else {
      addMealEntry({ type: selectedMealType, amount });
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const getProgressPercentage = () => {
    return Math.min((todaySpent / dailyBudgetAmount) * 100, 100);
  };

  const getCircularProgress = () => {
    if (dailyBudgetAmount === 0) {
      return todaySpent > 0 ? 1 : 0;
    }
    const progress = todaySpent / dailyBudgetAmount;
    return Math.min(Math.max(progress, 0), 1);
  };

  const getBudgetStatus = () => {
    if (todayRemaining > dailyBudgetAmount * 0.5) return 'excellent';
    if (todayRemaining > 0) return 'good';
    return 'over';
  };

  // Header status pill appearance
  const status = getBudgetStatus();
  const statusLabel = status === 'over' ? '超過' : status === 'good' ? '余裕あり' : '絶好調';
  const statusBg = status === 'over' ? '#FEEAEA' : '#E8F5E8';
  const statusFg = status === 'over' ? '#FF3B30' : '#34C759';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      >
        {/* Header (date pill removed) */}
        <View style={styles.header}>
          <View style={styles.headerContent} />
        </View>

        {/* Main Budget Card */}
        <View style={styles.budgetSection}>
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Wallet size={20} color="#34C759" />
                <Text style={[styles.budgetTitle, { marginLeft: 8 }]}>今日の食費</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                <Text style={styles.statusPillDate}>{getCurrentDate()}</Text>
              </View>
            </View>

            {/* サマリー見出しは非表示 */}
            <View style={styles.circularProgressContainer}>
              <CircularProgress
                size={180}
                strokeWidth={8}
                progress={getCircularProgress()}
                color={getBudgetStatus() === 'over' ? '#FF3B30' : '#34C759'}
                backgroundColor="#F2F2F7"
              >
                <View style={styles.budgetCenter}>
                  <Text style={styles.budgetAmount}>
                    ¥{Math.abs(todayRemaining).toLocaleString()}
                  </Text>
                  <Text style={styles.budgetLabel}>
                    {todayRemaining >= 0 ? '残り' : '超過'}
                  </Text>
                </View>
              </CircularProgress>
            </View>

            <View style={styles.sectionDivider} />

            {/* 内訳（横並びで個別枠表示） */}
            <View style={styles.miniCardsRow}>
              <View style={[styles.miniCard, styles.miniCardCenter, status === 'over' && { borderColor: '#FFCDD2', backgroundColor: '#FFF5F5' }]}>
                <Text style={[styles.miniCardLabel, styles.centerText]}>使用済み</Text>
                <Text style={[styles.miniCardValue, styles.centerText, { color: status === 'over' ? '#FF3B30' : '#1D1D1F' }]}>¥{todaySpent.toLocaleString()}</Text>
              </View>
              <View style={[styles.miniCard, styles.miniCardCenter]}>
                <Text style={[styles.miniCardLabel, styles.centerText]}>使える金額</Text>
                <Text style={[styles.miniCardValue, styles.centerText]}>¥{dailyBudgetAmount.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>


        {/* Add Meal Section */}
        <View style={styles.mealSection}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Plus size={20} color="#34C759" />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>食事を追加</Text>
            </View>
            <Text style={styles.sectionSubtitle}>日々の支出を記録しましょう</Text>
          </View>

          <View style={styles.mealGrid}>
            <TouchableOpacity
              style={styles.mealButton}
              onPress={() => handleAddMeal('breakfast')}
              activeOpacity={0.6}
            >
              <View style={[styles.mealIconContainer, { backgroundColor: '#FFE5B4' }]}>
                <Coffee size={28} color="#D2691E" />
              </View>
              <Text style={styles.mealButtonText}>朝食</Text>
              <View style={styles.addButton}>
                <Plus size={16} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mealButton}
              onPress={() => handleAddMeal('lunch')}
              activeOpacity={0.6}
            >
              <View style={[styles.mealIconContainer, { backgroundColor: '#FFD700' }]}>
                <Sun size={28} color="#FF8C00" />
              </View>
              <Text style={styles.mealButtonText}>昼食</Text>
              <View style={styles.addButton}>
                <Plus size={16} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mealButton}
              onPress={() => handleAddMeal('dinner')}
              activeOpacity={0.6}
            >
              <View style={[styles.mealIconContainer, { backgroundColor: '#E6E6FA' }]}>
                <Moon size={28} color="#6A5ACD" />
              </View>
              <Text style={styles.mealButtonText}>夕食</Text>
              <View style={styles.addButton}>
                <Plus size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Meals */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Utensils size={20} color="#34C759" />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>今日の食事</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>すべて見る</Text>
            </TouchableOpacity>
          </View>

          {todayMeals.length > 0 ? (
            <View style={styles.mealsContainer}>
              {todayMeals.slice(0, 3).map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onEdit={handleEditMeal}
                  onDelete={deleteMealEntry}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Utensils size={32} color="#34C759" />
              </View>
              <Text style={styles.emptyTitle}>まだ食事がありません</Text>
              <Text style={styles.emptySubtitle}>日々の食費の記録を始めましょう</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <MealInputModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        mealType={selectedMealType}
        editingMeal={editingMeal}
        onSubmit={handleMealSubmit}
      />
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
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  appBranding: {
    alignItems: 'flex-start',
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#34C759',
    letterSpacing: -0.5,
  },
  datePill: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#EEF2EF',
  },
  datePillText: {
    fontSize: 13,
    color: '#1D1D1F',
    fontWeight: '600',
  },
  budgetSection: {
    paddingHorizontal: 24,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusPill: {
    paddingHorizontal: 10,
    minHeight: 22,
    paddingVertical: 6,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusPillDate: {
    marginTop: 2,
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  budgetTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  budgetBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
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
  budgetStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF2EF',
  },
  budgetStat: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: '#F5FAF5',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  budgetStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  budgetStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  budgetStatDivider: {
    width: 0,
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EEF2EF',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#86868B',
    fontWeight: '500',
  },
  mealSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#86868B',
    fontWeight: '500',
  },
  mealGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  mealButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
  },
  mealIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mealEmoji: {
    fontSize: 24,
  },
  mealButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  seeAllText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  mealsContainer: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#86868B',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 32,
  },
});
