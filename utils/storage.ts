import AsyncStorage from '@react-native-async-storage/async-storage';
import { MonthlyBudget } from '@/types';

const MONTHLY_TARGET_KEY = 'monthly_target';
const CURRENT_MONTH_KEY = 'current_month';

export const storage = {
  async getMonthlyTarget(): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(MONTHLY_TARGET_KEY);
      return value ? parseFloat(value) : 30000; // デフォルト30,000円
    } catch (error) {
      console.error('Error getting monthly target:', error);
      return 30000;
    }
  },

  async setMonthlyTarget(amount: number): Promise<void> {
    try {
      await AsyncStorage.setItem(MONTHLY_TARGET_KEY, amount.toString());
    } catch (error) {
      console.error('Error setting monthly target:', error);
    }
  },

  async getCurrentMonth(): Promise<MonthlyBudget | null> {
    try {
      const value = await AsyncStorage.getItem(CURRENT_MONTH_KEY);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting current month:', error);
      return null;
    }
  },

  async setCurrentMonth(monthData: MonthlyBudget): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_MONTH_KEY, JSON.stringify(monthData));
    } catch (error) {
      console.error('Error setting current month:', error);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([MONTHLY_TARGET_KEY, CURRENT_MONTH_KEY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};