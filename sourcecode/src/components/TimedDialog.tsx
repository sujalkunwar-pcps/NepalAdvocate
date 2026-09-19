import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface TimedDialogProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
  autoCloseSeconds?: number;
}

export const TimedDialog: React.FC<TimedDialogProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onDismiss,
  autoCloseSeconds = 3,
}) => {
  const { theme } = useTheme();
  const { t } = useAuth();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoCloseSeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [visible, autoCloseSeconds]);

  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialogCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.iconContainer}>
            {isSuccess ? (
              <CheckCircle2 size={38} color={theme.success} />
            ) : (
              <AlertCircle size={38} color={theme.error} />
            )}
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.button,
              { backgroundColor: isSuccess ? theme.success : theme.primary },
            ]}
            onPress={onDismiss}
          >
            <Text style={[styles.buttonText, { color: theme.textInverse }]}>{t.ok}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
