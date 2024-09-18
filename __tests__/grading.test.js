import { determineGrade } from '../App'; // Ensure determineGrade is exported from App.js
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

test('Grading criteria', () => {
  expect(determineGrade(-1)).toBe('Jump Start');
  expect(determineGrade(99)).toBe('Anticipatory');
  expect(determineGrade(100)).toBe('Extraordinary');
  expect(determineGrade(199)).toBe('Extraordinary');
  expect(determineGrade(200)).toBe('Excellent');
  expect(determineGrade(250)).toBe('Excellent');
  expect(determineGrade(251)).toBe('Very Good');
  expect(determineGrade(270)).toBe('Very Good');
  expect(determineGrade(271)).toBe('Good');
  expect(determineGrade(300)).toBe('Good');
  expect(determineGrade(301)).toBe('OK');
  expect(determineGrade(350)).toBe('OK');
  expect(determineGrade(351)).toBe('Slow');
  expect(determineGrade(400)).toBe('Slow');
  expect(determineGrade(401)).toBe('Very Slow');
});