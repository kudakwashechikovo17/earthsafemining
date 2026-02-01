import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

// Eco-Tech Professional Theme
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1B5E20', // Deep Forest Green (Professional, Eco-friendly)
    onPrimary: '#FFFFFF',
    primaryContainer: '#C8E6C9',
    onPrimaryContainer: '#002204',

    secondary: '#00897B', // Teal (Modern, Clean)
    onSecondary: '#FFFFFF',
    secondaryContainer: '#DBF2F2',
    onSecondaryContainer: '#001F1C',

    tertiary: '#FFC107', // Amber/Gold (Wealth, Mining)
    onTertiary: '#000000',
    tertiaryContainer: '#FFECB3',
    onTertiaryContainer: '#261900',

    background: '#F5F7FA', // Soft Gray-Blue (Mental Clarity)
    surface: '#FFFFFF',
    surfaceVariant: '#E0E0E0',
    onSurface: '#191C1C',

    error: '#BA1A1A',
    onError: '#FFFFFF',

    outline: '#747775',
    elevation: {
      level0: 'transparent',
      level1: '#F6F6F6',
      level2: '#F2F2F2',
      level3: '#EEEEEE',
      level4: '#EAEAEA',
      level5: '#E6E6E6',
    },
  },
  roundness: 12, // More modern rounded corners
  animation: {
    scale: 1.0,
  },
};