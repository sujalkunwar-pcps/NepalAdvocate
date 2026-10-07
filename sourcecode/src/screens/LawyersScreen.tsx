import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Search, Filter, Star, MapPin, CheckCircle2, Shield, Phone, Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { TimedDialog } from '../components/TimedDialog';
import { PlayfulCard } from '../components/PlayfulCard';
import { BookAppointmentModal, LawyerInfo } from '../components/BookAppointmentModal';
import { apiClient } from '../services/api';

interface LawyerItem {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: number;
  hourlyRate: number;
  officeLocation: string;
  isVerified: boolean;
  image: string;
}

const FALLBACK_LAWYERS: LawyerItem[] = [
  {
    id: 'law_01',
    name: 'Adv. Bikram Thapa',
    specialization: 'Corporate & Tax Law',
    rating: 4.9,
    experience: 12,
    hourlyRate: 2500,
    officeLocation: 'Anamnagar, Kathmandu',
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'law_02',
    name: 'Adv. Sunita Shrestha',
    specialization: 'Property & Civil Law',
    rating: 4.8,
    experience: 9,
    hourlyRate: 3000,
    officeLocation: 'New Baneshwor, Kathmandu',
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'law_03',
    name: 'Adv. Rajesh Adhikari',
    specialization: 'Criminal & Family Law',
    rating: 4.95,
    experience: 15,
    hourlyRate: 3500,
    officeLocation: 'Kumaripati, Lalitpur',
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'law_04',
    name: 'Adv. Priyanka Karki',
    specialization: 'Immigration & Labor Law',
    rating: 4.75,
    experience: 7,
    hourlyRate: 2200,
    officeLocation: 'Putalisadak, Kathmandu',
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
  },
];

export const LawyersScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [lawyers, setLawyers] = useState<LawyerItem[]>(FALLBACK_LAWYERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedLawyerName, setSelectedLawyerName] = useState('');
  const [selectedLawyerForBooking, setSelectedLawyerForBooking] = useState<LawyerItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiClient.get('/lawyers')
      .then((res) => {
        if (isMounted && res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setLawyers(res.data.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const specializations = ['All', 'Corporate', 'Property', 'Criminal', 'Family', 'Tax'];

  const filteredLawyers = lawyers.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = selectedSpec === 'All' || l.specialization.includes(selectedSpec);
    return matchesSearch && matchesSpec;
  });

  const handleOpenBooking = (lawyer: LawyerItem) => {
    setSelectedLawyerForBooking(lawyer);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 24) + 10,
            paddingBottom: Math.max(insets.bottom + 90, 120),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Find Advocates</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Verified legal practitioners across Nepal
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <Search size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.textPrimary },
              Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
            ]}
            placeholder="Search by name or specialization..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Specialization Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {specializations.map((spec) => {
            const isActive = selectedSpec === spec;
            return (
              <TouchableOpacity
                key={spec}
                activeOpacity={0.8}
                onPress={() => setSelectedSpec(spec)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive ? theme.primary : theme.cardBackground,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? theme.textInverse : theme.textSecondary },
                    isActive && { fontWeight: '700' },
                  ]}
                >
                  {spec}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Lawyers List */}
        {filteredLawyers.map((lawyer, idx) => (
          <PlayfulCard key={lawyer.id} delay={idx * 70}>
            <View
              style={[
                styles.lawyerCard,
                { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
              ]}
            >
              <View style={styles.topSection}>
                <View style={styles.avatarWrapper}>
                  <Image source={{ uri: lawyer.image }} style={styles.avatar} resizeMode="cover" />
                  {lawyer.isVerified && (
                    <View style={[styles.verifiedBadge, { backgroundColor: theme.cardBackground }]}>
                      <CheckCircle2 size={15} color="#10B981" />
                    </View>
                  )}
                </View>

                <View style={styles.detailsCol}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.lawyerName, { color: theme.textPrimary }]}>
                      {lawyer.name}
                    </Text>
                  </View>
                  <Text style={[styles.specText, { color: theme.textSecondary }]}>
                    {lawyer.specialization}
                  </Text>

                  <View style={styles.metaRow}>
                    <MapPin size={12} color={theme.textMuted} />
                    <Text style={[styles.metaText, { color: theme.textMuted }]}>
                      {lawyer.officeLocation}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

              <View style={styles.bottomSection}>
                <View style={styles.statsCol}>
                  <View style={styles.ratingRow}>
                    <Star size={13} color="#F59E0B" fill="#F59E0B" />
                    <Text style={[styles.ratingVal, { color: theme.textPrimary }]}>
                      {lawyer.rating}
                    </Text>
                    <Text style={[styles.expText, { color: theme.textMuted }]}>
                      • {lawyer.experience} yrs exp
                    </Text>
                  </View>
                  <Text style={[styles.feeVal, { color: theme.textPrimary }]}>
                    Rs. {lawyer.hourlyRate}/hr
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleOpenBooking(lawyer)}
                  style={[styles.bookBtn, { backgroundColor: theme.primary }]}
                >
                  <Calendar size={14} color={theme.textInverse} style={{ marginRight: 6 }} />
                  <Text style={[styles.bookBtnText, { color: theme.textInverse }]}>Book Session</Text>
                </TouchableOpacity>
              </View>
            </View>
          </PlayfulCard>
        ))}
      </ScrollView>

      <BookAppointmentModal
        visible={!!selectedLawyerForBooking}
        lawyer={selectedLawyerForBooking}
        onClose={() => setSelectedLawyerForBooking(null)}
        onSuccess={(apt) => {
          setSelectedLawyerForBooking(null);
        }}
      />

      <TimedDialog
        visible={dialogVisible}
        title="Consultation Request"
        message={`Booking request sent to ${selectedLawyerName}. Available time slots will be synced.`}
        type="info"
        onDismiss={() => setDialogVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily: typography.fontFamily,
  },
  subtitle: {
    fontSize: 13.5,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  filterScroll: {
    marginBottom: 18,
  },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  lawyerCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 10,
  },
  detailsCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lawyerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  specText: {
    fontSize: 12.5,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaText: {
    fontSize: 11.5,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsCol: {},
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingVal: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 4,
  },
  expText: {
    fontSize: 12,
    marginLeft: 4,
  },
  feeVal: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  bookBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
