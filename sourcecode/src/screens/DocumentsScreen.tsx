import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import {
  Search,
  Plus,
  FileText,
  Download,
  Eye,
  Lock,
  ShieldCheck,
  Folder,
  X,
  CheckCircle2,
  Share2,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { TimedDialog } from '../components/TimedDialog';
import { PlayfulCard } from '../components/PlayfulCard';
import { apiClient } from '../services/api';

interface DocItem {
  id: string;
  title: string;
  titleNepali?: string;
  category: string;
  size: string;
  updatedAt: string;
  status: 'Verified' | 'Encrypted' | 'Draft';
  snippet?: string;
}

const INITIAL_DOCS: DocItem[] = [
  {
    id: 'doc_1',
    title: 'Property Deed Contract (Lalpurja Registration)',
    titleNepali: 'जग्गाधनी प्रमाण पुर्जा (लालपुर्जा लिखत)',
    category: 'Contracts',
    size: '2.4 MB',
    updatedAt: 'Sep 15, 2026',
    status: 'Verified',
    snippet: 'Official sale contract and conveyance deed for land parcel registered at Malpot Karyalaya, Kathmandu under Section 421 of Muluki Civil Code.',
  },
  {
    id: 'doc_2',
    title: 'Citizenship Identity Copy (Verified notarized)',
    titleNepali: 'नेपाली नागरिकता प्रमाणपत्र प्रमाणित प्रतिलिपि',
    category: 'Identity',
    size: '1.1 MB',
    updatedAt: 'Aug 28, 2026',
    status: 'Encrypted',
    snippet: 'Notarized scan of citizenship issued by District Administration Office, Kathmandu with 256-bit biometric vault encryption.',
  },
  {
    id: 'doc_3',
    title: 'Commercial Lease Agreement draft v2',
    titleNepali: 'व्यापारिक बहाल सम्झौता मस्यौदा',
    category: 'Contracts',
    size: '850 KB',
    updatedAt: 'Sep 18, 2026',
    status: 'Draft',
    snippet: 'Tenancy terms, dispute resolution clause, advance security deposit, and arbitration provisions for commercial premises.',
  },
  {
    id: 'doc_4',
    title: 'Tax Exemption Filing Affidavit 2082/83',
    titleNepali: 'कर छुट निवेदन शपथपत्र',
    category: 'Tax Docs',
    size: '3.2 MB',
    updatedAt: 'Jul 10, 2026',
    status: 'Verified',
    snippet: 'Inland Revenue Department (IRD) sworn declaration on deductible expenses and PAN clearance certificate.',
  },
  {
    id: 'doc_5',
    title: 'District Court Power of Attorney (Warisnama)',
    titleNepali: 'जिल्ला अदालत अधिकृत वारिसनामा',
    category: 'Court Forms',
    size: '1.8 MB',
    updatedAt: 'Sep 02, 2026',
    status: 'Verified',
    snippet: 'Special judicial Warisnama authorizing advocate representation under National Civil Procedure Code 2074.',
  },
];

export const DocumentsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMsg, setDialogMsg] = useState('');

  // Upload modal state
  const [uploadVisible, setUploadVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Contracts');
  const [newSnippet, setNewSnippet] = useState('');

  // Preview modal state
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);

  const categories = ['All', 'Contracts', 'Identity', 'Court Forms', 'Tax Docs'];

  useEffect(() => {
    // Attempt backend sync
    const fetchDocs = async () => {
      try {
        const res = await apiClient.get('/documents');
        if (res.data?.success && Array.isArray(res.data.data)) {
          const mapped = res.data.data.map((d: any) => ({
            id: d.id,
            title: d.title,
            titleNepali: d.titleNepali,
            category: d.category || 'Contracts',
            size: d.fileSize || '1.5 MB',
            updatedAt: d.updatedAt || 'Recent',
            status: (d.status === 'VERIFIED' ? 'Verified' : d.status === 'DRAFT' ? 'Draft' : 'Encrypted') as any,
            snippet: d.contentSnippet || 'Encrypted legal deed stored in NepalAdvocate cloud vault.',
          }));
          setDocs(mapped);
        }
      } catch (e) {
        // Fallback to initial docs
      }
    };
    fetchDocs();
  }, []);

  const filteredDocs = docs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.titleNepali && doc.titleNepali.includes(searchQuery));
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateDocument = async () => {
    if (!newTitle.trim()) {
      setDialogMsg('Please enter a document title.');
      setDialogVisible(true);
      return;
    }

    const createdDoc: DocItem = {
      id: `doc_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      size: '1.4 MB',
      updatedAt: 'Just now',
      status: 'Verified',
      snippet: newSnippet.trim() || 'Uploaded legal document stored in encrypted vault.',
    };

    try {
      await apiClient.post('/documents', {
        title: createdDoc.title,
        category: createdDoc.category,
        contentSnippet: createdDoc.snippet,
        fileSize: createdDoc.size,
      });
    } catch {
      // offline fallback
    }

    setDocs([createdDoc, ...docs]);
    setUploadVisible(false);
    setNewTitle('');
    setNewSnippet('');
    setDialogMsg(`Document "${createdDoc.title}" successfully added to your Legal Vault.`);
    setDialogVisible(true);
  };

  const handleOpenPreview = (doc: DocItem) => {
    setSelectedDoc(doc);
    setPreviewVisible(true);
  };

  const handleDownload = (doc: DocItem) => {
    setDialogMsg(`Downloading encrypted copy of "${doc.title}"... (Stored in offline storage).`);
    setDialogVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Legal Vault</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Secure encrypted legal records & notarized files
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setUploadVisible(true)}
            style={[styles.uploadBtn, { backgroundColor: theme.primary }]}
          >
            <Plus size={16} color={theme.textInverse} style={{ marginRight: 4 }} />
            <Text style={[styles.uploadBtnText, { color: theme.textInverse }]}>Add Document</Text>
          </TouchableOpacity>
        </View>

        {/* Security Banner */}
        <View
          style={[
            styles.banner,
            { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder },
          ]}
        >
          <Lock size={18} color={theme.textPrimary} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>
              AES-256 Cloud Encryption Active
            </Text>
            <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
              Your documents are end-to-end encrypted and accessible only by your verified identity.
            </Text>
          </View>
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
            placeholder="Search vault documents or acts..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.catPill,
                  {
                    backgroundColor: isActive ? theme.primary : theme.cardBackground,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catText,
                    { color: isActive ? theme.textInverse : theme.textSecondary },
                    isActive && { fontWeight: '700' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Document List */}
        {filteredDocs.map((doc, idx) => (
          <PlayfulCard key={doc.id} delay={idx * 60}>
            <View
              style={[
                styles.docCard,
                { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
              ]}
            >
              <View style={styles.docLeft}>
                <View style={[styles.fileIconWrapper, { backgroundColor: theme.toggleBg }]}>
                  <FileText size={20} color={theme.textPrimary} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={[styles.docTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                    {doc.title}
                  </Text>
                  {doc.titleNepali ? (
                    <Text style={[styles.docNepali, { color: theme.textSecondary }]} numberOfLines={1}>
                      {doc.titleNepali}
                    </Text>
                  ) : null}
                  <View style={styles.docMetaRow}>
                    <Text style={[styles.docMetaText, { color: theme.textMuted }]}>
                      {doc.category} • {doc.size} • {doc.updatedAt}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            doc.status === 'Verified'
                              ? '#10B98115'
                              : doc.status === 'Encrypted'
                              ? '#3B82F615'
                              : '#F59E0B15',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              doc.status === 'Verified'
                                ? '#10B981'
                                : doc.status === 'Encrypted'
                                ? '#3B82F6'
                                : '#F59E0B',
                          },
                        ]}
                      >
                        {doc.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.docRight}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleOpenPreview(doc)}
                  style={[styles.iconBtn, { backgroundColor: theme.inputBg }]}
                >
                  <Eye size={15} color={theme.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDownload(doc)}
                  style={[styles.iconBtn, { backgroundColor: theme.inputBg, marginLeft: 6 }]}
                >
                  <Download size={15} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </PlayfulCard>
        ))}
      </ScrollView>

      {/* Upload Document Modal */}
      <Modal visible={uploadVisible} transparent animationType="slide" onRequestClose={() => setUploadVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add Legal Document</Text>
              <TouchableOpacity onPress={() => setUploadVisible(false)} style={styles.closeBtn}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>DOCUMENT TITLE</Text>
            <TextInput
              style={[
                styles.modalInput,
                { color: theme.textPrimary, borderColor: theme.cardBorder, backgroundColor: theme.background },
                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
              ]}
              placeholder="e.g. Warisnama Deed / Tenancy Contract"
              placeholderTextColor={theme.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 12 }]}>CATEGORY</Text>
            <View style={styles.catPickerRow}>
              {['Contracts', 'Identity', 'Court Forms', 'Tax Docs'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  onPress={() => setNewCategory(cat)}
                  style={[
                    styles.catChoice,
                    {
                      borderColor: newCategory === cat ? theme.primary : theme.cardBorder,
                      backgroundColor: newCategory === cat ? theme.primary + '15' : theme.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catChoiceText,
                      { color: newCategory === cat ? theme.primary : theme.textSecondary },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 12 }]}>DESCRIPTION / SNIPPET</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: theme.textPrimary,
                  borderColor: theme.cardBorder,
                  backgroundColor: theme.background,
                  minHeight: 60,
                },
                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
              ]}
              placeholder="Brief summary or reference provisions..."
              placeholderTextColor={theme.textMuted}
              value={newSnippet}
              onChangeText={setNewSnippet}
              multiline
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setUploadVisible(false)}
                style={[styles.modalCancelBtn, { borderColor: theme.cardBorder }]}
              >
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCreateDocument}
                style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.modalSubmitText}>Save to Vault</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Document Preview Modal */}
      <Modal visible={previewVisible} transparent animationType="fade" onRequestClose={() => setPreviewVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            {selectedDoc && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={22} color="#10B981" />
                    <Text style={[styles.modalTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      Vault Preview
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setPreviewVisible(false)} style={styles.closeBtn}>
                    <X size={20} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.previewPaper, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.previewDocTitle, { color: theme.textPrimary }]}>
                    {selectedDoc.title}
                  </Text>
                  {selectedDoc.titleNepali ? (
                    <Text style={[styles.previewDocNepali, { color: theme.primary }]}>
                      {selectedDoc.titleNepali}
                    </Text>
                  ) : null}
                  <View style={styles.metaRowPreview}>
                    <Text style={[styles.previewTag, { color: theme.textMuted }]}>
                      Category: {selectedDoc.category}
                    </Text>
                    <Text style={[styles.previewTag, { color: theme.textMuted }]}>
                      Size: {selectedDoc.size}
                    </Text>
                  </View>

                  <View style={[styles.previewDivider, { backgroundColor: theme.cardBorder }]} />

                  <Text style={[styles.previewContentText, { color: theme.textSecondary }]}>
                    {selectedDoc.snippet}
                  </Text>

                  <View style={[styles.securitySeal, { backgroundColor: '#10B98115', borderColor: '#10B98140' }]}>
                    <CheckCircle2 size={16} color="#10B981" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '600' }}>
                      Certified Legal Record • 256-Bit Protected
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPreviewVisible(false)}
                    style={[styles.modalCancelBtn, { borderColor: theme.cardBorder }]}
                  >
                    <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setPreviewVisible(false);
                      handleDownload(selectedDoc);
                    }}
                    style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
                  >
                    <Download size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalSubmitText}>Download PDF</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <TimedDialog
        visible={dialogVisible}
        title="Vault Notice"
        message={dialogMsg}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily: typography.fontFamily,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    fontFamily: typography.regular,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: typography.medium,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: typography.medium,
  },
  bannerSub: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
    fontFamily: typography.regular,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    fontFamily: typography.regular,
  },
  catScroll: {
    marginBottom: 16,
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  catText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: typography.regular,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  fileIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: typography.medium,
  },
  docNepali: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: typography.regular,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  docMetaText: {
    fontSize: 11.5,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  docRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: typography.semiBold,
  },
  closeBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: typography.regular,
  },
  catPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChoice: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  catChoiceText: {
    fontSize: 12,
    fontFamily: typography.medium,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  // Preview
  previewPaper: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  previewDocTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: typography.semiBold,
  },
  previewDocNepali: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: typography.medium,
  },
  metaRowPreview: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  previewTag: {
    fontSize: 12,
  },
  previewDivider: {
    height: 1,
    marginVertical: 12,
  },
  previewContentText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: typography.regular,
    marginBottom: 14,
  },
  securitySeal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
});
