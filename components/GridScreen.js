// components/GridScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';

const GridScreen = ({ lights }) => {
  return (
    <View style={styles.gridContainer}>
      {lights.map((isOn, index) => (
        <View
          key={index}
          style={[
            styles.light,
            { backgroundColor: isOn ? '#ff0000' : '#800000' }, // Bright red when on, dark red when off
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 50,
  },
  light: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#800000', // Default dark red
    marginHorizontal: 10,
    opacity: 0.8,
  },
});

export default GridScreen;
