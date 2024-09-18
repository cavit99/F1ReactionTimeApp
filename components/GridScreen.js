// components/GridScreen.js
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isPortrait = height > width;

const GridScreen = ({ lights }) => {
  return (
    <View style={styles.gridContainer}>
      {lights.map((isOn, index) => (
        <View
          key={index}
          style={[
            styles.light,
            { backgroundColor: isOn ? '#ff0000' : '#800000' }, // Bright red when on, dark red when off
            isOn ? styles.lightOn : styles.lightOff,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: isPortrait ? 'row' : 'column',
    justifyContent: 'space-around',
    marginTop: 50,
  },
  light: {
    width: isPortrait ? width * 0.1 : height * 0.1,
    height: isPortrait ? width * 0.1 : height * 0.1,
    borderRadius: isPortrait ? width * 0.05 : height * 0.05,
    marginHorizontal: isPortrait ? 10 : 0,
    marginVertical: isPortrait ? 0 : 10,
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