import Constants from 'expo-constants';
import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { ChevronRight, FileText, Info, Mail, ShieldCheck } from 'lucide-react-native';

const legalLinks = [
  {
    label: '利用規約',
    description: 'アプリのご利用に関するルール',
    url: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
    Icon: FileText,
  },
  {
    label: 'プライバシーポリシー',
    description: 'お預かりするデータの取扱いについて',
    url: 'https://nagaotadashi.github.io/shoku-meter/',
    Icon: ShieldCheck,
  },
];

export default function AboutScreen() {
  const version = useMemo(() => {
    return (
      Constants.expoConfig?.version ||
      Constants.eaBuildDetails?.appVersion ||
      '1.0.0'
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconWrapper}>
            <Info size={36} color="#34C759" />
          </View>
          <Text style={styles.appName}>食メーター</Text>
          <Text style={styles.appDescription}>
            日々の食費をスマートに管理するためのパートナーアプリです。
          </Text>
          <Text style={styles.version}>バージョン {version}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>法的情報</Text>
          <View style={styles.card}>
            {legalLinks.map(({ label, description, url, Icon }, index) => (
              <TouchableOpacity
                key={url}
                style={[
                  styles.row,
                  index < legalLinks.length - 1 && styles.rowDivider,
                ]}
                activeOpacity={0.7}
                onPress={() => Linking.openURL(url)}
              >
                <View style={styles.rowLeading}>
                  <View style={styles.circleIcon}>
                    <Icon size={18} color="#34C759" />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>{label}</Text>
                    <Text style={styles.rowDescription}>{description}</Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>サポート</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => Linking.openURL('mailto:tahofu89@gmail.com')}
            >
              <View style={styles.rowLeading}>
                <View style={styles.circleIcon}>
                  <Mail size={18} color="#34C759" />
                </View>
                <View>
                  <Text style={styles.rowLabel}>お問い合わせ</Text>
                  <Text style={styles.rowDescription}>
                    tahofu89@gmail.com までメールでご連絡ください
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 15,
    color: '#636366',
    textAlign: 'center',
    lineHeight: 22,
  },
  version: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 16,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EEF2EF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  rowLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  circleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2FCEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  rowDescription: {
    fontSize: 13,
    color: '#86868B',
    marginTop: 4,
  },
});
