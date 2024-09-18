//App.test.js

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import App from '../App';

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  StyleSheet: {
    create: jest.fn()
  }
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock GridScreen component
jest.mock('../components/GridScreen', () => 'GridScreen');

describe('App', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('renders start button and responds to tap', async () => {
    const { getByText, queryByText } = render(<App />);

    const startButton = getByText(/Start/i);
    expect(startButton).toBeTruthy();

    await act(async () => {
      fireEvent.press(startButton);
      jest.runAllTimers();
    });

    expect(queryByText(/Start/i)).toBeNull();
  });

  test('simulates light sequence and reacts to tap', async () => {
    const { getByText, getByTestId } = render(<App />);

    await act(async () => {
      fireEvent.press(getByText(/Start/i));
      jest.advanceTimersByTime(7000); // 5 seconds for lights + 2 seconds delay
    });

    await act(async () => {
      fireEvent.press(getByTestId('tap-area'));
    });

    expect(getByText(/Your Reaction Time:/i)).toBeTruthy();
    expect(getByText(/Retry/i)).toBeTruthy();
  });

  test('handles Jump Start', async () => {
    const { getByText, getByTestId } = render(<App />);

    await act(async () => {
      fireEvent.press(getByText(/Start/i));
      jest.advanceTimersByTime(2000); // Tap during light sequence
    });

    await act(async () => {
      fireEvent.press(getByTestId('tap-area'));
    });

    expect(getByText(/Jump Start!/i)).toBeTruthy();
  });

  test('handles very slow reaction', async () => {
    const { getByText, getByTestId } = render(<App />);

    await act(async () => {
      fireEvent.press(getByText(/Start/i));
      jest.advanceTimersByTime(9000); // 7 seconds for sequence + 2 seconds delay
    });

    await act(async () => {
      fireEvent.press(getByTestId('tap-area'));
    });

    expect(getByText(/Were you sleeping\? Concentrate!/i)).toBeTruthy();
  });
});