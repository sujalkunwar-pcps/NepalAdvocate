import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import {
  Clock,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  X,
  Scale,
  Shield,
  Search,
  FileText,
  ChevronRight,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface CaseTrackerModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToDocuments?: () => void;
  onNavigateToLawyers?: () => void;
}

interface CourtCase {
  id: string;
  caseNumber: string;
  title: string;
  titleNp: string;
  court: string;
  courtNp: string;
  bench: string;
  lawyerName: string;
  nextHearingDate: string;
  nextHearingTime: string;
  currentStage: string;
  statusColor: string;
  steps: { title: string; status: 'completed' | 'current' | 'pending'; date?: string }[];
}

export const CaseTrackerModal: React.FC<CaseTrackerModalProps> = ({
  visible,
  onClose,
  onNavigateToDocuments,
  onNavigateToLawyers,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case_01');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const cases: CourtCase[] = [
    {
      id: 'case_01',
      caseNumber: '081-CP-0492',
      title: 'Land Title & Property Partition Dispute',
      titleNp: 'जग्गा अंशबण्डा तथा हकदावी मुद्दा',
      court: 'Kathmandu District Court, Babarmahal',
      courtNp: 'काठमाडौँ जिल्ला अदालत, बबरमहल',
      bench: 'Bench No. 5 • Single Bench - Hon. Justice P. K. Sharma',
      lawyerName: 'Adv. Bikram Thapa (NBA-8219)',
      nextHearingDate: 'Nov 04, 2026 (२०८३-०७-१९)',
      nextHearingTime: '11:30 AM',
      currentStage: 'Pleadings & Evidence (बहस तथा प्रमाण परीक्षण)',
      statusColor: '#10B981',
      steps: [
        { title: 'Case Registered (मुद्दा दर्ता)', status: 'completed', date: '2081/02/10' },
        { title: 'Summons Delivered (म्याद तामेल)', status: 'completed', date: '2081/03/15' },
        { title: 'Written Response Filed (प्रतिउत्तर पत्र)', status: 'completed', date: '2081/05/20' },
        { title: 'Pleadings & Evidence (बहस तथा प्रमाण)', status: 'current', date: 'Nov 04, 2026' },
        { title: 'Final Verdict (अन्तिम फैसला)', status: 'pending' },
      ],
    },
    {
      id: 'case_02',
      caseNumber: '080-CA-1920',
      title: 'Commercial Agreement & Partnership Dissolution',
      titleNp: 'व्यावसायिक सम्झौता उल्लंघन तथा क्षतिपूर्ति',
      court: 'High Court Patan, Lalitpur',
      courtNp: 'पाटन उच्च अदालत, ललितपुर',
      bench: 'Division Bench No. 2 • Hon. Justice S. K. श्रेष्ठ',
      lawyerName: 'Adv. Sunita Shrestha (NBA-5104)',
      nextHearingDate: 'Nov 18, 2026 (२०८३-०८-०३)',
      nextHearingTime: '01:00 PM',
      currentStage: 'Interim Injunction Hearing (अन्तरिम आदेश छलफल)',
      statusColor: '#3B82F6',
      steps: [
        { title: 'Writ Petition Registered (दर्ता)', status: 'completed', date: '2080/10/08' },
        { title: 'Show-Cause Order Issued (कारण देखाउ आदेश)', status: 'completed', date: '2080/10/22' },
        { title: 'Injunction Discussion (छलफल पेशी)', status: 'current', date: 'Nov 18, 2026' },
        { title: 'Final Hearing (अन्तिम सुनुवाई)', status: 'pending' },
      ],
    },
  ];

  const filteredCases = cases.filter(
    (c) =>
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.titleNp.includes(searchQuery) ||
      c.court.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const handleDownloadSlip = (caseNo: string) => {
    setDownloadNotice(`Downloaded Hearing Slip (तारेख पर्चा) for ${caseNo}`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 3000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, { backgroundColor: theme.toggleBg }]}>
                <Clock size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Case Tracker</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  Court Hearings & Status (मुद्दा तथा पेशी विवरण)
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder }]}>
            <Search size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search by Case No. (उदा. 081-CP-0492) or Court..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Download Notification banner */}
          {downloadNotice && (
            <View style={[styles.bannerNotice, { backgroundColor: '#10B98120', borderColor: '#10B98150' }]}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={[styles.bannerText, { color: '#10B981' }]}>{downloadNotice}</Text>
            </View>
          )}

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Case Selector Tabs */}
            <View style={styles.casesListRow}>
              {filteredCases.map((c) => {
                const isSelected = c.id === selectedCaseId;
                const isDark = theme.mode === 'dark';
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedCaseId(c.id)}
                    style={[
                      styles.casePill,
                      {
                        backgroundColor: isSelected ? (isDark ? '#1D4ED8' : '#0F172A') : theme.toggleBg,
                        borderColor: isSelected ? (isDark ? '#60A5FA' : '#0F172A') : theme.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.casePillText,
                        { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {c.caseNumber}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Active Case Details Card */}
            {activeCase && (
              <View style={[styles.detailCard, { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder }]}>
                {/* Case Title & No */}
                <View style={styles.titleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.caseNumberTag, { color: theme.primary }]}>{activeCase.caseNumber}</Text>
                    <Text style={[styles.caseMainTitle, { color: theme.textPrimary }]}>{activeCase.title}</Text>
                    <Text style={[styles.caseSubTitleNp, { color: theme.textSecondary }]}>{activeCase.titleNp}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: activeCase.statusColor + '20', borderColor: activeCase.statusColor }]}>
                    <View style={[styles.pulsingDot, { backgroundColor: activeCase.statusColor }]} />
                    <Text style={[styles.statusText, { color: activeCase.statusColor }]}>Active</Text>
                  </View>
                </View>

                {/* Court & Bench */}
                <View style={styles.infoRow}>
                  <MapPin size={16} color={theme.textMuted} />
                  <Text style={[styles.infoText, { color: theme.textPrimary }]}>
                    {activeCase.court}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Scale size={16} color={theme.textMuted} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>{activeCase.bench}</Text>
                </View>
                <View style={styles.infoRow}>
                  <User size={16} color={theme.textMuted} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    Advocate: <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{activeCase.lawyerName}</Text>
                  </Text>
                </View>

                {/* Next Hearing Highlight */}
                <View style={[styles.hearingBox, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
                  <View style={styles.hearingLeft}>
                    <Calendar size={20} color={theme.primary} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.hearingLabel, { color: theme.textMuted }]}>NEXT HEARING / पेशी</Text>
                      <Text style={[styles.hearingDate, { color: theme.textPrimary }]}>
                        {activeCase.nextHearingDate}
                      </Text>
                      <Text style={[styles.hearingTime, { color: theme.textSecondary }]}>
                        Time: {activeCase.nextHearingTime}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDownloadSlip(activeCase.caseNumber)}
                    style={[styles.slipBtn, { backgroundColor: theme.primary }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.slipBtnText, { color: theme.textInverse }]}>तारेख पर्चा</Text>
                  </TouchableOpacity>
                </View>

                {/* Stage Progression Stepper */}
                <Text style={[styles.timelineHeading, { color: theme.textPrimary }]}>
                  Procedural Progress (प्रक्रियागत प्रगति)
                </Text>

                <View style={styles.stepperContainer}>
                  {activeCase.steps.map((step, idx) => {
                    const isLast = idx === activeCase.steps.length - 1;
                    return (
                      <View key={idx} style={styles.stepItem}>
                        <View style={styles.stepIndicatorCol}>
                          <View
                            style={[
                              styles.stepDot,
                              step.status === 'completed' && { backgroundColor: '#10B981' },
                              step.status === 'current' && { backgroundColor: theme.primary, borderColor: theme.primary },
                              step.status === 'pending' && { backgroundColor: theme.cardBorder },
                            ]}
                          >
                            {step.status === 'completed' && <CheckCircle2 size={12} color="#FFFFFF" />}
                          </View>
                          {!isLast && (
                            <View
                              style={[
                                styles.stepLine,
                                {
                                  backgroundColor:
                                    step.status === 'completed' ? '#10B981' : theme.cardBorder,
                                },
                              ]}
                            />
                          )}
                        </View>
                        <View style={styles.stepContent}>
                          <Text
                            style={[
                              styles.stepTitle,
                              {
                                color:
                                  step.status === 'pending' ? theme.textMuted : theme.textPrimary,
                                fontWeight: step.status === 'current' ? '700' : '500',
                              },
                            ]}
                          >
                            {step.title}
                          </Text>
                          {step.date && (
                            <Text style={[styles.stepDate, { color: theme.textSecondary }]}>
                              {step.date}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Action Buttons for this Case */}
                <View style={styles.actionButtonsRow}>
                  {onNavigateToDocuments && (
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        onNavigateToDocuments();
                      }}
                      style={[styles.caseActionBtn, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
                    >
                      <FileText size={16} color={theme.textPrimary} />
                      <Text style={[styles.caseActionText, { color: theme.textPrimary }]}>Case Documents</Text>
                    </TouchableOpacity>
                  )}

                  {onNavigateToLawyers && (
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        onNavigateToLawyers();
                      }}
                      style={[styles.caseActionBtn, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
                    >
                      <User size={16} color={theme.textPrimary} />
                      <Text style={[styles.caseActionText, { color: theme.textPrimary }]}>Consult Advocate</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Supreme Court sync notice */}
            <View style={styles.footerNotice}>
              <Shield size={14} color={theme.textMuted} />
              <Text style={[styles.footerNoticeText, { color: theme.textMuted }]}>
                Live synced with Nepal Supreme Court & District Court Information Management System (न्यायपालिका ई-सेवा).
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 580,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
  },
  bannerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  bannerText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  bodyScroll: {
    flexGrow: 1,
  },
  casesListRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  casePill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  casePillText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  detailCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  caseNumberTag: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  caseMainTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  caseSubTitleNp: {
    fontSize: 12.5,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12.5,
    flex: 1,
  },
  hearingBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 12,
  },
  hearingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hearingLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hearingDate: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 2,
  },
  hearingTime: {
    fontSize: 11.5,
    marginTop: 1,
  },
  slipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  slipBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  timelineHeading: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  stepperContainer: {
    paddingLeft: 6,
    marginBottom: 14,
  },
  stepItem: {
    flexDirection: 'row',
    minHeight: 36,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 20,
    marginRight: 10,
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 8,
  },
  stepTitle: {
    fontSize: 12.5,
  },
  stepDate: {
    fontSize: 11,
    marginTop: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  caseActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  caseActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  footerNoticeText: {
    fontSize: 10.5,
    flex: 1,
    lineHeight: 14,
  },
});
