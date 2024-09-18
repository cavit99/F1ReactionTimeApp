// __tests__/App.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

test('renders start button and responds to tap', async () => {
  const { getByText, queryByText } = render(<App />);

  const startButton = getByText(/Start/i);
  expect(startButton).toBeTruthy();

  fireEvent.press(startButton);

  // Wait for lights to illuminate
  await waitFor(() => {
    expect(queryByText(/Start/i)).toBeNull();
  });
});