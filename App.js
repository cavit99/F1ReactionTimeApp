// App.js
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
        setBestTime(parseInt(value));
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
    // Illuminate lights one by one at one-second intervals
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => {
        setTimeout(() => {
          setLightsOn((prev) => {
            const newLights = [...prev];
            newLights[i] = true;
            return newLights;
          });
          resolve();
        }, 1000);
      });
    }

    // Random delay between 0.2 and 3 seconds
    const randomDelay = Math.random() * (3000 - 200) + 200;
    timeoutRef.current = setTimeout(() => {
      setLightsOn([false, false, false, false, false]);
      setReadyToTap(true);
      startTimeRef.current = Date.now();
    }, randomDelay);
  };

  // Function to handle user taps
  const handleTap = () => {
    if (!readyToTap) {
      // User tapped too early - Anticipatory (Jump Start)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setReactionTime(-1); // Indicate jump start with -1
      setGrade('Anticipatory');
      Alert.alert('Too Soon!', 'You tapped before the lights went out.');
      resetSequence();
      return;
    }
    const endTime = Date.now();
    const reaction = endTime - startTimeRef.current;
    setReactionTime(reaction);
    setReadyToTap(false);
    setGrade(determineGrade(reaction));
    if (!bestTime || reaction < bestTime) {
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

  // Function to determine grade based on reaction time
  const determineGrade = (time) => {
    if (time < 150) return 'Anticipatory'; // Just in case
    if (time >= 150 && time <= 199) return 'Excellent';
    if (time >= 200 && time <= 250) return 'Very Good';
    if (time >= 251 && time <= 300) return 'OK';
    if (time > 300) return 'Slow';
    return '';
  };

  // Function to render feedback based on grade
  const renderFeedback = () => {
    if (!grade) return null;

    let feedbackMessage = '';
    let feedbackColor = '';

    switch (grade) {
      case 'Anticipatory':
        feedbackMessage = 'Too fast; likely guessed the start.';
        feedbackColor = '#dc3545'; // Red
        break;
      case 'Excellent':
        feedbackMessage = 'Super quick reaction!';
        feedbackColor = '#28a745'; // Green
        break;
      case 'Very Good':
        feedbackMessage = 'Pretty fast.';
        feedbackColor = '#17a2b8'; // Teal
        break;
      case 'OK':
        feedbackMessage = 'Decent, but can get better.';
        feedbackColor = '#ffc107'; // Yellow
        break;
      case 'Slow':
        feedbackMessage = 'Needs improvement.';
        feedbackColor = '#fd7e14'; // Orange
        break;
      default:
        feedbackMessage = '';
    }

    return (
      <View style={styles.resultContainer}>
        {reactionTime !== null && reactionTime !== -1 && (
          <Text style={styles.resultText}>Your Reaction Time: {reactionTime} ms</Text>
        )}
        {reactionTime === -1 && (
          <Text style={styles.resultText}>Jump Start Detected!</Text>
        )}
        {bestTime && reactionTime !== -1 && (
          <Text style={styles.resultText}>Best Time: {bestTime} ms</Text>
        )}
        {grade === 'Anticipatory' ? (
          <Text style={[styles.feedbackText, { color: feedbackColor }]}>{feedbackMessage}</Text>
        ) : (
          <Text style={[styles.feedbackText, { color: feedbackColor }]}>{grade}: {feedbackMessage}</Text>
        )}
        <TouchableOpacity style={styles.retryButton} onPress={startSequence}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
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
          <TouchableOpacity style={styles.startButton} onPress={startSequence}>
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

export default App;