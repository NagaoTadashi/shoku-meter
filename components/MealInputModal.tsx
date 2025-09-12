import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (visible) {
      setAmount(editingMeal ? editingMeal.amount.toString() : '');
    }
  }, [visible, editingMeal]);

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert(t.error, t.invalidAmount);
      return;
    }

    if (numericAmount > 500) {
      Alert.alert(t.error, t.amountTooLarge);
      return;
    }

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
        case 'breakfast': return t.editBreakfast;
        case 'lunch': return t.editLunch;
        case 'dinner': return t.editDinner;
        default: return '';
      }
    } else {
      switch (mealType) {
        case 'breakfast': return t.addBreakfast;
        case 'lunch': return t.addLunch;
        case 'dinner': return t.addDinner;
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
              <Text style={styles.label}>{t.amount}</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
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
                <Text style={styles.cancelButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {editingMeal ? t.update : t.add}
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