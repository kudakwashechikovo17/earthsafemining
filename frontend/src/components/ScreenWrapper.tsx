import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { colors } from '../theme/darkTheme';

interface ScreenWrapperProps {
    children: ReactNode;
    withScrollView?: boolean;
    style?: any;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                backgroundColor={colors.background}
                barStyle="light-content"
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
        backgroundColor: colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
});

export default ScreenWrapper;
