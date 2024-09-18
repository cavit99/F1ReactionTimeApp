// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/react-native/dont-cleanup-after-each'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@testing-library)/)',
  ],
  // Add this line to set up mocks automatically
  setupFiles: ['./__mocks__/@react-native-async-storage/async-storage.js'],
};