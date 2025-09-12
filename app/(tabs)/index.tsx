import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Plus, TrendingUp, Calendar, Wallet } from 'lucide-react-native';
import { Coffee, Sun, Moon, DollarSign } from 'lucide-react-native';
import { useFoodBudget } from '@/contexts/FoodBudgetContext';
import { useLanguage } from '@/contexts/LanguageContext';
import BudgetCard from '@/components/BudgetCard';
import CircularProgress from '@/components/CircularProgress';
import MealCard from '@/components/MealCard';
import MealInputModal from '@/components/MealInputModal';
import { MealEntry } from '@/types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { t } = useLanguage();
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
    return new Date().toLocaleDateString('en-US', {
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.appBranding}>
              <View style={styles.appHeader}>
                <View style={styles.appIconContainer}>
                  <DollarSign size={28} color="#34C759" />
                </View>
                <Text style={styles.appName}>FoodMeter</Text>
              </View>
              <Text style={styles.dateText}>{getCurrentDate()}</Text>
            </View>
          </View>
        </View>

        {/* Main Budget Card */}
        <View style={styles.budgetSection}>
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetTitle}>{t.todaysBudget}</Text>
              <View style={styles.budgetBadge}>
                <Wallet size={16} color="#007AFF" />
              </View>
            </View>
            
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
                    ${Math.abs(todayRemaining).toLocaleString()}
                  </Text>
                  <Text style={styles.budgetLabel}>
                    {todayRemaining >= 0 ? t.left : t.over}
                  </Text>
                </View>
              </CircularProgress>
            </View>
            
            <View style={styles.budgetStats}>
              <View style={styles.budgetStat}>
                <Text style={styles.budgetStatValue}>${dailyBudgetAmount.toLocaleString()}</Text>
                <Text style={styles.budgetStatLabel}>{t.todaysBudget}</Text>
              </View>
              <View style={styles.budgetStatDivider} />
              <View style={styles.budgetStat}>
                <Text style={styles.budgetStatValue}>${todaySpent.toLocaleString()}</Text>
                <Text style={styles.budgetStatLabel}>{t.spent}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={20} color="#34C759" />
              </View>
              <Text style={styles.statValue}>${totalSpent.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{t.monthlySpent}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Calendar size={20} color="#34C759" />
              </View>
              <Text style={styles.statValue}>{daysRemaining}</Text>
              <Text style={styles.statLabel}>{t.daysLeft}</Text>
            </View>
          </View>
        </View>

        {/* Add Meal Section */}
        <View style={styles.mealSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.addMeal}</Text>
            <Text style={styles.sectionSubtitle}>{t.trackExpenses}</Text>
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
              <Text style={styles.mealButtonText}>{t.breakfast}</Text>
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
              <Text style={styles.mealButtonText}>{t.lunch}</Text>
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
              <Text style={styles.mealButtonText}>{t.dinner}</Text>
              <View style={styles.addButton}>
                <Plus size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Meals */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.todaysMeals}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>{t.seeAll}</Text>
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
                <Coffee size={32} color="#34C759" />
              </View>
              <Text style={styles.emptyTitle}>{t.noMealsYet}</Text>
              <Text style={styles.emptySubtitle}>{t.startTracking}</Text>
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
  appIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 17,
    color: '#86868B',
    fontWeight: '500',
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
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  budgetCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -1,
    marginBottom: 4,
  },
  budgetLabel: {
    fontSize: 15,
    color: '#86868B',
    fontWeight: '500',
  },
  budgetStats: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
  },
  budgetStat: {
    flex: 1,
    alignItems: 'center',
  },
  budgetStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  budgetStatLabel: {
    fontSize: 13,
    color: '#86868B',
    fontWeight: '500',
  },
  budgetStatDivider: {
    width: 1,
    backgroundColor: '#D1D1D6',
    marginHorizontal: 20,
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
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E8',
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