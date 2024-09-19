# Formula 1 Driver Start Reaction Time Practice App
# by Cavit Erginsoy, 2024

## Overview

This React Native application simulates the start of a Formula 1 race, allowing users to practice and improve their reaction times. The app provides detailed feedback on user performance and supports both light and dark themes.

## Features

- **Sequential Light Simulation**: Simulates the starting lights of a Formula 1 race with a sequence of five lights that illuminate one by one.
- **Reaction Time Measurement**: Accurately measures and records the user's reaction time in milliseconds.
- **Feedback System**: Provides graded feedback based on reaction time, ranging from "Jump Start" to "Very Slow".
- **Audio Feedback**: Includes sound effects for light changes and penalties.
- **Theme Support**: Automatically adjusts between light and dark themes based on system settings or user preference.
- **Data Persistence**: Uses `AsyncStorage` to save and retrieve the best reaction times.

## Light Sequence Logic

The light sequence is designed to closely mimic the starting lights of a Formula 1 race:

1. **Initialization**: The sequence begins with all five lights turned off.
2. **Sequential Illumination**: Each light illuminates one by one with a delay of 1000 milliseconds between them, replicating the real-world F1 start light sequence.
3. **Random Delay**: After all lights are illuminated, they turn off after a random delay ranging from 200 to 3000 milliseconds. This introduces unpredictability similar to actual race starts.
4. **Ready to Tap**: Once the lights turn off, users can tap to record their reaction time.

## Touch Latency Handling

The app incorporates touch latency handling to ensure accurate reaction time measurement:

- **Initial Deduction**: A baseline touch latency deduction of 60 milliseconds is applied, accounting for typical device latency.
- **Dynamic Adjustment**: If the random delay exceeds 2300 milliseconds, the deduction is reduced proportionally as it approaches the maximum delay of 3000 milliseconds. This adjustment accounts for potential anticipation by users while maintaining fairness by compensating for device latency.

## Jump Start Logic

The app includes logic to handle premature taps, known as "Jump Starts":

- **Detection**: If a user taps before all lights have turned off, it is considered a jump start.
- **Penalty**: The app immediately clears any ongoing sequences and sets the reaction time to -1, indicating an invalid attempt.
- **Feedback**: Users receive feedback alerting them of their premature action with a message that stewards would not approve of such a start.
- **Sound Alert**: A penalty sound is played to reinforce the feedback visually and audibly.

## Usage

- Launch the app and press "Start" to begin the light sequence.
- Wait for all lights to turn off before tapping the screen to record your reaction time.
- Review your performance feedback and try to improve your best time.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or suggestions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
