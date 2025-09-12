export interface MealEntry {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  amount: number;
  date: string;
  time: string;
}

export interface DailyBudget {
  date: string;
  totalSpent: number;
  meals: MealEntry[];
}

export interface MonthlyBudget {
  month: string;
  targetAmount: number;
  totalSpent: number;
  dailyBudgets: { [date: string]: DailyBudget };
}

export interface FoodBudgetState {
  monthlyTarget: number;
  currentMonth: MonthlyBudget;
  dailyBudgetAmount: number;
  todaySpent: number;
  todayRemaining: number;
  daysRemaining: number;
}