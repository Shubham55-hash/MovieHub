import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingFooterProps {
  visible: boolean;
}

export const LoadingFooter: React.FC<LoadingFooterProps> = ({ visible }) => {
  if (!visible) return <View style={styles.empty} />;
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    height: 20,
  },
});
