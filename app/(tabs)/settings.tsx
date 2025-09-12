import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Target, Trash2 } from 'lucide-react-native';
import { useFoodBudget } from '@/contexts/FoodBudgetContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/utils/storage';

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();
  const { monthlyTarget, setMonthlyTarget, currentMonth } = useFoodBudget();
  const [targetInput, setTargetInput] = useState(monthlyTarget.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateTarget = () => {
    const newTarget = parseFloat(targetInput);
    
    if (isNaN(newTarget) || newTarget <= 0) {
      Alert.alert(t.error, t.invalidAmount);
      return;
    }

    if (newTarget > 1000000) {
      Alert.alert(t.error, t.amountTooLarge);
      return;
    }

    setMonthlyTarget(newTarget);
    setIsEditing(false);
    Alert.alert(t.success, t.targetUpdated);
  };

  const handleCancelEdit = () => {
    setTargetInput(monthlyTarget.toString());
    setIsEditing(false);
  };

  const handleClearData = () => {
    Alert.alert(
      t.resetDataTitle,
      t.resetDataMessage,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.reset,
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.clearAll();
              Alert.alert(t.resetComplete, t.resetCompleteMessage);
            } catch (error) {
              Alert.alert(t.error, t.resetError);
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.settings}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color="#34C759" />
              <Text style={styles.sectionTitle}>{t.monthlyTarget}</Text>
            </View>
            
            <View style={styles.targetCard}>
              <Text style={styles.targetLabel}>{t.targetAmount}</Text>
              <View style={styles.targetInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
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
                      <Text style={styles.cancelButtonText}>{t.cancel}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={handleUpdateTarget}
                    >
                      <Text style={styles.updateButtonText}>{t.update}</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.editButtonText}>{t.edit}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.language}</Text>
            
            <View style={styles.languageCard}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === 'en' && styles.languageOptionActive
                ]}
                onPress={() => setLanguage('en')}
              >
                <Text style={[
                  styles.languageText,
                  language === 'en' && styles.languageTextActive
                ]}>
                  English
                </Text>
                {language === 'en' && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <View style={styles.languageDivider} />
              
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === 'ja' && styles.languageOptionActive
                ]}
                onPress={() => setLanguage('ja')}
              >
                <Text style={[
                  styles.languageText,
                  language === 'ja' && styles.languageTextActive
                ]}>
                  日本語
                </Text>
                {language === 'ja' && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.monthlyStatistics}</Text>
            
            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t.monthlySpent}</Text>
                <Text style={styles.statValue}>
                  ${currentMonth.totalSpent.toLocaleString()}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t.progress}</Text>
                <Text style={[
                  styles.statValue,
                  { color: parseFloat(stats.progressPercentage) > 100 ? '#FF3B30' : '#34C759' }
                ]}>
                  {stats.progressPercentage}%
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t.dailyAverage}</Text>
                <Text style={styles.statValue}>
                  ${stats.dailyAverage.toLocaleString()}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t.daysElapsed}</Text>
                <Text style={styles.statValue}>
                  {stats.currentDay}/{stats.daysInMonth} days
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.dataManagement}</Text>
            
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearData}
            >
              <Trash2 size={18} color="#FF3B30" />
              <Text style={styles.dangerButtonText}>{t.resetAllData}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>FoodMeter v1.0.0</Text>
            <Text style={styles.footerSubtext}>
              Supporting healthy eating habits
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