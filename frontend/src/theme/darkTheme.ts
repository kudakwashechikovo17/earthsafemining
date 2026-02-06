import { StyleSheet, Platform } from 'react-native';

// EarthSafe Dark Theme Color Palette
export const colors = {
    // Backgrounds
    background: '#121212',
    cardBackground: 'rgba(30, 30, 30, 0.95)',
    cardBackgroundSolid: '#1e1e1e',
    inputBackground: 'rgba(255,255,255,0.06)',

    // Borders
    cardBorder: 'rgba(255,255,255,0.12)',
    inputBorder: 'rgba(255,255,255,0.1)',
    divider: 'rgba(255,255,255,0.08)',

    // Text
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.7)',
    textMuted: 'rgba(255,255,255,0.5)',
    textPlaceholder: 'rgba(255,255,255,0.4)',

    // Accents
    gold: '#D4AF37',
    goldLight: 'rgba(212, 175, 55, 0.15)',
    green: '#1B5E20',
    greenLight: '#2E7D32',

    // Status
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#ff6b6b',
    info: '#2196F3',

    // Button
    buttonPrimary: '#ffffff',
    buttonPrimaryText: '#1B5E20',
    buttonOutline: 'rgba(255,255,255,0.05)',
    buttonOutlineBorder: 'rgba(255,255,255,0.3)',
};

// Shared styles for dark theme
export const darkTheme = StyleSheet.create({
    // Containers
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Cards
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },

    // Typography
    title: {
        color: colors.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 16,
    },
    text: {
        color: colors.textPrimary,
        fontSize: 14,
    },
    textMuted: {
        color: colors.textMuted,
        fontSize: 14,
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },

    // Inputs
    input: {
        backgroundColor: colors.inputBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        height: 56,
        fontSize: 16,
        color: colors.textPrimary,
    },
    inputLabel: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },

    // Buttons
    primaryButton: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: colors.buttonPrimaryText,
        fontSize: 16,
        fontWeight: 'bold',
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: colors.buttonOutlineBorder,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: colors.buttonOutline,
    },
    outlineButtonText: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },

    // Header
    screenHeader: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 20,
    },

    // List items
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        marginBottom: 12,
    },

    // Stats/Metrics
    statCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        flex: 1,
    },
    statValue: {
        color: colors.textPrimary,
        fontSize: 28,
        fontWeight: 'bold',
    },
    statLabel: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 4,
    },

    // Badges
    badge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: colors.goldLight,
    },
    badgeText: {
        color: colors.gold,
        fontSize: 12,
        fontWeight: '600',
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginVertical: 16,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.gold,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});

export default { colors, darkTheme };
