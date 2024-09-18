import { determineGrade } from '../App'; // Ensure determineGrade is exported from App.js
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

test('Grading criteria', () => {
  expect(determineGrade(149)).toBe('Anticipatory');
  expect(determineGrade(150)).toBe('Excellent');
  expect(determineGrade(175)).toBe('Excellent');
  expect(determineGrade(200)).toBe('Very Good');
  expect(determineGrade(225)).toBe('Very Good');
  expect(determineGrade(251)).toBe('OK');
  expect(determineGrade(300)).toBe('OK');
  expect(determineGrade(301)).toBe('Slow');
});