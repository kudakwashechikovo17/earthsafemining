import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Card, Title, Paragraph, Text, Divider, Avatar, Button, useTheme } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import { RootState } from '../../store';
import { authService } from '../../services/authService';
import { StackNavigationProp } from '@react-navigation/stack';
import { MinerStackParamList } from '../../types/navigation';
import ScreenWrapper from '../../components/ScreenWrapper';

type MinerDashboardScreenProps = {
  navigation: StackNavigationProp<MinerStackParamList, 'Dashboard'>;
};

const MinerDashboardScreen = ({ navigation }: MinerDashboardScreenProps) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  // Mock data for the dashboard
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
      },
    ],
  };

  const goldPrice = 65.5; // USD per gram
  const previousGoldPrice = 63.2;
  const priceChange = ((goldPrice - previousGoldPrice) / previousGoldPrice) * 100;

  const recentTransactions = [
    {
      id: '1',
      date: '2023-11-15',
      buyer: 'FPR Harare',
      amount: 1250,
      quantity: 20,
      unit: 'grams',
    },
    {
      id: '2',
      date: '2023-11-10',
      buyer: 'ABC Minerals',
      amount: 1875,
      quantity: 30,
      unit: 'grams',
    },
    {
      id: '3',
      date: '2023-11-05',
      buyer: 'FPR Bulawayo',
      amount: 625,
      quantity: 10,
      unit: 'grams',
    },
  ];

  const complianceAlerts = [
    {
      id: '1',
      title: 'Mining Permit Expiring',
      description: 'Your mining permit will expire in 15 days. Please renew it.',
      daysLeft: 15,
      type: 'warning',
    },
    {
      id: '2',
      title: 'Tax Clearance Required',
      description: 'Annual tax clearance submission due in 30 days.',
      daysLeft: 30,
      type: 'info',
    },
  ];

  const handleLogout = async () => {
    console.log('Logging out...');
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.primary }]}>Good morning, John</Text>
            <Text style={styles.date}>{new Date().toDateString()}</Text>
          </View>
          <Avatar.Text size={48} label="JD" style={{ backgroundColor: theme.colors.primary }} />
        </View>

        {/* Earnings Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Earnings Summary</Title>
            <View style={styles.earningsContainer}>
              <View style={styles.earningItem}>
                <Text style={styles.earningLabel}>Today</Text>
                <Text style={[styles.earningValue, { color: theme.colors.primary }]}>${earningsSummary.daily}</Text>
              </View>
              <View style={styles.earningItem}>
                <Text style={styles.earningLabel}>This Week</Text>
                <Text style={[styles.earningValue, { color: theme.colors.primary }]}>${earningsSummary.weekly}</Text>
              </View>
              <View style={styles.earningItem}>
                <Text style={styles.earningLabel}>This Month</Text>
                <Text style={[styles.earningValue, { color: theme.colors.primary }]}>${earningsSummary.monthly}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Production Trends Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Production Trends</Title>
            <LineChart
              data={data}
              width={width - 48} // Screen width minus padding
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary,
                labelColor: (opacity = 1) => theme.colors.onSurface,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: theme.colors.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        {/* Gold Price Alert Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Gold Price Alert</Title>
            <View style={styles.priceContainer}>
              <View>
                <Text style={[styles.currentPrice, { color: theme.colors.onSurface }]}>${goldPrice}/g</Text>
                <View style={styles.priceChangeContainer}>
                  <Icon
                    name={priceChange >= 0 ? 'arrow-up' : 'arrow-down'}
                    size={20}
                    color={priceChange >= 0 ? '#4CAF50' : '#F44336'}
                  />
                  <Text
                    style={[
                      styles.priceChange,
                      { color: priceChange >= 0 ? '#4CAF50' : '#F44336' },
                    ]}
                  >
                    {Math.abs(priceChange).toFixed(2)}%
                  </Text>
                </View>
              </View>
              <Button
                mode="contained"
                style={[styles.sellButton, { backgroundColor: theme.colors.secondary }]}
                labelStyle={{ color: '#000' }}
                onPress={() => navigation.navigate('BuyersList')}
              >
                Sell Now
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Transactions Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Recent Transactions</Title>
            {recentTransactions.map((transaction, index) => (
              <View key={transaction.id}>
                <View style={styles.transactionItem}>
                  <View>
                    <Text style={styles.transactionBuyer}>{transaction.buyer}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={[styles.transactionAmount, { color: theme.colors.primary }]}>${transaction.amount}</Text>
                    <Text style={styles.transactionQuantity}>
                      {transaction.quantity} {transaction.unit}
                    </Text>
                  </View>
                </View>
                {index < recentTransactions.length - 1 && <Divider />}
              </View>
            ))}
            <TouchableOpacity style={styles.viewAllContainer}>
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>View All Transactions</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Compliance Alerts Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Compliance Alerts</Title>
            {complianceAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <View style={styles.alertIconContainer}>
                  <Avatar.Icon
                    size={40}
                    icon={alert.type === 'warning' ? 'alert' : 'information'}
                    style={{
                      backgroundColor:
                        alert.type === 'warning' ? '#FFA000' : '#1976D2',
                    }}
                  />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertDescription}>{alert.description}</Text>
                  <Text
                    style={[
                      styles.alertDaysLeft,
                      {
                        color: alert.daysLeft <= 15 ? '#D32F2F' : '#1976D2',
                      },
                    ]}
                  >
                    {alert.daysLeft} days left
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={theme.colors.error}
        >
          Logout
        </Button>

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  earningsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningItem: {
    alignItems: 'center',
    flex: 1,
  },
  earningLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  earningValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceChange: {
    marginLeft: 4,
    fontWeight: 'bold',
    fontSize: 14,
  },
  sellButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  transactionBuyer: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  transactionDetails: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionQuantity: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  viewAllContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  viewAllText: {
    fontWeight: 'bold',
  },
  alertItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  alertIconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
    lineHeight: 20,
  },
  alertDaysLeft: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    borderColor: '#D32F2F',
  },
});

export default MinerDashboardScreen; 