import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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
  const slideAnim = useRef(new Animated.Value(isClient ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isClient ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();
  }, [isClient]);

  const pillLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{t.iAmA}</Text>
      
      <View
        style={[
          styles.track,
          {
            backgroundColor: theme.toggleBg,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        {/* Animated Sliding Pill */}
        <Animated.View
          style={[
            styles.activePill,
            {
              left: pillLeft,
              backgroundColor: theme.cardBackground,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectRole('CLIENT')}
          style={styles.tab}
        >
          <User
            size={16}
            color={isClient ? theme.textPrimary : theme.textMuted}
            style={styles.icon}
          />
          <Text
            style={[
              styles.tabText,
              { color: isClient ? theme.textPrimary : theme.textMuted },
              isClient && styles.activeTabText,
            ]}
          >
            {t.client}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectRole('LAWYER')}
          style={styles.tab}
        >
          <Scale
            size={16}
            color={!isClient ? theme.textPrimary : theme.textMuted}
            style={styles.icon}
          />
          <Text
            style={[
              styles.tabText,
              { color: !isClient ? theme.textPrimary : theme.textMuted },
              !isClient && styles.activeTabText,
            ]}
          >
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
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  track: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 3,
    borderWidth: 1,
    position: 'relative',
    height: 46,
    alignItems: 'center',
  },
  activePill: {
    position: 'absolute',
    width: '50%',
    height: 38,
    borderRadius: 20,
    top: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 2,
  },
  icon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
});
