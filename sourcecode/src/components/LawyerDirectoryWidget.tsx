import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Star, MapPin, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { PlayfulCard } from './PlayfulCard';

interface Lawyer {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  hourlyRate: number;
  officeLocation: string;
  isVerified: boolean;
  image?: string;
}

interface LawyerDirectoryWidgetProps {
  lawyers?: Lawyer[];
  onSelectLawyer?: (lawyer: Lawyer) => void;
  onViewAllLawyers?: () => void;
}

export const LawyerDirectoryWidget: React.FC<LawyerDirectoryWidgetProps> = ({
  lawyers = [],
  onSelectLawyer,
  onViewAllLawyers,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Top Verified Advocates
        </Text>
        {onViewAllLawyers && (
          <TouchableOpacity onPress={onViewAllLawyers} activeOpacity={0.7} style={styles.viewAllBtn}>
            <Text style={[styles.viewAllText, { color: theme.textSecondary }]}>View All</Text>
            <ArrowRight size={14} color={theme.textSecondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {lawyers.map((lawyer, idx) => (
          <PlayfulCard key={lawyer.id} delay={300 + idx * 60}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onSelectLawyer && onSelectLawyer(lawyer)}
              style={[
                styles.lawyerCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={styles.avatarRow}>
                {lawyer.image ? (
                  <Image source={{ uri: lawyer.image }} style={styles.avatar} resizeMode="cover" />
                ) : (
                  <Image
                    source={require('../../assets/icon.png')}
                    style={styles.avatar}
                    resizeMode="contain"
                  />
                )}
                {lawyer.isVerified && (
                  <View style={[styles.verifiedTag, { backgroundColor: theme.cardBackground }]}>
                    <CheckCircle2 size={15} color="#10B981" />
                  </View>
                )}
              </View>

              <Text style={[styles.lawyerName, { color: theme.textPrimary }]} numberOfLines={1}>
                {lawyer.name}
              </Text>
              <Text style={[styles.specText, { color: theme.textSecondary }]} numberOfLines={1}>
                {lawyer.specialization}
              </Text>

              <View style={styles.locationRow}>
                <MapPin size={12} color={theme.textMuted} />
                <Text style={[styles.locationText, { color: theme.textMuted }]} numberOfLines={1}>
                  {lawyer.officeLocation}
                </Text>
              </View>

              <View style={[styles.cardDivider, { backgroundColor: theme.cardBorder }]} />

              <View style={styles.bottomRow}>
                <View style={styles.ratingGroup}>
                  <Star size={13} color="#F59E0B" fill="#F59E0B" />
                  <Text style={[styles.ratingText, { color: theme.textPrimary }]}>
                    {lawyer.rating}
                  </Text>
                </View>
                <Text style={[styles.rateText, { color: theme.textPrimary }]}>
                  Rs. {lawyer.hourlyRate}/hr
                </Text>
              </View>
            </TouchableOpacity>
          </PlayfulCard>
        ))}
      </ScrollView>
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
    marginBottom: 14,
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
  scrollContainer: {
    paddingRight: 10,
  },
  lawyerCard: {
    width: 210,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarRow: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  verifiedTag: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 10,
  },
  lawyerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  specText: {
    fontSize: 12,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    marginVertical: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12.5,
    fontWeight: '800',
    marginLeft: 4,
  },
  rateText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
});
