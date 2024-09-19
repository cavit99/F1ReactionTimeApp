//App.js
//F1 Driver Start Reaction Time Practice App

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Alert,
  Dimensions,
  Platform 
} from 'react-native';
import GridScreen from './components/GridScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av'; // Updated import

// Configuration for grades and their corresponding feedback
const GRADE_CONFIG = [
  {
    label: 'Jump Start',
    condition: (time) => time < 0,
    feedbackMessage: 'You went too soon\nStewards would not like it.',
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
    feedbackMessage: 'Extraordinary reaction!\nBeyond typical F1 driver level',
    feedbackColor: '#28a745', // Green
    includeInBestTime: true,
  },
  {
    label: 'Excellent',
    condition: (time) => time >= 200 && time <= 250,
    feedbackMessage: 'Excellent reaction!\nTop F1 Driver Level.',
    feedbackColor: '#17a2b8', // Teal
    includeInBestTime: true,
  },
  {
    label: 'Very Good',
    condition: (time) => time >= 251 && time <= 270,
    feedbackMessage: 'Very Good!\nLikea good reaction from an F1 driver',
    feedbackColor: '#17a2b8', // Teal
    includeInBestTime: true,
  },
  {
    label: 'Good',
    condition: (time) => time >= 271 && time <= 300,
    feedbackMessage: 'Good!\nLike a decent reaction from an F1 driver',
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

const TOUCH_LATENCY_INITIAL = 60; // Initial touch latency in ms
const TOUCH_LATENCY_THRESHOLD = 2300; // Threshold in ms to start ramping down

const IGNORE_TAP_DELAY_MS = 500;

const App = () => {
  // State variables
  const initialState = {
    lightsOn: [false, false, false, false, false],
    sequenceStarted: false,
    readyToTap: false,
    reactionTime: null,
    grade: '',
    isPortrait: Dimensions.get('window').height > Dimensions.get('window').width,
    latency: 0,
  };

  const [state, setState] = useState(initialState);
  const [bestTime, setBestTime] = useState(null); // Separate state for bestTime
  const [isNewBestTime, setIsNewBestTime] = useState(false); // New state variable

  const startTimeRef = useRef(0);
  const timeoutRef = useRef(null);
  const sequenceRef = useRef(null);
  const touchLatencyDeductionRef = useRef(TOUCH_LATENCY_INITIAL);
  const sequenceStartTimeRef = useRef(0); // <-- Added ref

  // Audio references using expo-av
  const f1lightSoundRef = useRef(new Audio.Sound());
  const penaltySoundRef = useRef(new Audio.Sound());

  // Function to load sounds using expo-av
  const loadSounds = async () => {
    try {
      await f1lightSoundRef.current.loadAsync(require('./assets/F1lights.mp3'));
      await penaltySoundRef.current.loadAsync(require('./assets/penalty.wav'));
    } catch (error) {
      console.log('Failed to load sounds', error);
    }
  };

  // Load best time on component mount
  useEffect(() => {
    loadBestTime();
    const handleOrientationChange = () => {
      const isPortrait = Dimensions.get('window').height > Dimensions.get('window').width;
      setState(prevState => ({
        ...prevState,
        isPortrait: isPortrait,
      }));
    };

    // Initial orientation check
    handleOrientationChange();

    const subscription = Dimensions.addEventListener('change', handleOrientationChange);

    loadSounds();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (subscription && subscription.remove) {
        subscription.remove();
      }
      // Unload sounds
      f1lightSoundRef.current.unloadAsync();
      penaltySoundRef.current.unloadAsync();
    };
  }, []);

  // Auto-reset isNewBestTime after displaying
  useEffect(() => {
    if (isNewBestTime) {
      const timer = setTimeout(() => {
        setIsNewBestTime(false);
      }, 3000); // Reset after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isNewBestTime]);

  // Function to load best time from AsyncStorage
  const loadBestTime = async () => {
    try {
      const value = await AsyncStorage.getItem('@best_time');
      if (value !== null) {
        setBestTime(parseInt(value, 10));
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
      setBestTime(time);
    } catch (e) {
      console.error('Failed to save best time.', e);
    }
  };

  // Function to start the light sequence
  const startSequence = async () => {
    resetSequence(false); // Pass false to avoid resetting bestTime
    setState(prevState => ({ ...prevState, sequenceStarted: true }));

    // Record the start time of the sequence using the ref
    sequenceStartTimeRef.current = performance.now();

    try {
      // Illuminate lights sequentially
      for (let i = 0; i < 5; i++) {
        await illuminateLight(i, LIGHT_DELAY);
      }

      // Set a random delay before the user can tap
      const randomDelay = Math.random() * (MAX_RANDOM_DELAY - MIN_RANDOM_DELAY) + MIN_RANDOM_DELAY;
      console.log(`Random Delay: ${randomDelay}`); // Log the random delay

      // Compute touch latency deduction
      if (randomDelay > TOUCH_LATENCY_THRESHOLD) {
        const extraDelay = randomDelay - TOUCH_LATENCY_THRESHOLD;
        const maxExtraDelay = MAX_RANDOM_DELAY - TOUCH_LATENCY_THRESHOLD;
        const deduction = TOUCH_LATENCY_INITIAL * (1 - extraDelay / maxExtraDelay);
        touchLatencyDeductionRef.current = deduction > 0 ? deduction : 0;
      } else {
        touchLatencyDeductionRef.current = TOUCH_LATENCY_INITIAL;
      }
      console.log(`Touch Latency Deduction: ${touchLatencyDeductionRef.current}`); // Log the touch latency deduction

      sequenceRef.current = setTimeout(() => {
        setState(prevState => ({
          ...prevState,
          lightsOn: [false, false, false, false, false],
          readyToTap: true,
        }));
        startTimeRef.current = performance.now();
      }, randomDelay);
    } catch (error) {
      console.error('Error during light sequence:', error);
      Alert.alert('Error', 'An error occurred during the light sequence. Please try again.');
      resetSequence(false); // Pass false to avoid resetting bestTime
    }
  };

  // Helper function to illuminate a single light
  const illuminateLight = (index, delay) => {
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        setState(prevState => {
          const newLights = [...prevState.lightsOn];
          newLights[index] = true;
          return { ...prevState, lightsOn: newLights };
        });

        // Play F1 lights sound using expo-av
        try {
          await f1lightSoundRef.current.replayAsync();
        } catch (error) {
          console.log('F1lights sound playback failed', error);
        }

        resolve();
      }, delay);
    });
  };

  // Handle penalty sound playback
  const handlePenalitySound = async () => {
    try {
      await penaltySoundRef.current.replayAsync();
    } catch (error) {
      console.log('Penalty sound playback failed', error);
    }
  };

  // Function to handle user taps
  const handleTap = () => {
    if (!state.sequenceStarted) return; // Ignore taps if no sequence is running

    const currentTime = performance.now();
    if (currentTime - sequenceStartTimeRef.current < IGNORE_TAP_DELAY_MS) {
      // Ignore the tap if likely mistaken at the start
      return;
    }

    if (!state.readyToTap) {
      // User tapped too early - Jump Start
      clearTimeouts(); // Clear all ongoing timeouts
      setState(prevState => ({ ...prevState, lightsOn: [false, false, false, false, false] }));
      setState(prevState => ({ ...prevState, reactionTime: -1 }));
      setState(prevState => ({ ...prevState, grade: 'Jump Start' }));
      Alert.alert('Jump Start!', "You went too early\nStewards wouldn't like it");

      // Play penalty sound
      handlePenalitySound();

      setState(prevState => ({ ...prevState, sequenceStarted: false }));
      setState(prevState => ({ ...prevState, readyToTap: false }));
      return;
    }

    const endTime = performance.now();
    const reaction = endTime - startTimeRef.current;

    // Deduct touch latency
    const deduction = touchLatencyDeductionRef.current;
    const adjustedReaction = reaction - deduction;

    // Ensure reaction time is non-negative
    const validReaction = adjustedReaction >= 0 ? adjustedReaction : 0;

    setState(prevState => ({ ...prevState, reactionTime: Math.round(validReaction) }));
    setState(prevState => ({ ...prevState, readyToTap: false }));

    const assignedGrade = determineGrade(validReaction);
    setState(prevState => ({ ...prevState, grade: assignedGrade }));

    const gradeConfig = GRADE_CONFIG.find((g) => g.label === assignedGrade);
    const shouldInclude = gradeConfig ? gradeConfig.includeInBestTime : false;

    if (validReaction > 0 && shouldInclude && (!bestTime || validReaction < bestTime)) {
      saveBestTime(Math.round(validReaction));
      if (bestTime && validReaction < bestTime) {
        setIsNewBestTime(true); // Set to true only if it's not the first time
      } else if (!bestTime) {
        setIsNewBestTime(false); // Do not highlight on the first best time
      }
    } else {
      setIsNewBestTime(false); // Reset if not a new best
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
  // Added `preserveBestTime` parameter to control whether to reset bestTime
  const resetSequence = (preserveBestTime = true) => {
    if (preserveBestTime) {
      setState(initialState);
    } else {
      setState(prevState => ({
        ...initialState,
        bestTime: prevState.bestTime, // Retain the current bestTime
      }));
    }
    clearTimeouts(); // Ensure all timeouts are cleared
    startTimeRef.current = 0; // Reset the start time
  };

  // Function to reset best time
  const resetBestTime = async () => {
    try {
      await AsyncStorage.removeItem('@best_time');
      setBestTime(null);
      Alert.alert('Success', 'Best time has been reset.');
    } catch (e) {
      console.error('Failed to reset best time.', e);
      Alert.alert('Error', 'Failed to reset best time.');
    }
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
        {bestTime && state.reactionTime > 0 && (
          <Text
            style={[
              styles.resultText,
              isNewBestTime ? styles.newBestTimeText : null
            ]}
          >
            Best Time: {bestTime} ms
          </Text>
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

  const logDeviceInfo = () => {
    console.log(`Running on: ${Platform.OS}`);
  };

  useEffect(() => {
    logDeviceInfo();
  }, []);

  return (
    <TouchableOpacity 
      style={[styles.container, state.isPortrait ? styles.portraitContainer : styles.landscapeContainer]} 
      onPress={handleTap} 
      activeOpacity={1}
      testID="tap-area"
    >
      <GridScreen lights={state.lightsOn} />
      <View style={[styles.buttonContainer, state.isPortrait ? styles.portraitButtons : styles.landscapeButtons]}>
        {!state.sequenceStarted && !state.reactionTime && state.grade === '' && (
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={startSequence}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )}
        {renderFeedback()}
        {/* Add Reset Best Time Button */}
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={resetBestTime}
        >
          <Text style={styles.buttonText}>Reset Best Time</Text>
        </TouchableOpacity>
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
  portraitContainer: {
    flexDirection: 'column',
  },
  landscapeContainer: {
    flexDirection: 'column', // Keep as 'column' to prevent affecting GridScreen
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  portraitButtons: {
    marginTop: 50,
    width: '100%',
  },
  landscapeButtons: {
    marginLeft: 50,
    width: '50%',
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
  resetButton: {
    backgroundColor: '#dc3545', // Red color for reset button
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
  newBestTimeText: {
    color: '#28a745', // Green color
    fontWeight: 'bold',
  },
});

export { determineGrade };
export default App;