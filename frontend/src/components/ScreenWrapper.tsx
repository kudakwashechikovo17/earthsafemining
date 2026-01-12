import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ScreenWrapperProps {
    children: ReactNode;
    withScrollView?: boolean;
    style?: any;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style }) => {
    const theme = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar
                backgroundColor={theme.colors.background}
                barStyle="dark-content"
            />
            <View style={[styles.content, style]}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
});

export default ScreenWrapper;
