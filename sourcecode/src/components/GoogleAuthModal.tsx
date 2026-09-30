import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { Check, X, Shield, User, Briefcase } from 'lucide-react-native';

interface GoogleAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (profile: { email: string; name: string; role: 'CLIENT' | 'LAWYER' }) => void;
  initialRole?: 'CLIENT' | 'LAWYER';
}

const GoogleIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialRole = 'CLIENT',
}) => {
  const { theme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'LAWYER'>(initialRole);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const googleAccounts = [
    {
      name: 'Sujal Kunwar',
      email: 'sujalkunwar@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    },
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
  ];

  const handleConfirm = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      let chosenEmail = googleAccounts[selectedAccountIndex].email;
      let chosenName = googleAccounts[selectedAccountIndex].name;

      if (showCustom && customEmail.trim()) {
        chosenEmail = customEmail.trim();
        chosenName = customName.trim() || 'Google User';
      }

      setIsAuthenticating(false);
      onSuccess({
        email: chosenEmail,
        name: chosenName,
        role: selectedRole,
      });
    }, 700);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <GoogleIcon size={24} />
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                Sign in with Google
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Choose an account to continue to <Text style={{ fontWeight: '700', color: theme.textPrimary }}>NepalAdvocate</Text>
          </Text>

          {/* Role Selection */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>SELECT ROLE</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedRole('CLIENT')}
              style={[
                styles.roleOption,
                {
                  borderColor: selectedRole === 'CLIENT' ? theme.primary : theme.cardBorder,
                  backgroundColor: selectedRole === 'CLIENT' ? theme.primary + '15' : 'transparent',
                },
              ]}
            >
              <User size={16} color={selectedRole === 'CLIENT' ? theme.primary : theme.textSecondary} />
              <Text
                style={[
                  styles.roleText,
                  { color: selectedRole === 'CLIENT' ? theme.primary : theme.textSecondary },
                  selectedRole === 'CLIENT' && { fontWeight: '700' },
                ]}
              >
                Client
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedRole('LAWYER')}
              style={[
                styles.roleOption,
                {
                  borderColor: selectedRole === 'LAWYER' ? theme.primary : theme.cardBorder,
                  backgroundColor: selectedRole === 'LAWYER' ? theme.primary + '15' : 'transparent',
                },
              ]}
            >
              <Briefcase size={16} color={selectedRole === 'LAWYER' ? theme.primary : theme.textSecondary} />
              <Text
                style={[
                  styles.roleText,
                  { color: selectedRole === 'LAWYER' ? theme.primary : theme.textSecondary },
                  selectedRole === 'LAWYER' && { fontWeight: '700' },
                ]}
              >
                Advocate
              </Text>
            </TouchableOpacity>
          </View>

          {/* Google Accounts List */}
          <View style={styles.accountsList}>
            {!showCustom ? (
              <>
                {googleAccounts.map((acc, idx) => {
                  const isSelected = selectedAccountIndex === idx;
                  return (
                    <TouchableOpacity
                      key={acc.email}
                      activeOpacity={0.7}
                      onPress={() => setSelectedAccountIndex(idx)}
                      style={[
                        styles.accountItem,
                        { borderColor: isSelected ? theme.primary : theme.cardBorder },
                        isSelected && { backgroundColor: theme.primary + '10' },
                      ]}
                    >
                      <Image source={{ uri: acc.avatar }} style={styles.accountAvatar} />
                      <View style={styles.accountDetails}>
                        <Text style={[styles.accountName, { color: theme.textPrimary }]}>{acc.name}</Text>
                        <Text style={[styles.accountEmail, { color: theme.textMuted }]}>{acc.email}</Text>
                      </View>
                      {isSelected && (
                        <View style={[styles.checkCircle, { backgroundColor: theme.primary }]}>
                          <Check size={14} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowCustom(true)}
                  style={styles.useAnotherAccount}
                >
                  <Text style={[styles.useAnotherText, { color: theme.primary }]}>
                    + Use another Google account
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.customInputBox}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.textPrimary,
                      borderColor: theme.cardBorder,
                      backgroundColor: theme.background,
                    },
                    Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                  ]}
                  placeholder="Full Name (e.g. Sujal Kunwar)"
                  placeholderTextColor={theme.textMuted}
                  value={customName}
                  onChangeText={setCustomName}
                />
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      marginTop: 8,
                      color: theme.textPrimary,
                      borderColor: theme.cardBorder,
                      backgroundColor: theme.background,
                    },
                    Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                  ]}
                  placeholder="Google Email (e.g. name@gmail.com)"
                  placeholderTextColor={theme.textMuted}
                  value={customEmail}
                  onChangeText={setCustomEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowCustom(false)}
                  style={{ marginTop: 8 }}
                >
                  <Text style={{ fontSize: 12, color: theme.textMuted }}>
                    ← Back to saved accounts
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyBox}>
            <Shield size={14} color={theme.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.privacyText, { color: theme.textMuted }]}>
              To continue, Google securely shares your name, email, and profile image with NepalAdvocate.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={[styles.cancelBtn, { borderColor: theme.cardBorder }]}
            >
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleConfirm}
              disabled={isAuthenticating}
              style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
            >
              {isAuthenticating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmText}>Continue with Google</Text>
              )}
            </TouchableOpacity>
          </View>
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
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: typography.semiBold,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
    fontFamily: typography.regular,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '700',
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  roleText: {
    fontSize: 13,
    fontFamily: typography.medium,
  },
  accountsList: {
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  accountAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: typography.medium,
  },
  accountEmail: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: typography.regular,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useAnotherAccount: {
    paddingVertical: 6,
  },
  useAnotherText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: typography.medium,
  },
  customInputBox: {
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: typography.regular,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  privacyText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: typography.medium,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: typography.semiBold,
  },
});
