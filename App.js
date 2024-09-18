import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Alert 
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
    condition: (time) => time > 0 && time < 100, // MIN_REACTION_TIME = 100ms
    feedbackMessage: 'Your reaction was incredibly fast!',
    feedbackColor: '#ffc107', // Yellow
    includeInBestTime: false,
  },
  {
    label: 'Extraordinary',
    condition: (time) => time >= 100 && time <= 199,
    feedbackMessage: 'Extraordinary reaction!',
    feedbackColor: '#28a745', // Green
    includeInBestTime: true,
  },
  {
    label: 'Excellent',
    condition: (time) => time >= 200 && time <= 250,
    feedbackMessage: 'Excellent reaction! Top F1 Driver Level!',
    feedbackColor: '#17a2b8', // Teal
    includeInBestTime: true,
  },
  {
    label: 'Very Good',
    condition: (time) => time >= 251 && time <= 270,
    feedbackMessage: 'Very Good! Equivalent to a decent reaction from an F1 driver',
    feedbackColor: '#17a2b8', // Teal
    includeInBestTime: true,
  },
  {
    label: 'Good',
    condition: (time) => time >= 271 && time <= 300,
    feedbackMessage: 'Good, equivalent to a slow reaction from an F1 driver',
    feedbackColor: '#ffc107', // Yellow
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
    condition: (time) => time >= 351 && time <= 400,
    feedbackMessage: 'Needs improvement',
    feedbackColor: '#ffc107', // Yellow
    includeInBestTime: true,
  },
  {
    label: 'Very Slow',
    condition: (time) => time > 401,
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
  return '';
};

const App = () => {
  // State variables
  const [lightsOn, setLightsOn] = useState([false, false, false, false, false]);
  const [sequenceStarted, setSequenceStarted] = useState(false);
  const [readyToTap, setReadyToTap] = useState(false);
  const [reactionTime, setReactionTime] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [grade, setGrade] = useState('');

  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  // Load best time on component mount
  useEffect(() => {
    loadBestTime();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Function to load best time from AsyncStorage
  const loadBestTime = async () => {
    try {
      const value = await AsyncStorage.getItem('@best_time');
      if (value !== null) {
        setBestTime(parseInt(value, 10));
      }
    } catch (e) {
      console.error('Failed to load best time.', e);
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
    resetSequence();
    setSequenceStarted(true);

    try {
      // Illuminate lights one by one at one-second intervals
      for (let i = 0; i < 5; i++) {
        await illuminateLight(i, 1000);
      }

      // Random delay between 0.2 and 3 seconds
      const randomDelay = Math.random() * (3000 - 200) + 200;
      timeoutRef.current = setTimeout(() => {
        setLightsOn([false, false, false, false, false]);
        setReadyToTap(true);
        startTimeRef.current = Date.now();
      }, randomDelay);
    } catch (error) {
      console.error('Error during light sequence:', error);
      resetSequence(); // Reset in case of any unexpected errors
    }
  };

  // Helper function to illuminate a single light
  const illuminateLight = (index, delay) => {
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(() => {
        setLightsOn((prev) => {
          const newLights = [...prev];
          newLights[index] = true;
          return newLights;
        });
        resolve();
      }, delay);
    });
  };

  // Function to handle user taps
  const handleTap = () => {
    if (!sequenceStarted) return; // Ignore taps if no sequence is running

    if (!readyToTap) {
      // User tapped too early - Jump Start
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setReactionTime(-1); // Indicate jump start with -1
      setGrade('Jump Start');
      Alert.alert('Jump Start!', 'You tapped before the lights signaled.');
      resetSequence(); // Ensure the sequence resets
      return;
    }

    const endTime = Date.now();
    const reaction = endTime - startTimeRef.current;
    setReactionTime(reaction);
    setReadyToTap(false);
    const assignedGrade = determineGrade(reaction);
    setGrade(assignedGrade);

    // Find grade configuration to decide on saving best time
    const gradeConfig = GRADE_CONFIG.find((g) => g.label === assignedGrade);
    const shouldInclude = gradeConfig ? gradeConfig.includeInBestTime : false;

    if (reaction > 0 && shouldInclude && (!bestTime || reaction < bestTime)) {
      saveBestTime(reaction);
    }
  };

  // Function to reset the sequence
  const resetSequence = () => {
    setLightsOn([false, false, false, false, false]);
    setSequenceStarted(false);
    setReadyToTap(false);
    setReactionTime(null);
    setGrade('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Function to render feedback based on grade
  const renderFeedback = () => {
    if (!grade) return null;

    let feedbackMessage = '';
    let feedbackColor = '';
    let showRetry = true;

    const gradeEntry = GRADE_CONFIG.find((g) => g.label === grade);
    if (gradeEntry) {
      feedbackMessage = gradeEntry.feedbackMessage;
      feedbackColor = gradeEntry.feedbackColor;
      showRetry = grade !== 'Jump Start'; // Do not show retry for Jump Start
    }

    return (
      <View style={styles.resultContainer}>
        {reactionTime !== null && reactionTime !== -1 && (
          <Text style={styles.resultText}>Your Reaction Time: {reactionTime} ms</Text>
        )}
        {reactionTime === -1 && (
          <Text style={styles.resultText}>Jump Start Detected!</Text>
        )}
        {bestTime && reactionTime > 0 && (
          <Text style={styles.resultText}>Best Time: {bestTime} ms</Text>
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
      delayPressIn={0}
    >
      <GridScreen lights={lightsOn} />
      <View style={styles.buttonContainer}>
        {!sequenceStarted && !reactionTime && grade === '' && (
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