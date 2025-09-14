import { MealEntry } from '@/types';
import { Coffee, Moon, Pen, Sun, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MealCardProps {
  meal: MealEntry;
  onEdit: (meal: MealEntry) => void;
  onDelete: (id: string) => void;
}

const getMealName = (type: MealEntry['type']) => {
  return type;
};

const getMealIcon = (type: MealEntry['type']) => {
  switch (type) {
    case 'breakfast': return <Coffee size={20} color="#D2691E" />;
    case 'lunch': return <Sun size={20} color="#FF8C00" />;
    case 'dinner': return <Moon size={20} color="#6A5ACD" />;
    default: return <Coffee size={20} color="#34C759" />;
  }
};

export default function MealCard({ meal, onEdit, onDelete }: MealCardProps) {

  const getMealDisplayName = (type: MealEntry['type']) => {
    switch (type) {
      case 'breakfast': return '朝食';
      case 'lunch': return '昼食';
      case 'dinner': return '夕食';
      default: return '';
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '食事を削除',
      'この食事の記録を削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '削除', style: 'destructive', onPress: () => onDelete(meal.id) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getMealIcon(meal.type)}
        </View>
        <View style={styles.info}>
          <Text style={styles.mealName}>{getMealDisplayName(meal.type)}</Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.amount}>¥{meal.amount.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(meal)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Pen size={18} color="#34C759" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDelete}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Trash2 size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EEF2EF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  mealName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  // removed time style (time not displayed)
  rightSection: {
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
