// App.js
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

const App = () => {
  const [lightsOn, setLightsOn] = useState([false, false, false, false, false]);
  const [sequenceStarted, setSequenceStarted] = useState(false);
  const [readyToTap, setReadyToTap] = useState(false);
  const [reactionTime, setReactionTime] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    loadBestTime();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  const saveBestTime = async (time) => {
    try {
      await AsyncStorage.setItem('@best_time', time.toString());
      setBestTime(time);
    } catch (e) {
      console.error('Failed to save best time.', e);
    }
  };

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

  const handleTap = () => {
    if (!readyToTap) {
      // User tapped too early
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      Alert.alert('Too Soon!', 'You tapped before the lights went out.');
      resetSequence();
      return;
    }
    const endTime = Date.now();
    const reaction = endTime - startTimeRef.current;
    setReactionTime(reaction);
    setReadyToTap(false);
    if (!bestTime || reaction < bestTime) {
      saveBestTime(reaction);
    }
  };

  const resetSequence = () => {
    setLightsOn([false, false, false, false, false]);
    setSequenceStarted(false);
    setReadyToTap(false);
    setReactionTime(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const renderFeedback = () => {
    if (reactionTime === null) return null;

    let feedback = '';
    if (reactionTime < 200) {
      feedback = 'Excellent!';
    } else if (reactionTime < 300) {
      feedback = 'Great!';
    } else if (reactionTime < 400) {
      feedback = 'Good!';
    } else if (reactionTime < 500) {
      feedback = 'Not Bad!';
    } else {
      feedback = 'Keep Practicing!';
    }

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>Your Reaction Time: {reactionTime} ms</Text>
        {bestTime && <Text style={styles.resultText}>Best Time: {bestTime} ms</Text>}
        <Text style={styles.feedbackText}>{feedback}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={startSequence}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleTap}>
      <GridScreen lights={lightsOn} />
      <View style={styles.buttonContainer}>
        {!sequenceStarted && !reactionTime && (
          <TouchableOpacity style={styles.startButton} onPress={startSequence}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )}
        {renderFeedback()}
      </View>
    </TouchableOpacity>
  );
};

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
  },
});

export default App;