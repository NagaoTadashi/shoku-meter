import { useFoodBudget } from '@/contexts/FoodBudgetContext';
import { storage } from '@/utils/storage';
import { Database, Settings as SettingsIcon, Target, Trash2, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


export default function SettingsScreen() {
  const { monthlyTarget, setMonthlyTarget, currentMonth } = useFoodBudget();
  const [targetInput, setTargetInput] = useState(monthlyTarget.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateTarget = () => {
    const newTarget = parseFloat(targetInput);

    if (isNaN(newTarget) || newTarget <= 0) {
      Alert.alert('エラー', '有効な金額を入力してください');
      return;
    }

    if (newTarget > 1000000) {
      Alert.alert('エラー', '金額が大きすぎます');
      return;
    }

    setMonthlyTarget(newTarget);
    setIsEditing(false);
    Alert.alert('成功', '月間目標金額を更新しました');
  };

  const handleCancelEdit = () => {
    setTargetInput(monthlyTarget.toString());
    setIsEditing(false);
  };

  const handleClearData = () => {
    Alert.alert(
      'データをリセット',
      'すべてのデータが削除されます。この操作は取り消せません。本当に実行しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.clearAll();
              Alert.alert('完了', 'データをリセットしました。アプリを再起動してください。');
            } catch (error) {
              Alert.alert('エラー', 'データのリセットに失敗しました');
            }
          }
        }
      ]
    );
  };

  const getCurrentMonthStats = () => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const progressPercentage = ((currentMonth.totalSpent / monthlyTarget) * 100).toFixed(1);

    return {
      daysInMonth,
      currentDay,
      progressPercentage,
      dailyAverage: Math.round(currentMonth.totalSpent / currentDay),
    };
  };

  const stats = getCurrentMonthStats();
  const progressPct = Math.min(parseFloat(stats.progressPercentage), 100);
  const isOver = parseFloat(stats.progressPercentage) > 100;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <SettingsIcon size={32} color="#34C759" />
              <Text style={[styles.title, { marginLeft: 8 }]}>設定</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color="#34C759" />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>月間目標</Text>
            </View>

            <View style={styles.targetCard}>
              <Text style={styles.targetLabel}>目標金額</Text>
              <View style={styles.targetInputContainer}>
                <Text style={styles.currencySymbol}>¥</Text>
                <TextInput
                  style={[
                    styles.targetInput,
                    isEditing && styles.targetInputEditing
                  ]}
                  value={targetInput}
                  onChangeText={setTargetInput}
                  keyboardType="numeric"
                  editable={isEditing}
                  selectTextOnFocus
                />
              </View>

              <View style={styles.targetButtons}>
                {isEditing ? (
                  <>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancelEdit}
                    >
                      <Text style={styles.cancelButtonText}>キャンセル</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={handleUpdateTarget}
                    >
                      <Text style={styles.updateButtonText}>更新</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.editButtonText}>編集</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/** Language selection removed: Japanese only */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color="#34C759" />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>月間統計</Text>
            </View>

            <View style={styles.statsCard}>
              {/* Progress graph */}
              <View style={styles.progressHeader}>
                <Text style={styles.statLabel}>進捗</Text>
                <Text style={[styles.statValue, { color: isOver ? '#FF3B30' : '#34C759' }]}>
                  {stats.progressPercentage}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: isOver ? '#FF3B30' : '#34C759' }]} />
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>今月使った金額</Text>
                <Text style={styles.statValue}>
                  ¥{currentMonth.totalSpent.toLocaleString()}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>1日平均</Text>
                <Text style={styles.statValue}>
                  ¥{stats.dailyAverage.toLocaleString()}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>経過日数</Text>
                <Text style={styles.statValue}>
                  {stats.currentDay}/{stats.daysInMonth} 日
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Database size={20} color="#34C759" />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>データ管理</Text>
            </View>

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearData}
            >
              <Trash2 size={18} color="#FF3B30" />
              <Text style={styles.dangerButtonText}>すべてのデータをリセット</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>食メーター v1.0.0</Text>
            <Text style={styles.footerSubtext}>
              食費の徹底的な管理をサポート
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.5,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  targetCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EEF2EF',
  },
  targetLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#86868B',
    marginBottom: 12,
  },
  targetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#86868B',
    marginRight: 8,
  },
  targetInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    paddingVertical: 16,
  },
  targetInputEditing: {
    backgroundColor: 'white',
  },
  targetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#86868B',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
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
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
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
  languageCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  languageOptionActive: {
    backgroundColor: '#F8F9FA',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  languageTextActive: {
    color: '#34C759',
    fontWeight: '600',
  },
  languageDivider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 20,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#86868B',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#C7C7CC',
  },
});
