import { StyleSheet } from 'react-native';

const baseStyles = {
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  portraitContainer: {
    flexDirection: 'column',
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',
  },
  landscapeContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center content horizontally
    alignItems: 'center',
  },
  gridScreenWrapper: {
    width: '100%',
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', 
    bottom: '15%'  
  },
  portraitButtons: {
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  landscapeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  startButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
  },
  startButtonLandscape: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
    marginRight: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 60,
    width: '60%',
    alignItems: 'center',
  },
  retryButtonLandscape: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
    // Remove marginLeft
  },
  landscapeFeedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  feedbackTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%', // Set a fixed width instead of flex: 1
  },
  resetButton: {
    width: 35, 
    height: 35, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 10, 
    borderWidth: 1, 
    borderRadius: 5, 
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
    width: '100%',
  },
  resultText: {
    fontSize: 20,
    marginVertical: 5,
    textAlign: 'center',
  },
  feedbackText: {
    fontSize: 18,
    marginVertical: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  newBestTimeText: {
    fontWeight: 'bold',
  },
  bestTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
  },
  resetButtonImage: {
    width: 20,
    height: 20,
  },
  themeToggleButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    borderRadius: 20,
    padding: 10,
  },
  themeToggleText: {
    fontSize: 18,
  },
};

const lightStyles = StyleSheet.create({
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: '#ffffff',
  },
  resetButton: {
    ...baseStyles.resetButton,
    borderColor: '#000',
  },
  buttonText: {
    ...baseStyles.buttonText,
    color: '#fff',
  },
  resultText: {
    ...baseStyles.resultText,
    color: '#000',
  },
  feedbackText: {
    ...baseStyles.feedbackText,
    color: '#555',
  },
  newBestTimeText: {
    ...baseStyles.newBestTimeText,
    color: '#28a745',
  },
  themeToggleButton: {
    ...baseStyles.themeToggleButton,
    backgroundColor: '#ddd',
  },
  themeToggleText: {
    ...baseStyles.themeToggleText,
    color: '#000',
  },
});

const darkStyles = StyleSheet.create({
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: '#121212',
  },
  resetButton: {
    ...baseStyles.resetButton,
    borderColor: '#fff',
  },
  resetButtonImage: {
    ...baseStyles.resetButtonImage,
    tintColor: '#fff', // This will invert the image colors
  },
  buttonText: {
    ...baseStyles.buttonText,
    color: '#fff',
  },
  resultText: {
    ...baseStyles.resultText,
    color: '#fff',
  },
  feedbackText: {
    ...baseStyles.feedbackText,
    color: '#fff',
  },
  newBestTimeText: {
    ...baseStyles.newBestTimeText,
    color: '#28a745',
  },
  themeToggleButton: {
    ...baseStyles.themeToggleButton,
    backgroundColor: '#333',
  },
  themeToggleText: {
    ...baseStyles.themeToggleText,
    color: '#fff',
  },
});

export { lightStyles, darkStyles };