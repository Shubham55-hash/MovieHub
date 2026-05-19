import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface RatingBadgeProps {
  rating: number;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ rating }) => {
  const formattedRating = rating.toFixed(1);
  const getBadgeColor = () => {
    if (rating >= 7.5) return '#4caf50';
    if (rating >= 5) return '#ff9800';
    return '#f44336';
  };

  return (
    <View style={[styles.container, { backgroundColor: getBadgeColor() }]}>
      <Text style={styles.text}>★ {formattedRating}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
