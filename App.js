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
  Platform,
  Image 
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
  const [soundsLoaded, setSoundsLoaded] = useState(false); // New state variable to track sound loading

  const startTimeRef = useRef(0);
  const timeoutRef = useRef(null);
  const sequenceRef = useRef(null);
  const touchLatencyDeductionRef = useRef(TOUCH_LATENCY_INITIAL);
  const sequenceStartTimeRef = useRef(0); // <-- Added ref

  // Ref to track if a sequence is active
  const isSequenceActiveRef = useRef(false); // <-- Added ref

  // Audio references using expo-av
  const f1lightSoundRef = useRef(new Audio.Sound());
  const penaltySoundRef = useRef(new Audio.Sound());

  // Function to load sounds using expo-av
  const loadSounds = async () => {
    try {
      await f1lightSoundRef.current.loadAsync(require('./assets/F1lights.mp3'));
      await penaltySoundRef.current.loadAsync(require('./assets/penalty.wav'));
      setSoundsLoaded(true); // Update state when sounds are loaded
    } catch (error) {
      console.log('Failed to load sounds', error);
      Alert.alert('Error', 'Failed to load sounds. Please restart the app.');
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

    loadSounds(); // Start loading sounds

    logDeviceInfo();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (sequenceRef.current) {
        clearTimeout(sequenceRef.current);
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
    if (!soundsLoaded) {
      Alert.alert('Loading', 'Sounds are still loading. Please wait.');
      return;
    }

    resetSequence(false); // Pass false to avoid resetting bestTime
    setState(prevState => ({ ...prevState, sequenceStarted: true }));
    isSequenceActiveRef.current = true; // <-- Set ref to true

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
    return new Promise(async (resolve) => {
      timeoutRef.current = setTimeout(async () => {
        setState(prevState => {
          const newLights = [...prevState.lightsOn];
          newLights[index] = true;
          return { ...prevState, lightsOn: newLights };
        });

        // Play F1 lights sound using expo-av
        try {
          if (soundsLoaded) {
            await f1lightSoundRef.current.replayAsync();
          } else {
            console.log('F1 lights sound is not loaded yet.');
          }
        } catch (error) {
          console.log('F1lights sound playback failed', error);
        }

        resolve();
      }, delay);
    });
  };

  // Handle penalty sound playback
  const handlePenaltySound = async () => {
    try {
      if (soundsLoaded) {
        await penaltySoundRef.current.replayAsync();
      } else {
        console.log('Penalty sound is not loaded yet.');
      }
    } catch (error) {
      console.log('Penalty sound playback failed', error);
    }
  };

  // Function to handle user taps
  const handleTap = () => {
    // Check if a sequence is active using the ref
    if (!isSequenceActiveRef.current) return; // Ignore taps if no sequence is active

    const currentTime = performance.now();
    const sequenceStartTime = sequenceStartTimeRef.current;

    if (currentTime - sequenceStartTime < IGNORE_TAP_DELAY_MS) {
      // Ignore the tap if within the initial ignore delay
      return;
    }

    if (!state.readyToTap) {
      // User tapped too early - Jump Start
      clearTimeouts(); // Clear all ongoing timeouts
      setState(prevState => ({ 
        ...prevState, 
        lightsOn: [false, false, false, false, false],
        reactionTime: -1,
        grade: 'Jump Start',
        sequenceStarted: false,
        readyToTap: false
      }));
      
      // Set the ref to false since the sequence has ended
      isSequenceActiveRef.current = false;

      Alert.alert('Jump Start!', "You went too early\nStewards wouldn't like it");

      // Play penalty sound
      handlePenaltySound();

      return;
    }

    // If readyToTap is true, process the reaction time
    const endTime = performance.now();
    const reaction = endTime - startTimeRef.current;

    // Deduct touch latency
    const deduction = touchLatencyDeductionRef.current;
    const adjustedReaction = reaction - deduction;

    // Ensure reaction time is non-negative
    const validReaction = adjustedReaction >= 0 ? adjustedReaction : 0;

    setState(prevState => ({ 
      ...prevState, 
      reactionTime: Math.round(validReaction),
      readyToTap: false,
      sequenceStarted: false
    }));

    // Set the ref to false since the sequence has ended
    isSequenceActiveRef.current = false;

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
    isSequenceActiveRef.current = false; // Ensure the ref is reset
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
          <View style={styles.bestTimeContainer}>
            <Text
              style={[
                styles.resultText,
                isNewBestTime ? styles.newBestTimeText : null
              ]}
            >
              Best Time: {bestTime} ms
            </Text>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetBestTime}
            >
              <Image 
                source={require('./assets/icons8-reset-100.png')} 
                style={styles.resetButtonImage} 
              />
            </TouchableOpacity>
          </View>
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

  // Modify the return statement to adjust layout based on orientation
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        state.isPortrait ? styles.portraitContainer : styles.landscapeContainer
      ]} 
      onPress={handleTap} 
      activeOpacity={1}
      testID="tap-area"
    >
      {/* Position GridScreen differently based on orientation */}
      <View style={styles.gridScreenWrapper}>
        <GridScreen 
          lights={state.lightsOn} 
          isPortrait={state.isPortrait} // Pass isPortrait prop
        />
      </View>
      
      <View style={[
        styles.buttonContainer, 
        state.isPortrait ? styles.portraitButtons : styles.landscapeButtons
      ]}>
        {!state.sequenceStarted && !state.reactionTime && state.grade === '' && (
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={startSequence}
            disabled={!soundsLoaded} // Disable start if sounds aren't loaded
          >
            <Text style={styles.buttonText}>
              {soundsLoaded ? 'Start' : 'Loading...'}
            </Text>
          </TouchableOpacity>
        )}
        {renderFeedback()}
      </View>
    </TouchableOpacity>
  );
};

// Update the StyleSheet to include new styles
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
    flexDirection: 'column', 
    alignItems: 'flex-start', // Align items to the top
    justifyContent: 'space-between', // Space between GridScreen and buttons/feedback
  },
  gridScreenWrapper: {
    flex: 1,
    justifyContent: 'flex-start', // Align GridScreen to the top in landscape
    marginBottom: 20, // Add some spacing if needed
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Take remaining space
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
    width: 55, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 20, 
    borderWidth: 1, 
    borderColor: '#000',
    borderRadius: 5, 
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
  bestTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, // Add some margin to separate from other elements
  },
  resetButtonImage: {
    width: 20,
    height: 20,
  },
});

export { determineGrade };
export default App;