import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, ImageBackground } from 'react-native';
import { Card, Title, Paragraph, Text, Divider, Avatar, Button, useTheme, Surface } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { authService } from '../../services/authService';
import { StackNavigationProp } from '@react-navigation/stack';
import { MinerStackParamList } from '../../types/navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure this is installed or use fallback

type MinerDashboardScreenProps = {
  navigation: StackNavigationProp<MinerStackParamList, 'Dashboard'>;
};

const MinerDashboardScreen = ({ navigation }: MinerDashboardScreenProps) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  // Mock data for the dashboard (Replace with real data from Redux later)
  const earningsSummary = {
    daily: 250,
    weekly: 1750,
    monthly: 7500,
  };

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`, // Primary Green
        strokeWidth: 2,
      },
    ],
  };

  const goldPrice = 65.5; // USD per gram
  const previousGoldPrice = 63.2;
  const priceChange = ((goldPrice - previousGoldPrice) / previousGoldPrice) * 100;

  const recentTransactions = [
    { id: '1', date: '2023-11-15', buyer: 'FPR Harare', amount: 1250, quantity: 20, unit: 'g' },
    { id: '2', date: '2023-11-10', buyer: 'ABC Minerals', amount: 1875, quantity: 30, unit: 'g' },
  ];

  const complianceAlerts = [
    {
      id: '1',
      title: 'Mining Permit Expiring',
      description: 'Your mining permit will expire in 15 days.',
      daysLeft: 15,
      type: 'warning',
    },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Modern Header Section */}
        <View style={styles.headerContainer}>
          <View>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Good morning,</Text>
            <Text variant="titleLarge" style={{ color: theme.colors.secondary }}>John Doe</Text>
            <Text variant="labelMedium" style={{ color: theme.colors.outline }}>{new Date().toDateString()}</Text>
          </View>
          <Avatar.Text size={50} label="JD" style={{ backgroundColor: theme.colors.primaryContainer, marginLeft: 'auto' }} color={theme.colors.primary} />
        </View>

        {/* Action Grid (Quick Access) */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Production')}>
            <Surface style={[styles.actionIconSurface, { backgroundColor: theme.colors.primaryContainer }]} elevation={2}>
              <Icon name="pickaxe" size={28} color={theme.colors.primary} />
            </Surface>
            <Text style={styles.actionLabel}>Log Production</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Sales')}>
            <Surface style={[styles.actionIconSurface, { backgroundColor: theme.colors.tertiaryContainer }]} elevation={2}>
              <Icon name="cash-multiple" size={28} color={theme.colors.tertiary} />
            </Surface>
            <Text style={styles.actionLabel}>New Sale</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Compliance')}>
            <Surface style={[styles.actionIconSurface, { backgroundColor: theme.colors.secondaryContainer }]} elevation={2}>
              <Icon name="file-document-check" size={28} color={theme.colors.secondary} />
            </Surface>
            <Text style={styles.actionLabel}>Permits</Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Summary - Modern Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.primary }]} mode="elevated">
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.onPrimary, opacity: 0.8 }}>Total Earnings (Month)</Text>
              <Icon name="chart-timeline-variant" size={24} color={theme.colors.onPrimary} />
            </View>
            <Text variant="displaySmall" style={{ color: theme.colors.onPrimary, fontWeight: 'bold', marginVertical: 8 }}>
              ${earningsSummary.monthly.toLocaleString()}
            </Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View>
                <Text style={{ color: theme.colors.onPrimary, opacity: 0.8, fontSize: 12 }}>Today</Text>
                <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>${earningsSummary.daily}</Text>
              </View>
              <View>
                <Text style={{ color: theme.colors.onPrimary, opacity: 0.8, fontSize: 12 }}>This Week</Text>
                <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>${earningsSummary.weekly}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Gold Price Ticker */}
        <Surface style={styles.tickerSurface} elevation={1}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar.Icon size={36} icon="gold" style={{ backgroundColor: theme.colors.tertiaryContainer }} color="#FFD700" />
            <View style={{ marginLeft: 12 }}>
              <Text variant="titleSmall">Gold Price (Global)</Text>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>${goldPrice}/g</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name={priceChange >= 0 ? 'trending-up' : 'trending-down'} size={16} color={priceChange >= 0 ? 'green' : 'red'} />
              <Text style={{ color: priceChange >= 0 ? 'green' : 'red', fontWeight: 'bold', marginLeft: 4 }}>
                {Math.abs(priceChange).toFixed(2)}%
              </Text>
            </View>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Last 24h</Text>
          </View>
        </Surface>

        {/* Production Trends Chart */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Production Trend</Title>
            <LineChart
              data={data}
              width={width - 64} // consistent width
              height={180}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary,
                labelColor: (opacity = 1) => theme.colors.onSurface,
                style: { borderRadius: 16 },
                propsForDots: { r: '4', strokeWidth: '2', stroke: theme.colors.primary },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
              withInnerLines={false}
              withOuterLines={false}
            />
          </Card.Content>
        </Card>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Sales')}>
            <Text style={{ color: theme.colors.primary }}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.map((tx) => (
          <Surface key={tx.id} style={styles.transactionItem} elevation={0}>
            <Avatar.Icon size={40} icon="sale" style={{ backgroundColor: theme.colors.secondaryContainer }} color={theme.colors.secondary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{tx.buyer}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{tx.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>+${tx.amount}</Text>
              <Text variant="bodySmall">{tx.quantity}{tx.unit}</Text>
            </View>
          </Surface>
        ))}

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={theme.colors.error}
          icon="logout"
        >
          Logout
        </Button>
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconSurface: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tickerSurface: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  logoutButton: {
    marginTop: 24,
    borderColor: '#e0e0e0',
  },
});

export default MinerDashboardScreen; 