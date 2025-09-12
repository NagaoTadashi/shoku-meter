import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'ja';

interface Translations {
  // Common
  home: string;
  settings: string;
  cancel: string;
  save: string;
  edit: string;
  update: string;
  delete: string;
  confirm: string;
  error: string;
  success: string;
  
  // Home Screen
  goodMorning: string;
  todaysBudget: string;
  available: string;
  spent: string;
  left: string;
  over: string;
  monthlySpent: string;
  daysLeft: string;
  addMeal: string;
  trackExpenses: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  todaysMeals: string;
  seeAll: string;
  noMealsYet: string;
  startTracking: string;
  
  // Settings Screen
  monthlyTarget: string;
  targetAmount: string;
  monthlyStatistics: string;
  progress: string;
  dailyAverage: string;
  daysElapsed: string;
  dataManagement: string;
  resetAllData: string;
  language: string;
  
  // Meal Input
  addBreakfast: string;
  addLunch: string;
  addDinner: string;
  editBreakfast: string;
  editLunch: string;
  editDinner: string;
  amount: string;
  add: string;
  
  // Meal Card
  deleteMeal: string;
  deleteMealConfirm: string;
  
  // Alerts
  invalidAmount: string;
  amountTooLarge: string;
  targetUpdated: string;
  resetDataTitle: string;
  resetDataMessage: string;
  reset: string;
  resetComplete: string;
  resetCompleteMessage: string;
  resetError: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Common
    home: 'Home',
    settings: 'Settings',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    update: 'Update',
    delete: 'Delete',
    confirm: 'Confirm',
    error: 'Error',
    success: 'Success',
    
    // Home Screen
    goodMorning: 'Good Morning',
    todaysBudget: "Today's Budget",
    available: 'Available',
    spent: 'Spent',
    left: 'Left',
    over: 'Over',
    monthlySpent: 'Monthly Spent',
    daysLeft: 'Days Left',
    addMeal: 'Add Meal',
    trackExpenses: 'Track your daily expenses',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    todaysMeals: "Today's Meals",
    seeAll: 'See All',
    noMealsYet: 'No meals yet',
    startTracking: 'Start tracking your daily food expenses',
    
    // Settings Screen
    monthlyTarget: 'Monthly Target',
    targetAmount: 'Target Amount',
    monthlyStatistics: 'Monthly Statistics',
    progress: 'Progress',
    dailyAverage: 'Daily Average',
    daysElapsed: 'Days Elapsed',
    dataManagement: 'Data Management',
    resetAllData: 'Reset All Data',
    language: 'Language',
    
    // Meal Input
    addBreakfast: 'Add Breakfast',
    addLunch: 'Add Lunch',
    addDinner: 'Add Dinner',
    editBreakfast: 'Edit Breakfast',
    editLunch: 'Edit Lunch',
    editDinner: 'Edit Dinner',
    amount: 'Amount',
    add: 'Add',
    
    // Meal Card
    deleteMeal: 'Delete Meal',
    deleteMealConfirm: 'Are you sure you want to delete this meal entry?',
    
    // Alerts
    invalidAmount: 'Please enter a valid amount',
    amountTooLarge: 'Amount is too large (please enter $500 or less)',
    targetUpdated: 'Monthly target amount updated',
    resetDataTitle: 'Reset Data',
    resetDataMessage: 'All data will be deleted. This action cannot be undone. Are you sure?',
    reset: 'Reset',
    resetComplete: 'Complete',
    resetCompleteMessage: 'Data has been reset. Please restart the app.',
    resetError: 'Failed to reset data',
  },
  ja: {
    // Common
    home: 'ホーム',
    settings: '設定',
    cancel: 'キャンセル',
    save: '保存',
    edit: '編集',
    update: '更新',
    delete: '削除',
    confirm: '確認',
    error: 'エラー',
    success: '成功',
    
    // Home Screen
    goodMorning: 'おはようございます',
    todaysBudget: '今日の予算',
    available: '利用可能',
    spent: '使用済み',
    left: '残り',
    over: '超過',
    monthlySpent: '月間使用額',
    daysLeft: '残り日数',
    addMeal: '食事を追加',
    trackExpenses: '日々の支出を記録しましょう',
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    todaysMeals: '今日の食事',
    seeAll: 'すべて見る',
    noMealsYet: 'まだ食事がありません',
    startTracking: '日々の食費の記録を始めましょう',
    
    // Settings Screen
    monthlyTarget: '月間目標',
    targetAmount: '目標金額',
    monthlyStatistics: '月間統計',
    progress: '進捗',
    dailyAverage: '1日平均',
    daysElapsed: '経過日数',
    dataManagement: 'データ管理',
    resetAllData: 'すべてのデータをリセット',
    language: '言語',
    
    // Meal Input
    addBreakfast: '朝食を追加',
    addLunch: '昼食を追加',
    addDinner: '夕食を追加',
    editBreakfast: '朝食を編集',
    editLunch: '昼食を編集',
    editDinner: '夕食を編集',
    amount: '金額',
    add: '追加',
    
    // Meal Card
    deleteMeal: '食事を削除',
    deleteMealConfirm: 'この食事の記録を削除してもよろしいですか？',
    
    // Alerts
    invalidAmount: '有効な金額を入力してください',
    amountTooLarge: '金額が大きすぎます（500円以下で入力してください）',
    targetUpdated: '月間目標金額を更新しました',
    resetDataTitle: 'データをリセット',
    resetDataMessage: 'すべてのデータが削除されます。この操作は取り消せません。本当に実行しますか？',
    reset: 'リセット',
    resetComplete: '完了',
    resetCompleteMessage: 'データをリセットしました。アプリを再起動してください。',
    resetError: 'データのリセットに失敗しました',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'app_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ja')) {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}