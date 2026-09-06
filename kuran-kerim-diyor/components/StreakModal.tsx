import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Flame, Check, Award, Sparkles, Smartphone, X } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUserStore } from '../store/userStore';

interface StreakModalProps {
  visible: boolean;
  onClose: () => void;
}

export function StreakModal({ visible, onClose }: StreakModalProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { streakCount, longestStreak, todayCompleted, streakHistory } = useUserStore();

  // Son 7 günün tarihlerini hesapla
  const days = React.useMemo(() => {
    const list = [];
    const today = new Date();
    const dayNames = (t('streak.days_short', { returnObjects: true }) as string[]) || [
      'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'
    ];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // 0: Pazar, 1: Pazartesi -> 0-6 index düzeni
      const dayIndex = (d.getDay() + 6) % 7;
      const isToday = i === 0;
      const isDone = isToday ? todayCompleted : !!streakHistory[dateStr];

      list.push({
        dateStr,
        dayName: dayNames[dayIndex] || '',
        dayNum: d.getDate(),
        isToday,
        isDone,
      });
    }
    return list;
  }, [todayCompleted, streakHistory, t]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Flame size={20} color="#E25822" fill="#E25822" />
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                {t('streak.title', 'Günlük Seri')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={theme.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Büyük Seri Rozeti */}
            <View style={[styles.heroCard, { backgroundColor: 'rgba(226, 88, 34, 0.08)' }]}>
              <View style={styles.flameWrap}>
                <Flame size={54} color="#E25822" fill="#E25822" />
              </View>
              <Text style={[styles.streakNumber, { color: theme.text }]}>
                {streakCount}
              </Text>
              <Text style={[styles.streakLabel, { color: theme.muted }]}>
                {t('streak.badge', { count: streakCount, defaultValue: `${streakCount} Günlük Seri` })}
              </Text>

              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: todayCompleted ? 'rgba(46, 125, 50, 0.15)' : 'rgba(182, 154, 115, 0.15)',
                    borderColor: todayCompleted ? '#2E7D32' : theme.primary,
                  },
                ]}
              >
                {todayCompleted ? (
                  <>
                    <Check size={14} color="#2E7D32" strokeWidth={2.5} />
                    <Text style={[styles.statusPillText, { color: '#2E7D32' }]}>
                      {t('streak.today_completed', 'Bugün Tamamlandı ✓')}
                    </Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} color={theme.primary} />
                    <Text style={[styles.statusPillText, { color: theme.primary }]}>
                      {t('streak.keep_streak', 'Serini korumak için bugün bir ayet oku')}
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Son 7 Günlük Takvim Çemberleri */}
            <View style={[styles.sectionCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('common.last_7_days', 'Son 7 Gün')}
              </Text>
              <View style={styles.daysRow}>
                {days.map((item, idx) => (
                  <View key={idx} style={styles.dayItem}>
                    <Text style={[styles.dayName, { color: item.isToday ? theme.primary : theme.muted }]}>
                      {item.dayName}
                    </Text>
                    <View
                      style={[
                        styles.dayCircle,
                        {
                          backgroundColor: item.isDone
                            ? '#E25822'
                            : item.isToday
                            ? 'rgba(226, 88, 34, 0.15)'
                            : theme.card,
                          borderColor: item.isToday ? '#E25822' : theme.border,
                          borderWidth: item.isToday ? 2 : 1,
                        },
                      ]}
                    >
                      {item.isDone ? (
                        <Check size={14} color="#fff" strokeWidth={3} />
                      ) : (
                        <Text
                          style={[
                            styles.dayNumText,
                            { color: item.isToday ? '#E25822' : theme.muted },
                          ]}
                        >
                          {item.dayNum}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* İstatistikler Satırı */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Award size={20} color={theme.primary} />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {longestStreak} {t('common.days_suffix', 'Gün')}
                </Text>
                <Text style={[styles.statLabel, { color: theme.muted }]}>
                  {t('streak.longest', 'En Uzun Seri')}
                </Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Sparkles size={20} color={todayCompleted ? '#2E7D32' : '#E25822'} />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {todayCompleted ? '100%' : '0%'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.muted }]}>
                  {t('common.today_goal', 'Günün Hedefi')}
                </Text>
              </View>
            </View>

            {/* Hadis-i Şerif Kartı */}
            <View style={[styles.hadithCard, { backgroundColor: 'rgba(182, 154, 115, 0.08)', borderColor: theme.primary }]}>
              <Text style={[styles.hadithText, { color: theme.text }]}>
                {t('streak.hadith_quote', '“Allah katında amellerin en sevimlisi, az da olsa devamlı olanıdır.” (Buhârî, Rikâk, 18)')}
              </Text>
            </View>

            {/* Widget İpucu */}
            <View style={[styles.widgetTipCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Smartphone size={22} color={theme.primary} />
              <Text style={[styles.widgetTipText, { color: theme.muted }]}>
                {t('streak.widget_hint', 'Ana ekranınıza widget ekleyerek serinizi ve günün ayetini her an takip edebilirsiniz.')}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 16,
  },
  heroCard: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  flameWrap: {
    marginBottom: 6,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  streakLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    gap: 6,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  hadithCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  hadithText: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  widgetTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  widgetTipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
