import { DefaultTheme } from 'react-native-paper';

// Define custom colors
const colors = {
  primary: '#2E7D32', // Green - representing earth/nature
  secondary: '#FFA000', // Gold - representing mining
  accent: '#1976D2', // Blue - representing water/resources
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#D32F2F',
  text: '#212121',
  disabled: '#9E9E9E',
  placeholder: '#757575',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#FF4081',
};

// Create custom theme
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
}; 