import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';

interface BudgetCardProps {
  title: string;
  amount: number;
  maxAmount?: number;
  color: string;
  subtitle?: string;
  showProgress?: boolean;
}

export default function BudgetCard({
  title,
  amount,
  maxAmount,
  color,
  subtitle,
  showProgress = false
}: BudgetCardProps) {
  const progress = maxAmount ? Math.min(amount / maxAmount, 1) : 0;
  const isOverBudget = maxAmount && amount > maxAmount;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <Text style={[styles.amount, { color: isOverBudget ? '#FF3B30' : color }]}>
        ¥{Math.abs(amount).toLocaleString()}
        {amount < 0 && ' 超過'}
      </Text>

      {showProgress && maxAmount && (
        <View style={styles.progressContainer}>
          <Progress.Bar
            progress={progress}
            width={null}
            height={4}
            color={isOverBudget ? '#FF3B30' : color}
            unfilledColor="#F0F0F0"
            borderWidth={0}
            borderRadius={2}
          />
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>¥0</Text>
            <Text style={styles.progressLabel}>¥{maxAmount.toLocaleString()}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: '#999',
  },
});