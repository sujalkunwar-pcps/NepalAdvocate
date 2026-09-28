import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FloatingDockNav } from './floating-dock-navigation';

export default function DemoOne() {
  return (
    <View style={styles.container}>
      <FloatingDockNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});
