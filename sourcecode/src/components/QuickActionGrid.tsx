import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Scale, Bot, FileText, Clock } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { PlayfulCard } from './PlayfulCard';

interface QuickActionGridProps {
  onBookConsultation?: () => void;
  onAiAssistant?: () => void;
  onMyDocuments?: () => void;
  onTrackCases?: () => void;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  onBookConsultation,
  onAiAssistant,
  onMyDocuments,
  onTrackCases,
}) => {
  const { theme } = useTheme();

  const actions = [
    {
      id: 'book',
      title: 'Find Lawyer',
      subtitle: 'Book Consultation',
      icon: <Scale size={22} color={theme.textPrimary} />,
      onPress: onBookConsultation,
    },
    {
      id: 'ai',
      title: 'AI Advocate',
      subtitle: 'Legal Q&A Assistant',
      icon: <Bot size={22} color={theme.textPrimary} />,
      onPress: onAiAssistant,
    },
    {
      id: 'docs',
      title: 'Legal Vault',
      subtitle: 'Contracts & Deeds',
      icon: <FileText size={22} color={theme.textPrimary} />,
      onPress: onMyDocuments,
    },
    {
      id: 'cases',
      title: 'Case Tracker',
      subtitle: 'Court Hearings & Status',
      icon: <Clock size={22} color={theme.textPrimary} />,
      onPress: onTrackCases,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Services</Text>
      <View style={styles.grid}>
        {actions.map((act, idx) => (
          <PlayfulCard key={act.id} delay={120 + idx * 50} style={styles.cardWrapper}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={act.onPress}
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: theme.toggleBg }]}>
                {act.icon}
              </View>
              <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>{act.title}</Text>
              <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                {act.subtitle}
              </Text>
            </TouchableOpacity>
          </PlayfulCard>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  actionCard: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  actionSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: '400',
  },
});
