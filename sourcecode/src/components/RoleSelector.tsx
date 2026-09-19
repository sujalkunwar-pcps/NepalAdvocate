import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Scale } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface RoleSelectorProps {
  selectedRole: 'CLIENT' | 'LAWYER';
  onSelectRole: (role: 'CLIENT' | 'LAWYER') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
}) => {
  const { theme } = useTheme();
  const { t } = useAuth();

  const isClient = selectedRole === 'CLIENT';
  const isLawyer = selectedRole === 'LAWYER';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{t.iAmA}</Text>
      <View style={[styles.tabsContainer, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectRole('CLIENT')}
          style={[
            styles.tab,
            isClient && {
              backgroundColor: theme.roleBadgeClientBg,
              borderColor: theme.roleBadgeClientText,
              borderWidth: 1,
            },
          ]}
        >
          <User
            size={16}
            color={isClient ? theme.roleBadgeClientText : theme.textMuted}
            style={styles.icon}
          />
          <Text style={[styles.tabText, { color: isClient ? theme.roleBadgeClientText : theme.textMuted }]}>
            {t.client}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectRole('LAWYER')}
          style={[
            styles.tab,
            isLawyer && {
              backgroundColor: theme.roleBadgeLawyerBg,
              borderColor: theme.roleBadgeLawyerText,
              borderWidth: 1,
            },
          ]}
        >
          <Scale
            size={16}
            color={isLawyer ? theme.roleBadgeLawyerText : theme.textMuted}
            style={styles.icon}
          />
          <Text style={[styles.tabText, { color: isLawyer ? theme.roleBadgeLawyerText : theme.textMuted }]}>
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
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
  },
  icon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
