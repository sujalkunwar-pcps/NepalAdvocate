import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { LegalDocumentData } from '../types/dashboard';
import { PlayfulCard } from './PlayfulCard';

interface RecentDocumentsWidgetProps {
  documents: LegalDocumentData[];
  onViewAll?: () => void;
  onSelectDocument?: (doc: LegalDocumentData) => void;
}

export const RecentDocumentsWidget: React.FC<RecentDocumentsWidgetProps> = ({
  documents,
  onViewAll,
  onSelectDocument,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Recent Legal Documents
        </Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} style={styles.viewAllBtn}>
            <Text style={[styles.viewAllText, { color: theme.textSecondary }]}>View All</Text>
            <ArrowRight size={14} color={theme.textSecondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}
      </View>

      {documents.map((doc, idx) => (
        <PlayfulCard key={doc.id} delay={360 + idx * 60}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onSelectDocument && onSelectDocument(doc)}
            style={[
              styles.docCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <View style={[styles.iconSquare, { backgroundColor: theme.toggleBg }]}>
              <FileText size={20} color={theme.textPrimary} />
            </View>

            <View style={styles.infoCol}>
              <Text style={[styles.docTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                {doc.title}
              </Text>
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {doc.category} • {doc.fileSize} • {doc.updatedAt}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: doc.status === 'VERIFIED' ? '#D1FAE5' : '#E0F2FE',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: doc.status === 'VERIFIED' ? '#059669' : '#0284C7',
                  },
                ]}
              >
                {doc.status}
              </Text>
            </View>
          </TouchableOpacity>
        </PlayfulCard>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  iconSquare: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 11.5,
    marginTop: 3,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
