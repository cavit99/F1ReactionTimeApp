//App.js
//F1 Driver Start Reaction Time Practice App

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Alert,
  Dimensions 
} from 'react-native';
import GridScreen from './components/GridScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration for grades and their corresponding feedback
const GRADE_CONFIG = [
  {
    label: 'Jump Start',
    condition: (time) => time < 0,
    feedbackMessage: 'You tapped too soon!',
    feedbackColor: '#dc3545', // Red
    includeInBestTime: false,
  },
  {
    label: 'Anticipatory',
    condition: (time) => time > 0 && time < 100,
    feedbackMessage: 'Superhuman reaction. Really!',
    feedbackColor: '#dc3545', // Red
    includeInBestTime: false,
  },
  {
    label: 'Extraordinary',
    condition: (time) => time >= 100 && time <= 199,
    feedbackMessage: 'Extraordinary reaction! Beyond typical F1 driver level',
    feedbackColor: '#28a745', // Green
    includeInBestTime: true,
  },
  {
    label: 'Excellent',
    condition: (time) => time >= 200 && time <= 250,
    feedbackMessage: 'Excellent reaction! Top F1 Driver Level.',
    feedbackColor: '#17a2b8', // Teal
    includeInBestTime: true,
  },
  {
    label: 'Very Good',
    condition: (time) => time >= 251 && time <= 270,
    feedbackMessage: 'Very Good! Equivalent to a good reaction from an F1 driver',
    feedbackColor: '#17a2b8', // Teal
    includeInBestTime: true,
  },
  {
    label: 'Good',
    condition: (time) => time >= 271 && time <= 300,
    feedbackMessage: 'Good, equivalent to a decent reaction from an F1 driver',
    feedbackColor: '#17a2b8', // Teal
    includeInBestTime: true,
  },
  {
    label: 'OK',
    condition: (time) => time >= 301 && time <= 350,
    feedbackMessage: 'OK, but slower than F1 driver level',
    feedbackColor: '#ffc107', // Yellow
    includeInBestTime: true,
  },
  {
    label: 'Slow',
    condition: (time) => time >= 351 && time <= 450, // Expanded range
    feedbackMessage: 'Not bad but needs improvement',
    feedbackColor: '#ffc107', // Yellow
    includeInBestTime: true,
  },
  {
    label: 'Very Slow',
    condition: (time) => time > 450, // Adjusted range
    feedbackMessage: 'Were you sleeping? Concentrate!',
    feedbackColor: '#fd7e14', // Orange
    includeInBestTime: true,
  },
];

// Determine grade based on reaction time using GRADE_CONFIG
const determineGrade = (time) => {
  for (let grade of GRADE_CONFIG) {
    if (grade.condition(time)) {
      return grade.label;
    }
  }
  return ''; // Return an empty string if no grade matches
};

const LIGHT_DELAY = 1000;
const MIN_RANDOM_DELAY = 200;
const MAX_RANDOM_DELAY = 3000;

const TOUCH_LATENCY = 50; 

const App = () => {
  // State variables
  const initialState = {
    lightsOn: [false, false, false, false, false],
    sequenceStarted: false,
    readyToTap: false,
    reactionTime: null,
    bestTime: null,
    grade: '',
    isPortrait: Dimensions.get('window').height > Dimensions.get('window').width,
  };

  const [state, setState] = useState(initialState);

  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);
  const sequenceRef = useRef(null);

  // Load best time on component mount
  useEffect(() => {
    loadBestTime();
    const handleOrientationChange = () => {
      setState(prevState => ({
        ...prevState,
        isPortrait: Dimensions.get('window').height > Dimensions.get('window').width,
      }));
    };

    Dimensions.addEventListener('change', handleOrientationChange);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      Dimensions.removeEventListener('change', handleOrientationChange);
    };
  }, []);

  // Function to load best time from AsyncStorage
  const loadBestTime = async () => {
    try {
      const value = await AsyncStorage.getItem('@best_time');
      if (value !== null) {
        setState(prevState => ({ ...prevState, bestTime: parseInt(value, 10) }));
      }
    } catch (e) {
      console.error('Failed to load best time.', e);
      Alert.alert('Error', 'Failed to load best time.');
    }
  };

  // Function to save best time to AsyncStorage
  const saveBestTime = async (time) => {
    try {
      await AsyncStorage.setItem('@best_time', time.toString());
      setState(prevState => ({ ...prevState, bestTime: time }));
    } catch (e) {
      console.error('Failed to save best time.', e);
    }
  };

  // Function to start the light sequence
  const startSequence = async () => {
    resetSequence();
    setState(prevState => ({ ...prevState, sequenceStarted: true }));

    try {
      // Illuminate lights sequentially
      for (let i = 0; i < 5; i++) {
        await illuminateLight(i, LIGHT_DELAY);
      }

      // Set a random delay before the user can tap
      const randomDelay = Math.random() * (MAX_RANDOM_DELAY - MIN_RANDOM_DELAY) + MIN_RANDOM_DELAY;
      sequenceRef.current = setTimeout(() => {
        setState(prevState => ({
          ...prevState,
          lightsOn: [false, false, false, false, false],
          readyToTap: true,
        }));
        startTimeRef.current = Date.now();
      }, randomDelay);
    } catch (error) {
      console.error('Error during light sequence:', error);
      Alert.alert('Error', 'An error occurred during the light sequence. Please try again.');
      resetSequence();
    }
  };

  // Helper function to illuminate a single light
  const illuminateLight = (index, delay) => {
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(() => {
        setState(prevState => {
          const newLights = [...prevState.lightsOn];
          newLights[index] = true;
          return { ...prevState, lightsOn: newLights };
        });
        resolve();
      }, delay);
    });
  };

  // Function to handle user taps
  const handleTap = () => {
    if (!state.sequenceStarted) return; // Ignore taps if no sequence is running

    if (!state.readyToTap) {
      // User tapped too early - Jump Start
      clearTimeouts(); // Clear all ongoing timeouts
      setState(prevState => ({ ...prevState, lightsOn: [false, false, false, false, false] }));
      setState(prevState => ({ ...prevState, reactionTime: -1 }));
      setState(prevState => ({ ...prevState, grade: 'Jump Start' }));
      Alert.alert('Jump Start!', "You went too early, stewards wouldn't like it");
      setState(prevState => ({ ...prevState, sequenceStarted: false }));
      setState(prevState => ({ ...prevState, readyToTap: false }));
      return;
    }

    const endTime = Date.now();
    const reaction = endTime - startTimeRef.current - TOUCH_LATENCY; // Adjusted for touch latency
    setState(prevState => ({ ...prevState, reactionTime: reaction }));
    setState(prevState => ({ ...prevState, readyToTap: false }));

    const assignedGrade = determineGrade(reaction);
    setState(prevState => ({ ...prevState, grade: assignedGrade }));

    const gradeConfig = GRADE_CONFIG.find((g) => g.label === assignedGrade);
    const shouldInclude = gradeConfig ? gradeConfig.includeInBestTime : false;

    if (reaction > 0 && shouldInclude && (!state.bestTime || reaction < state.bestTime)) {
      saveBestTime(reaction);
    }
  };

  // Function to clear all timeouts
  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (sequenceRef.current) {
      clearTimeout(sequenceRef.current);
      sequenceRef.current = null;
    }
  };

  // Function to reset the sequence
  const resetSequence = () => {
    setState(initialState);
    clearTimeouts(); // Ensure all timeouts are cleared
    startTimeRef.current = null; // Reset the start time
  };

  // Function to render feedback based on grade
  const renderFeedback = () => {
    if (!state.grade) return null;

    let feedbackMessage = '';
    let feedbackColor = '';
    let showRetry = true;

    const gradeEntry = GRADE_CONFIG.find((g) => g.label === state.grade);
    if (gradeEntry) {
      feedbackMessage = gradeEntry.feedbackMessage;
      feedbackColor = gradeEntry.feedbackColor;
      showRetry = true; 
    }

    return (
      <View style={styles.resultContainer}>
        {state.reactionTime !== null && state.reactionTime !== -1 && (
          <Text style={styles.resultText}>Your Reaction Time: {state.reactionTime} ms</Text>
        )}
        {state.reactionTime === -1 && (
          <Text style={styles.resultText}>Jump Start Detected!</Text>
        )}
        {state.bestTime && state.reactionTime > 0 && (
          <Text style={styles.resultText}>Best Time: {state.bestTime} ms</Text>
        )}
        <Text style={[styles.feedbackText, { color: feedbackColor }]}>
          {feedbackMessage}
        </Text>
        {showRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={startSequence}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleTap} 
      activeOpacity={1}
      testID="tap-area"
    >
      <GridScreen lights={state.lightsOn} isPortrait={state.isPortrait} />
      <View style={styles.buttonContainer}>
        {!state.sequenceStarted && !state.reactionTime && state.grade === '' && (
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={startSequence}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )}
        {renderFeedback()}
      </View>
    </TouchableOpacity>
  );
};

// Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  buttonContainer: {
    marginTop: 50,
    alignItems: 'center',
    width: '100%',
  },
  startButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 20,
    marginVertical: 5,
  },
  feedbackText: {
    fontSize: 18,
    marginVertical: 10,
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
  },
});

export { determineGrade };
export default App;