// components/GridScreen.js
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const GridScreen = ({ lights, isPortrait }) => {
  const { width, height } = Dimensions.get('window');
  // Calculate light size based on orientation
  let lightSize = (width - (2 * 10 * 5)) / 5; 

  if (!isPortrait) {
    lightSize *= 0.65; // Reduce size in landscape
  }

  return (
    <View
      style={[
        styles.gridContainer,
        !isPortrait && styles.landscapeGridContainer, // Apply additional styles in landscape
      ]}
    >
      {lights.map((isOn, index) => (
        <View
          key={index}
          style={[
            styles.light,
            { 
              backgroundColor: isOn ? '#ff0000' : '#800000', // Bright red when on, dark red when off
              width: lightSize,
              height: lightSize,
              borderRadius: lightSize / 2,
            },
            isOn ? styles.lightOn : styles.lightOff,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row', // Always horizontal
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 150, 
    width: '100%',
  },
  landscapeGridContainer: {
    marginTop: 40, 
  },
  light: {
    marginHorizontal: 10,
    opacity: 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5, // For Android shadow
  },
  lightOn: {
    // Additional styles when light is on
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
  },
  lightOff: {
    // Additional styles when light is off
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default GridScreen;