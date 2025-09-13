import { MealEntry } from '@/types';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface MealInputModalProps {
  visible: boolean;
  onClose: () => void;
  mealType: MealEntry['type'];
  editingMeal?: MealEntry;
  onSubmit: (amount: number) => void;
}

const getMealName = (type: MealEntry['type']) => {
  return type;
};

export default function MealInputModal({
  visible,
  onClose,
  mealType,
  editingMeal,
  onSubmit
}: MealInputModalProps) {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (visible) {
      setAmount(editingMeal ? editingMeal.amount.toString() : '');
    }
  }, [visible, editingMeal]);

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('エラー', '有効な金額を入力してください');
      return;
    }

    // 上限なし: 500円の上限チェックを撤廃

    onSubmit(numericAmount);
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  const getMealTitle = () => {
    if (editingMeal) {
      switch (mealType) {
        case 'breakfast': return '朝食を編集';
        case 'lunch': return '昼食を編集';
        case 'dinner': return '夕食を編集';
        default: return '';
      }
    } else {
      switch (mealType) {
        case 'breakfast': return '朝食を追加';
        case 'lunch': return '昼食を追加';
        case 'dinner': return '夕食を追加';
        default: return '';
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            style={styles.modal}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={styles.title}>
                {getMealTitle()}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.label}>金額</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>¥</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  keyboardType="numeric"
                  autoFocus
                  selectTextOnFocus
                />
              </View>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {editingMeal ? '更新' : '追加'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  content: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#86868B',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#86868B',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    paddingVertical: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#86868B',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
