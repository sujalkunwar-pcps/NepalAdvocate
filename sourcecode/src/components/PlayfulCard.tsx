import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

interface PlayfulCardProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  overshoot?: number; // 1.4 - 1.8 for Playful bounce
  style?: StyleProp<ViewStyle>;
}

export const PlayfulCard: React.FC<PlayfulCardProps> = ({
  children,
  delay = 0,
  duration = 360,
  overshoot = 1.5,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.86)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 0.85,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: duration,
          easing: Easing.out(Easing.back(overshoot)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: duration,
          easing: Easing.out(Easing.back(overshoot)),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, overshoot]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: opacityAnim,
          transform: [
            { translateY: translateYAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
