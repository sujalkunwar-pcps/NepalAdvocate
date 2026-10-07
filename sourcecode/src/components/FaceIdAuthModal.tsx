import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { ScanFace, Check, X, Shield, Lock } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface FaceIdAuthModalProps {
  visible: boolean;
  accountName?: string;
  accountEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const FaceIdAuthModal: React.FC<FaceIdAuthModalProps> = ({
  visible,
  accountName,
  accountEmail,
  onSuccess,
  onCancel,
}) => {
  const { theme, mode } = useTheme();
  const [scanState, setScanState] = useState<'scanning' | 'success' | 'failed'>('scanning');

  // Animation values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.92)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let scanTimeout: any;
    let successTimeout: any;
    let scanAnimationLoop: Animated.CompositeAnimation | null = null;
    let pulseAnimationLoop: Animated.CompositeAnimation | null = null;

    if (visible) {
      setScanState('scanning');
      scanLineAnim.setValue(0);
      checkScaleAnim.setValue(0);

      // Card entrance animation
      Animated.parallel([
        Animated.timing(cardScaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        Animated.timing(cardOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Scan laser loop
      scanAnimationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ])
      );
      scanAnimationLoop.start();

      // Pulsing frame loop
      pulseAnimationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimationLoop.start();

      // Simulate authentic biometric scan verification interval (1.4 seconds)
      scanTimeout = setTimeout(() => {
        if (scanAnimationLoop) scanAnimationLoop.stop();
        if (pulseAnimationLoop) pulseAnimationLoop.stop();

        setScanState('success');

        Animated.spring(checkScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }).start();

        // Trigger success callback
        successTimeout = setTimeout(() => {
          onSuccess();
        }, 800);
      }, 1400);
    } else {
      setScanState('scanning');
    }

    return () => {
      if (scanTimeout) clearTimeout(scanTimeout);
      if (successTimeout) clearTimeout(successTimeout);
      if (scanAnimationLoop) scanAnimationLoop.stop();
      if (pulseAnimationLoop) pulseAnimationLoop.stop();
    };
  }, [visible]);

  if (!visible) return null;

  const isDark = mode === 'dark';
  const laserTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-36, 36],
  });

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
              opacity: cardOpacityAnim,
              transform: [{ scale: cardScaleAnim }],
            },
          ]}
        >
          {/* Header Title */}
          <View style={styles.headerRow}>
            <View style={styles.headerBadge}>
              <Lock size={12} color={isDark ? '#93C5FD' : '#2563EB'} style={{ marginRight: 4 }} />
              <Text style={[styles.headerBadgeText, { color: isDark ? '#93C5FD' : '#2563EB' }]}>
                Apple Face ID
              </Text>
            </View>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7} style={styles.closeBtn}>
              <X size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          {/* Account Subheader */}
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            NepalAdvocate Security
          </Text>
          <Text style={[styles.subText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {accountName ? `Verifying identity for ${accountName}` : 'Position your face in front of the camera'}
          </Text>

          {/* Face ID Scanner Frame */}
          <View style={styles.scannerContainer}>
            <Animated.View
              style={[
                styles.scannerBox,
                {
                  borderColor:
                    scanState === 'success'
                      ? '#10B981'
                      : isDark
                      ? '#3B82F6'
                      : '#2563EB',
                  transform: [{ scale: scanState === 'scanning' ? pulseAnim : 1 }],
                },
              ]}
            >
              {scanState === 'scanning' ? (
                <>
                  <ScanFace
                    size={64}
                    color={isDark ? '#60A5FA' : '#2563EB'}
                    strokeWidth={1.5}
                  />
                  <Animated.View
                    style={[
                      styles.scanLaser,
                      {
                        backgroundColor: isDark ? '#60A5FA' : '#2563EB',
                        transform: [{ translateY: laserTranslateY }],
                      },
                    ]}
                  />
                </>
              ) : (
                <Animated.View
                  style={[
                    styles.successCircle,
                    {
                      transform: [{ scale: checkScaleAnim }],
                    },
                  ]}
                >
                  <Check size={44} color="#FFFFFF" strokeWidth={3} />
                </Animated.View>
              )}
            </Animated.View>
          </View>

          {/* Status Text */}
          <View style={styles.statusRow}>
            {scanState === 'scanning' ? (
              <Text style={[styles.statusText, { color: isDark ? '#93C5FD' : '#2563EB' }]}>
                Scanning Face ID...
              </Text>
            ) : (
              <Text style={[styles.statusTextSuccess, { color: '#10B981' }]}>
                Face ID Recognized
              </Text>
            )}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onCancel}
            style={[
              styles.cancelButton,
              {
                backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
              },
            ]}
          >
            <Text style={[styles.cancelButtonText, { color: isDark ? '#E5E7EB' : '#374151' }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  scannerContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scannerBox: {
    width: 110,
    height: 110,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  scanLaser: {
    position: 'absolute',
    width: 80,
    height: 3,
    borderRadius: 2,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusRow: {
    marginBottom: 24,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statusTextSuccess: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FaceIdAuthModal;
