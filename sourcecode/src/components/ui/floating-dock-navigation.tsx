import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  useWindowDimensions,
  PanResponder,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, Bell, User, Settings, Mail } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  key?: string;
  onClick?: () => void;
}

interface FloatingDockNavProps {
  items?: NavItem[];
  activeTabKey?: string;
  onSelectTab?: (key: string) => void;
}

export const FloatingDockNav: React.FC<FloatingDockNavProps> = ({
  items,
  activeTabKey,
  onSelectTab,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const defaultNavItems: NavItem[] = [
    { icon: <Home size={18} color={theme.textPrimary} />, label: 'Home', key: 'home' },
    { icon: <Search size={18} color={theme.textPrimary} />, label: 'Search', key: 'search' },
    { icon: <Bell size={18} color={theme.textPrimary} />, label: 'Notifications', key: 'notifications' },
    { icon: <Mail size={18} color={theme.textPrimary} />, label: 'Messages', key: 'messages' },
    { icon: <User size={18} color={theme.textPrimary} />, label: 'Profile', key: 'profile' },
    { icon: <Settings size={18} color={theme.textPrimary} />, label: 'Settings', key: 'settings' },
  ];

  const navItems = items || defaultNavItems;
  const itemCount = navItems.length;

  // Responsive sizes based on screen width
  const isSmallScreen = screenWidth < 380;
  const itemSize = isSmallScreen ? 38 : 44;
  const itemGap = isSmallScreen ? 4 : 8;
  const containerPaddingHorizontal = isSmallScreen ? 8 : 12;
  const maxScale = isSmallScreen ? 1.25 : 1.38;

  const scaleAnims = useRef(navItems.map(() => new Animated.Value(1))).current;
  const containerRef = useRef<View>(null);
  const containerLayout = useRef({ x: 0, width: 0 });

  const updateScales = (targetIndex: number | null) => {
    setHoveredIndex(targetIndex);

    navItems.forEach((_, index) => {
      let targetScale = 1;
      if (targetIndex !== null) {
        const distance = Math.abs(targetIndex - index);
        if (distance === 0) targetScale = maxScale;
        else if (distance === 1) targetScale = 1.16;
        else if (distance === 2) targetScale = 1.08;
      }

      Animated.spring(scaleAnims[index], {
        toValue: targetScale,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSelect = (item: NavItem, index: number) => {
    setActiveIndex(index);
    if (item.onClick) item.onClick();
    if (item.key && onSelectTab) onSelectTab(item.key);
  };

  // PanResponder to handle touch sliding across dock items on mobile
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touchX = evt.nativeEvent.locationX;
        calculateHoveredFromX(touchX);
      },
      onPanResponderMove: (evt) => {
        const touchX = evt.nativeEvent.locationX;
        calculateHoveredFromX(touchX);
      },
      onPanResponderRelease: (_, gestureState) => {
        const touchX = gestureState.x0 + gestureState.dx - containerLayout.current.x;
        const targetIndex = getIndexFromX(touchX);
        if (targetIndex !== null && targetIndex >= 0 && targetIndex < itemCount) {
          handleSelect(navItems[targetIndex], targetIndex);
        }
        updateScales(null);
      },
      onPanResponderTerminate: () => {
        updateScales(null);
      },
    })
  ).current;

  const getIndexFromX = (x: number): number | null => {
    const relativeX = x - containerPaddingHorizontal;
    const totalSlotWidth = itemSize + itemGap;
    const computedIndex = Math.floor(relativeX / totalSlotWidth);

    if (computedIndex >= 0 && computedIndex < itemCount) {
      return computedIndex;
    }
    return null;
  };

  const calculateHoveredFromX = (x: number) => {
    const idx = getIndexFromX(x);
    updateScales(idx);
  };

  const bottomInset = Math.max(insets.bottom + 8, Platform.OS === 'ios' ? 24 : 14);

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View
      style={[
        styles.dockPositioner,
        {
          bottom: bottomInset,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        ref={containerRef}
        onLayout={(e) => {
          containerLayout.current = {
            x: e.nativeEvent.layout.x,
            width: e.nativeEvent.layout.width,
          };
        }}
        style={[
          styles.dockContainer,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
            paddingHorizontal: containerPaddingHorizontal,
          },
        ]}
      >
        <View style={[styles.itemsRow, { gap: itemGap }]}>
          {navItems.map((item, index) => {
            const isItemActive = activeTabKey
              ? item.key === activeTabKey
              : activeIndex === index;

            return (
              <Animated.View
                key={item.key || index}
                style={[
                  styles.itemAnimatedWrapper,
                  {
                    transform: [
                      { scale: scaleAnims[index] },
                      {
                        translateY: scaleAnims[index].interpolate({
                          inputRange: [1, maxScale],
                          outputRange: [0, -5],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPressIn={() => updateScales(index)}
                  onPressOut={() => updateScales(null)}
                  onPress={() => {
                    handleSelect(item, index);
                    updateScales(null);
                  }}
                  // @ts-ignore web hover events for React Native Web
                  onMouseEnter={() => updateScales(index)}
                  onMouseLeave={() => updateScales(null)}
                  style={[
                    styles.navButton,
                    {
                      width: itemSize,
                      height: itemSize,
                      borderRadius: itemSize / 3,
                    },
                    isItemActive && { backgroundColor: theme.toggleBg },
                  ]}
                >
                  {/* Tooltip / Label preview on focus/touch */}
                  {hoveredIndex === index && (
                    <View style={styles.tooltipContainer}>
                      <View style={[styles.tooltipBubble, { backgroundColor: theme.textPrimary }]}>
                        <Text
                          style={[styles.tooltipText, { color: theme.cardBackground }]}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Text>
                      </View>
                      <View style={[styles.tooltipArrow, { borderTopColor: theme.textPrimary }]} />
                    </View>
                  )}

                  <View style={styles.iconContainer}>
                    {React.isValidElement(item.icon)
                      ? React.cloneElement(item.icon as React.ReactElement<any>, {
                          size: isSmallScreen ? 17 : 20,
                          color: isItemActive ? theme.primary : theme.textSecondary,
                        })
                      : item.icon}
                  </View>

                  {/* Active indicator dot */}
                  {isItemActive && (
                    <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockPositioner: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  dockContainer: {
    borderRadius: 26,
    borderWidth: 1,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    maxWidth: '92%',
  },
  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemAnimatedWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    zIndex: 1000,
  },
  tooltipBubble: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltipText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  activeDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
