import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Search, Plus, FileText, Download, Eye, Lock, ShieldCheck, Folder } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { TimedDialog } from '../components/TimedDialog';
import { PlayfulCard } from '../components/PlayfulCard';

interface DocItem {
  id: string;
  title: string;
  category: string;
  size: string;
  updatedAt: string;
  status: 'Verified' | 'Encrypted' | 'Draft';
}

const MOCK_DOCS: DocItem[] = [
  {
    id: 'doc_1',
    title: 'Property Deed Contract (Lalpurja Registration)',
    category: 'Contracts',
    size: '2.4 MB',
    updatedAt: 'Sep 15, 2026',
    status: 'Verified',
  },
  {
    id: 'doc_2',
    title: 'Citizenship Identity Copy (Verified notarized)',
    category: 'Identity',
    size: '1.1 MB',
    updatedAt: 'Aug 28, 2026',
    status: 'Encrypted',
  },
  {
    id: 'doc_3',
    title: 'Commercial Lease Agreement draft v2',
    category: 'Contracts',
    size: '850 KB',
    updatedAt: 'Sep 18, 2026',
    status: 'Draft',
  },
  {
    id: 'doc_4',
    title: 'Tax Exemption Filing Affidavit 2082/83',
    category: 'Tax Docs',
    size: '3.2 MB',
    updatedAt: 'Jul 10, 2026',
    status: 'Verified',
  },
  {
    id: 'doc_5',
    title: 'District Court Power of Attorney (Warisnama)',
    category: 'Court Forms',
    size: '1.8 MB',
    updatedAt: 'Sep 02, 2026',
    status: 'Verified',
  },
];

export const DocumentsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMsg, setDialogMsg] = useState('');

  const categories = ['All', 'Contracts', 'Identity', 'Court Forms', 'Tax Docs'];

  const filteredDocs = MOCK_DOCS.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDocAction = (action: string, title: string) => {
    setDialogMsg(`${action} triggered for: ${title}`);
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
            onPress={() => handleDocAction('Upload Document', 'New File')}
            style={[styles.uploadBtn, { backgroundColor: theme.primary }]}
          >
            <Plus size={16} color={theme.textInverse} style={{ marginRight: 4 }} />
            <Text style={[styles.uploadBtnText, { color: theme.textInverse }]}>Upload</Text>
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
              Your documents are end-to-end encrypted and accessible only by you.
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
          ]}
        >
          <Search size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.textPrimary },
              Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
            ]}
            placeholder="Search documents by title..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories Pills */}
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
          <PlayfulCard key={doc.id} delay={idx * 70}>
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
                  <View style={styles.docMetaRow}>
                    <Text style={[styles.docMetaText, { color: theme.textMuted }]}>
                      {doc.category} • {doc.size} • {doc.updatedAt}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.docRight}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDocAction('Preview', doc.title)}
                  style={[styles.iconBtn, { backgroundColor: theme.inputBg }]}
                >
                  <Eye size={15} color={theme.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDocAction('Download', doc.title)}
                  style={[styles.iconBtn, { backgroundColor: theme.inputBg, marginLeft: 6 }]}
                >
                  <Download size={15} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </PlayfulCard>
        ))}
      </ScrollView>

      <TimedDialog
        visible={dialogVisible}
        title="Vault Action"
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
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 11.5,
    marginTop: 2,
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
  catScroll: {
    marginBottom: 16,
  },
  catPill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  catText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
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
    fontWeight: '700',
    fontFamily: typography.fontFamily,
  },
  docMetaRow: {
    marginTop: 4,
  },
  docMetaText: {
    fontSize: 11.5,
  },
  docRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
