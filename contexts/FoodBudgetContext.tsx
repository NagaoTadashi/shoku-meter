import { FoodBudgetState, MealEntry, MonthlyBudget } from '@/types';
import { storage } from '@/utils/storage';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

interface FoodBudgetContextType extends FoodBudgetState {
  setMonthlyTarget: (amount: number) => void;
  addMealEntry: (entry: Omit<MealEntry, 'id' | 'date' | 'time'>) => void;
  updateMealEntry: (id: string, amount: number) => void;
  deleteMealEntry: (id: string) => void;
  getTodayMeals: () => MealEntry[];
}

type Action =
  | { type: 'SET_MONTHLY_TARGET'; payload: number }
  | { type: 'SET_INITIAL_DATA'; payload: { target: number; monthData: MonthlyBudget | null } }
  | { type: 'ADD_MEAL_ENTRY'; payload: MealEntry }
  | { type: 'UPDATE_MEAL_ENTRY'; payload: { id: string; amount: number } }
  | { type: 'DELETE_MEAL_ENTRY'; payload: string }
  | { type: 'RECALCULATE' };

const getCurrentMonthString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
};

const getTodayString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const getDaysRemainingInMonth = () => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return nextMonth.getDate() - now.getDate() + 1;
};

const calculateDailyBudget = (remainingBudget: number, daysRemaining: number) => {
  return daysRemaining > 0 ? Math.floor(remainingBudget / daysRemaining) : 0;
};

const initialState: FoodBudgetState = {
  monthlyTarget: 30000,
  currentMonth: {
    month: getCurrentMonthString(),
    targetAmount: 30000,
    totalSpent: 0,
    dailyBudgets: {}
  },
  dailyBudgetAmount: 0,
  todaySpent: 0,
  todayRemaining: 0,
  daysRemaining: getDaysRemainingInMonth()
};

function foodBudgetReducer(state: FoodBudgetState, action: Action): FoodBudgetState {
  switch (action.type) {
    case 'SET_INITIAL_DATA': {
      const { target, monthData } = action.payload;
      const currentMonthString = getCurrentMonthString();
      const todayString = getTodayString();
      const daysRemaining = getDaysRemainingInMonth();

      let currentMonth = monthData;
      if (!currentMonth || currentMonth.month !== currentMonthString) {
        currentMonth = {
          month: currentMonthString,
          targetAmount: target,
          totalSpent: 0,
          dailyBudgets: {}
        };
      }

      const todayBudget = currentMonth.dailyBudgets[todayString] || {
        date: todayString,
        totalSpent: 0,
        meals: []
      };

      const remainingBudget = target - currentMonth.totalSpent;
      const dailyBudgetAmount = calculateDailyBudget(remainingBudget, daysRemaining);

      return {
        ...state,
        monthlyTarget: target,
        currentMonth,
        dailyBudgetAmount,
        todaySpent: todayBudget.totalSpent,
        todayRemaining: dailyBudgetAmount - todayBudget.totalSpent,
        daysRemaining
      };
    }

    case 'SET_MONTHLY_TARGET': {
      const newTarget = action.payload;
      const updatedMonth = {
        ...state.currentMonth,
        targetAmount: newTarget
      };

      const remainingBudget = newTarget - updatedMonth.totalSpent;
      const dailyBudgetAmount = calculateDailyBudget(remainingBudget, state.daysRemaining);

      return {
        ...state,
        monthlyTarget: newTarget,
        currentMonth: updatedMonth,
        dailyBudgetAmount,
        todayRemaining: dailyBudgetAmount - state.todaySpent
      };
    }

    case 'ADD_MEAL_ENTRY': {
      const newEntry = action.payload;
      const todayString = getTodayString();
      const todayBudget = state.currentMonth.dailyBudgets[todayString] || {
        date: todayString,
        totalSpent: 0,
        meals: []
      };

      const updatedTodayBudget = {
        ...todayBudget,
        totalSpent: todayBudget.totalSpent + newEntry.amount,
        meals: [...todayBudget.meals, newEntry]
      };

      const updatedMonth = {
        ...state.currentMonth,
        totalSpent: state.currentMonth.totalSpent + newEntry.amount,
        dailyBudgets: {
          ...state.currentMonth.dailyBudgets,
          [todayString]: updatedTodayBudget
        }
      };

      const remainingBudget = state.monthlyTarget - updatedMonth.totalSpent;
      const dailyBudgetAmount = calculateDailyBudget(remainingBudget, state.daysRemaining);

      return {
        ...state,
        currentMonth: updatedMonth,
        dailyBudgetAmount,
        todaySpent: updatedTodayBudget.totalSpent,
        todayRemaining: dailyBudgetAmount - updatedTodayBudget.totalSpent
      };
    }

    case 'UPDATE_MEAL_ENTRY': {
      const { id, amount } = action.payload;
      const todayString = getTodayString();
      const todayBudget = state.currentMonth.dailyBudgets[todayString];

      if (!todayBudget) return state;

      const mealIndex = todayBudget.meals.findIndex(meal => meal.id === id);
      if (mealIndex === -1) return state;

      const oldAmount = todayBudget.meals[mealIndex].amount;
      const difference = amount - oldAmount;

      const updatedMeals = [...todayBudget.meals];
      updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], amount };

      const updatedTodayBudget = {
        ...todayBudget,
        totalSpent: todayBudget.totalSpent + difference,
        meals: updatedMeals
      };

      const updatedMonth = {
        ...state.currentMonth,
        totalSpent: state.currentMonth.totalSpent + difference,
        dailyBudgets: {
          ...state.currentMonth.dailyBudgets,
          [todayString]: updatedTodayBudget
        }
      };

      const remainingBudget = state.monthlyTarget - updatedMonth.totalSpent;
      const dailyBudgetAmount = calculateDailyBudget(remainingBudget, state.daysRemaining);

      return {
        ...state,
        currentMonth: updatedMonth,
        dailyBudgetAmount,
        todaySpent: updatedTodayBudget.totalSpent,
        todayRemaining: dailyBudgetAmount - updatedTodayBudget.totalSpent
      };
    }

    case 'DELETE_MEAL_ENTRY': {
      const id = action.payload;
      const todayString = getTodayString();
      const todayBudget = state.currentMonth.dailyBudgets[todayString];

      if (!todayBudget) return state;

      const mealToDelete = todayBudget.meals.find(meal => meal.id === id);
      if (!mealToDelete) return state;

      const updatedMeals = todayBudget.meals.filter(meal => meal.id !== id);

      const updatedTodayBudget = {
        ...todayBudget,
        totalSpent: todayBudget.totalSpent - mealToDelete.amount,
        meals: updatedMeals
      };

      const updatedMonth = {
        ...state.currentMonth,
        totalSpent: state.currentMonth.totalSpent - mealToDelete.amount,
        dailyBudgets: {
          ...state.currentMonth.dailyBudgets,
          [todayString]: updatedTodayBudget
        }
      };

      const remainingBudget = state.monthlyTarget - updatedMonth.totalSpent;
      const dailyBudgetAmount = calculateDailyBudget(remainingBudget, state.daysRemaining);

      return {
        ...state,
        currentMonth: updatedMonth,
        dailyBudgetAmount,
        todaySpent: updatedTodayBudget.totalSpent,
        todayRemaining: dailyBudgetAmount - updatedTodayBudget.totalSpent
      };
    }

    default:
      return state;
  }
}

const FoodBudgetContext = createContext<FoodBudgetContextType | undefined>(undefined);

export function FoodBudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(foodBudgetReducer, initialState);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [target, monthData] = await Promise.all([
          storage.getMonthlyTarget(),
          storage.getCurrentMonth()
        ]);

        dispatch({
          type: 'SET_INITIAL_DATA',
          payload: { target, monthData }
        });
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    // データが変更されたら保存
    if (state.monthlyTarget > 0) {
      storage.setMonthlyTarget(state.monthlyTarget);
      storage.setCurrentMonth(state.currentMonth);
    }
  }, [state.monthlyTarget, state.currentMonth]);

  const setMonthlyTarget = (amount: number) => {
    dispatch({ type: 'SET_MONTHLY_TARGET', payload: amount });
  };

  const addMealEntry = (entry: Omit<MealEntry, 'id' | 'date' | 'time'>) => {
    const now = new Date();
    const newEntry: MealEntry = {
      ...entry,
      id: Date.now().toString(),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5)
    };

    dispatch({ type: 'ADD_MEAL_ENTRY', payload: newEntry });
  };

  const updateMealEntry = (id: string, amount: number) => {
    dispatch({ type: 'UPDATE_MEAL_ENTRY', payload: { id, amount } });
  };

  const deleteMealEntry = (id: string) => {
    dispatch({ type: 'DELETE_MEAL_ENTRY', payload: id });
  };

  const getTodayMeals = (): MealEntry[] => {
    const todayString = getTodayString();
    const todayBudget = state.currentMonth.dailyBudgets[todayString];
    return todayBudget ? todayBudget.meals : [];
  };

  const contextValue: FoodBudgetContextType = {
    ...state,
    setMonthlyTarget,
    addMealEntry,
    updateMealEntry,
    deleteMealEntry,
    getTodayMeals
  };

  return (
    <FoodBudgetContext.Provider value={contextValue}>
      {children}
    </FoodBudgetContext.Provider>
  );
}

export function useFoodBudget() {
  const context = useContext(FoodBudgetContext);
  if (context === undefined) {
    throw new Error('useFoodBudget must be used within a FoodBudgetProvider');
  }
  return context;
}