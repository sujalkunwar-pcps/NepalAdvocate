import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Easing,
  Platform,
} from 'react-native';
import { ShieldCheck, Scale } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2500,
}) => {
  const { theme, mode } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  // Motion Drivers (LottieFiles Motion Design Skill)
  const gridOpacity = useRef(new Animated.Value(0)).current;
  const vertLineHeight = useRef(new Animated.Value(0)).current;
  const horizLineWidth = useRef(new Animated.Value(0)).current;

  const contentScale = useRef(new Animated.Value(0.85)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const goldLineWidth = useRef(new Animated.Value(0)).current;

  // Curtain Panels (ScaleX 0 -> 1 -> 0, contained 100% inside screen - ZERO offscreen translation!)
  const curtainScaleX = useRef(new Animated.Value(0)).current;

  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Stage 1: Gridlines Draw (0ms - 400ms)
    Animated.parallel([
      Animated.timing(gridOpacity, {
        toValue: 0.7,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(vertLineHeight, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(horizLineWidth, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Stage 2: Central Content Scale & Fade (100ms)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(contentScale, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.back(1.15)),
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    // Stage 3: Gold Line Draw (250ms)
    setTimeout(() => {
      Animated.timing(goldLineWidth, {
        toValue: 32,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, 250);

    // Stage 4: Curtain Wipe Entrance at Exit (ScaleX 0 -> 1)
    const curtainTriggerTime = Math.max(1200, duration - 600);
    setTimeout(() => {
      Animated.timing(curtainScaleX, {
        toValue: 1,
        duration: 450,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, curtainTriggerTime);

    // Stage 5: Exit Fade & Finish
    const exitTimer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, duration);

    return () => clearTimeout(exitTimer);
  }, [duration]);

  const isDark = mode === 'dark';
  const gridColor = isDark ? 'rgba(248, 250, 252, 0.14)' : 'rgba(15, 23, 42, 0.09)';
  const accentGold = '#F59E0B';

  const vertHeightInterp = vertLineHeight.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '75%'],
  });

  const horizWidthInterp = horizLineWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '85%'],
  });

  const responsiveTitleSize = Math.max(18, Math.min(windowWidth * 0.055, 24));

  return (
    <Animated.View
      style={[
        styles.fullContainer,
        {
          backgroundColor: theme.background,
          opacity: containerOpacity,
        },
      ]}
    >
      {/* Layer 1: Architectural Gridlines */}
      <Animated.View style={[styles.gridLayer, { opacity: gridOpacity }]}>
        <Animated.View
          style={[
            styles.verticalGridline,
            {
              height: vertHeightInterp,
              backgroundColor: gridColor,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.horizontalGridline,
            {
              width: horizWidthInterp,
              backgroundColor: gridColor,
            },
          ]}
        />

        {/* Corner Geometry Frame Markers */}
        <View style={[styles.cornerMarker, styles.cornerTopLeft, { borderColor: gridColor }]} />
        <View style={[styles.cornerMarker, styles.cornerTopRight, { borderColor: gridColor }]} />
        <View style={[styles.cornerMarker, styles.cornerBottomLeft, { borderColor: gridColor }]} />
        <View style={[styles.cornerMarker, styles.cornerBottomRight, { borderColor: gridColor }]} />
      </Animated.View>

      {/* Layer 2: Central Hero Brand Content (Fully Visible & Centered) */}
      <Animated.View
        style={[
          styles.centerHero,
          {
            opacity: contentOpacity,
            transform: [{ scale: contentScale }],
          },
        ]}
      >
        <View style={[styles.iconBadge, { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder }]}>
          <Scale size={28} color={theme.textPrimary} />
        </View>

        <Text style={[styles.brandTitle, { color: theme.textPrimary, fontSize: responsiveTitleSize }]}>
          NEPAL ADVOCATE
        </Text>

        <View style={styles.goldDividerRow}>
          <Animated.View style={[styles.goldLine, { width: goldLineWidth, backgroundColor: accentGold }]} />
          <View style={[styles.goldDot, { backgroundColor: accentGold }]} />
          <Animated.View style={[styles.goldLine, { width: goldLineWidth, backgroundColor: accentGold }]} />
        </View>

        <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
          DIGITAL JUSTICE & LEGAL NETWORK
        </Text>
      </Animated.View>

      {/* Footer Network Badge */}
      <Animated.View style={[styles.footer, { opacity: contentOpacity }]}>
        <View style={[styles.verifiedPill, { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder }]}>
          <ShieldCheck size={13} color={theme.textPrimary} style={{ marginRight: 6 }} />
          <Text style={[styles.verifiedPillText, { color: theme.textPrimary }]}>
            OFFICIAL LEGAL PLATFORM OF NEPAL
          </Text>
        </View>
      </Animated.View>

      {/* Layer 3: Exit Curtain Wipe Panels (Contained 100% inside screen - scaleX reveal) */}
      <Animated.View
        style={[
          styles.curtainPanel,
          styles.leftCurtain,
          {
            backgroundColor: theme.cardBackground,
            transform: [{ scaleX: curtainScaleX }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.curtainPanel,
          styles.rightCurtain,
          {
            backgroundColor: theme.cardBackground,
            transform: [{ scaleX: curtainScaleX }],
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    ...(StyleSheet.absoluteFill as any),
    zIndex: 9999,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridLayer: {
    ...(StyleSheet.absoluteFill as any),
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  verticalGridline: {
    position: 'absolute',
    width: 1.5,
  },
  horizontalGridline: {
    position: 'absolute',
    height: 1.5,
  },
  cornerMarker: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderWidth: 1.5,
  },
  cornerTopLeft: {
    top: '8%',
    left: '6%',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: '8%',
    right: '6%',
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: '8%',
    left: '6%',
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: '8%',
    right: '6%',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  centerHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '90%',
    maxWidth: 420,
    zIndex: 10,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: 4,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
  goldDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  goldLine: {
    height: 1.5,
  },
  goldDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 8,
  },
  brandSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 1.8,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 28,
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 16,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  verifiedPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  curtainPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '51%',
    height: '100%',
    zIndex: 20,
  },
  leftCurtain: {
    left: 0,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.08)',
  },
  rightCurtain: {
    right: 0,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.08)',
  },
});
