import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Scale } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

interface RoleSelectorProps {
  selectedRole: 'CLIENT' | 'LAWYER';
  onSelectRole: (role: 'CLIENT' | 'LAWYER') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
}) => {
  const { t } = useAuth();

  const isClient = selectedRole === 'CLIENT';
  const isLawyer = selectedRole === 'LAWYER';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t.iAmA}</Text>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectRole('CLIENT')}
          style={[styles.tab, isClient && styles.activeClientTab]}
        >
          <User
            size={18}
            color={isClient ? Colors.clientRole : Colors.textMuted}
            style={styles.icon}
          />
          <Text style={[styles.tabText, isClient && styles.activeClientText]}>
            {t.client}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectRole('LAWYER')}
          style={[styles.tab, isLawyer && styles.activeLawyerTab]}
        >
          <Scale
            size={18}
            color={isLawyer ? Colors.lawyerRole : Colors.textMuted}
            style={styles.icon}
          />
          <Text style={[styles.tabText, isLawyer && styles.activeLawyerText]}>
            {t.lawyer}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBackground,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeClientTab: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: Colors.clientRole,
  },
  activeLawyerTab: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: Colors.lawyerRole,
  },
  icon: {
    marginRight: 6,
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  activeClientText: {
    color: Colors.clientRole,
    fontWeight: '700',
  },
  activeLawyerText: {
    color: Colors.lawyerRole,
    fontWeight: '700',
  },
});
