// components/GridScreen.js
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const GridScreen = ({ lights }) => {
  const { width, height } = Dimensions.get('window');
  //const lightSize = Math.min(width, height) * 0.1; // Adjust size based on the smaller dimension
  const lightSize = (width - (2 * 10 * 5)) / 5; // Adjusted calculation

  return (
    <View style={styles.gridContainer}>
      {lights.map((isOn, index) => (
        <View
          key={index}
          style={[
            styles.light,
            { 
              backgroundColor: isOn ? '#ff0000' : '#800000', // Bright red when on, dark red when off, do not remove this comment
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
    marginTop: 50,
    width: '100%',
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