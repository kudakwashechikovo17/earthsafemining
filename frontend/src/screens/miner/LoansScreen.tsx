import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import { colors } from '../../theme/darkTheme';

const LoansScreen = ({ route }: any) => {
  const { currentOrg } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation();

  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentOrg]);

  const fetchData = async () => {
    if (!currentOrg) return;
    try {
      const loanData = await apiService.getLoans(currentOrg._id);
      setLoans(loanData);
    } catch (error) {
      console.error('Fetch Loans Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'pending': return colors.gold;
      case 'rejected': return colors.error;
      default: return colors.textMuted;
    }
  };

  const calculateTotalDebt = () => {
    return loans.filter(l => l.status === 'approved').reduce((t, l) => t + l.amount, 0);
  };

  const calculateMonthlyObligations = () => {
    return loans.filter(l => l.status === 'approved').reduce((t, l) => t + (l.monthlyPayment || 0), 0);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Loan Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>${calculateTotalDebt().toFixed(0)}</Text>
              <Text style={styles.statLabel}>Total Debt</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>${calculateMonthlyObligations().toFixed(0)}</Text>
              <Text style={styles.statLabel}>Monthly</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{loans.filter(l => l.status === 'approved').length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => (navigation as any).navigate('LoanPreparation')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
              <Icon name="check-circle" size={28} color={colors.success} />
            </View>
            <Text style={styles.actionText}>Get Loan Ready</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => (navigation as any).navigate('FinancialMarketplace')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.goldLight }]}>
              <Icon name="store-search" size={28} color={colors.gold} />
            </View>
            <Text style={styles.actionText}>Marketplace</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => (navigation as any).navigate('LoanRepayment')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
              <Icon name="credit-card-check" size={28} color="#2196F3" />
            </View>
            <Text style={styles.actionText}>Repayments</Text>
          </TouchableOpacity>
        </View>

        {/* Active Loans */}
        <Text style={styles.sectionTitle}>Active Loans</Text>
        {loans.filter(l => l.status === 'approved').length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="bank-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No active loans</Text>
            <Text style={styles.emptySubtext}>Apply for financing to grow your operations</Text>
          </View>
        ) : (
          loans.filter(l => l.status === 'approved').map(loan => (
            <View key={loan._id || loan.id} style={styles.loanCard}>
              <View style={styles.loanHeader}>
                <View style={[styles.loanBadge, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                  <Icon name="bank" size={20} color={colors.success} />
                </View>
                <View style={styles.loanInfo}>
                  <Text style={styles.loanAmount}>${loan.amount?.toLocaleString()}</Text>
                  <Text style={styles.loanPurpose}>{loan.purpose}</Text>
                </View>
                <View style={styles.loanMeta}>
                  <Text style={styles.loanRate}>{loan.interestRate}% APR</Text>
                </View>
              </View>
              <View style={styles.loanProgress}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Repayment Progress</Text>
                  <Text style={styles.progressValue}>45%</Text>
                </View>
                <ProgressBar progress={0.45} color={colors.gold} style={styles.progressBar} />
              </View>
              <View style={styles.loanFooter}>
                <View>
                  <Text style={styles.footerLabel}>Monthly</Text>
                  <Text style={styles.footerValue}>${loan.monthlyPayment}/mo</Text>
                </View>
                <View>
                  <Text style={styles.footerLabel}>Term</Text>
                  <Text style={styles.footerValue}>{loan.term} months</Text>
                </View>
                <View>
                  <Text style={styles.footerLabel}>Institution</Text>
                  <Text style={styles.footerValue}>{loan.institution?.substring(0, 12) || 'Bank'}</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Applications */}
        <Text style={styles.sectionTitle}>Loan Applications</Text>
        {loans.filter(l => l.status !== 'approved').length === 0 ? (
          <View style={styles.emptyStateSmall}>
            <Text style={styles.emptySubtext}>No pending applications</Text>
          </View>
        ) : (
          loans.filter(l => l.status !== 'approved').map(loan => (
            <View key={loan._id || loan.id} style={styles.applicationCard}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(loan.status) }]} />
              <View style={styles.appInfo}>
                <Text style={styles.appAmount}>${loan.amount?.toLocaleString()} - {loan.purpose}</Text>
                <Text style={styles.appMeta}>{loan.institution} • {loan.term} months</Text>
              </View>
              <View style={[styles.statusBadge, { borderColor: getStatusColor(loan.status) }]}>
                <Text style={[styles.statusText, { color: getStatusColor(loan.status) }]}>
                  {loan.status?.toUpperCase()}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => (navigation as any).navigate('LoanPreparation')}>
        <Icon name="bank-plus" size={28} color="#121212" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    padding: 16,
    borderRadius: 14,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  statValue: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyState: {
    backgroundColor: colors.inputBackground,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginBottom: 20,
  },
  emptyStateSmall: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  loanCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 14,
  },
  loanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loanBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loanInfo: {
    flex: 1,
  },
  loanAmount: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  loanPurpose: {
    color: colors.textMuted,
    fontSize: 13,
  },
  loanMeta: {
    alignItems: 'flex-end',
  },
  loanRate: {
    color: colors.success,
    fontSize: 14,
    fontWeight: 'bold',
  },
  loanProgress: {
    marginTop: 16,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  progressValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.inputBackground,
  },
  loanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  footerValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  applicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  appInfo: {
    flex: 1,
  },
  appAmount: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  appMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default LoansScreen;