import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, List, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the navigation type
type BuyerDashboardScreenProps = {
  navigation: StackNavigationProp<any>;
};

// Define recent purchase type
interface RecentPurchase {
  id: string;
  mineralType: string;
  quantity: string;
  price: string;
  seller: string;
  date: string;
  status: 'pending' | 'completed' | 'processing';
}

// Define nearby seller type
interface NearbySeller {
  id: string;
  name: string;
  distance: string;
  mineralsAvailable: number;
}

// Mock data for recent purchases
const recentPurchases: RecentPurchase[] = [
  {
    id: 'p1',
    mineralType: 'Gold Ore',
    quantity: '2.5 kg',
    price: '$125,000',
    seller: 'Eastern Miners Co-op',
    date: '2023-03-20',
    status: 'completed',
  },
  {
    id: 'p2',
    mineralType: 'Copper Ore',
    quantity: '50 kg',
    price: '$4,250',
    seller: 'Western Mining Group',
    date: '2023-03-15',
    status: 'completed',
  },
  {
    id: 'p3',
    mineralType: 'Diamond Collection',
    quantity: '15 carats',
    price: '$52,500',
    seller: 'Northern Gems',
    date: '2023-03-25',
    status: 'processing',
  },
];

// Mock data for nearby sellers
const nearbySellers: NearbySeller[] = [
  {
    id: 's1',
    name: 'Gold Mining Co-op',
    distance: '15 km',
    mineralsAvailable: 4,
  },
  {
    id: 's2',
    name: 'River Gold Miners',
    distance: '22 km',
    mineralsAvailable: 2,
  },
  {
    id: 's3',
    name: 'Artisanal Miners Group',
    distance: '25 km',
    mineralsAvailable: 3,
  },
];

// Mock statistics
const marketStats = {
  availableSellers: 24,
  totalListings: 78,
  nearbyMinerals: 15,
  availableMineralTypes: ['Gold', 'Copper', 'Diamond', 'Silver', 'Other'],
};

const BuyerDashboardScreen: React.FC<BuyerDashboardScreenProps> = ({ navigation }) => {
  
  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'completed': return '#2E7D32';
      case 'processing': return '#FFA000';
      case 'pending': return '#1976D2';
      default: return '#757575';
    }
  };
  
  const handleNavigateToMarketplace = () => {
    navigation.navigate('Marketplace');
  };
  
  const handleNavigateToOrders = () => {
    navigation.navigate('Orders');
  };
  
  const handleNavigateToCompliance = () => {
    navigation.navigate('ComplianceTab');
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Buyer Dashboard</Text>
      </View>
      
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <View style={styles.welcomeHeader}>
            <View>
              <Title style={styles.welcomeTitle}>Welcome, Buyer</Title>
              <Paragraph style={styles.welcomeSubtitle}>
                Today is a great day to find quality minerals!
              </Paragraph>
            </View>
            <View style={styles.profileAvatar}>
              <Avatar.Text size={50} label="B" color="#FFFFFF" style={{ backgroundColor: "#1976D2" }} />
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Market Insights</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="account-group" size={24} color="#1976D2" />
              <Text style={styles.statNumber}>{marketStats.availableSellers}</Text>
              <Text style={styles.statLabel}>Sellers</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="format-list-bulleted" size={24} color="#FFA000" />
              <Text style={styles.statNumber}>{marketStats.totalListings}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="map-marker-radius" size={24} color="#2E7D32" />
              <Text style={styles.statNumber}>{marketStats.nearbyMinerals}</Text>
              <Text style={styles.statLabel}>Nearby</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Quick Actions</Title>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleNavigateToMarketplace}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#1976D2' }]}>
                <Icon name="shopping" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Browse Marketplace</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFA000' }]}>
                <Icon name="map-search" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Find Sellers Nearby</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleNavigateToOrders}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#2E7D32' }]}>
                <Icon name="clipboard-list" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>View Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleNavigateToCompliance}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#7B1FA2' }]}>
                <Icon name="certificate" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Compliance</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.recentCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.cardTitle}>Recent Purchases</Title>
            <Button 
              mode="text" 
              onPress={handleNavigateToOrders}
              style={styles.viewAllButton}
            >
              View All
            </Button>
          </View>
          
          {recentPurchases.length > 0 ? (
            recentPurchases.map((purchase, index) => (
              <React.Fragment key={purchase.id}>
                <View style={styles.purchaseItem}>
                  <View style={styles.purchaseDetails}>
                    <Text style={styles.purchaseMineralType}>{purchase.mineralType}</Text>
                    <Text style={styles.purchaseQuantity}>{purchase.quantity} • {purchase.price}</Text>
                    <Text style={styles.purchaseSeller}>{purchase.seller} • {purchase.date}</Text>
                  </View>
                  <View style={styles.purchaseStatus}>
                    <View 
                      style={[
                        styles.statusBadge, 
                        { backgroundColor: getStatusColor(purchase.status) + '20', 
                          borderColor: getStatusColor(purchase.status) }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.statusText, 
                          { color: getStatusColor(purchase.status) }
                        ]}
                      >
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
                {index < recentPurchases.length - 1 && <Divider style={styles.divider} />}
              </React.Fragment>
            ))
          ) : (
            <Paragraph>No recent purchases to display.</Paragraph>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.recentCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.cardTitle}>Nearby Sellers</Title>
            <Button 
              mode="text" 
              onPress={handleNavigateToMarketplace}
              style={styles.viewAllButton}
            >
              View All
            </Button>
          </View>
          
          {nearbySellers.map((seller, index) => (
            <React.Fragment key={seller.id}>
              <View style={styles.sellerItem}>
                <View style={styles.sellerIcon}>
                  <Icon name="account" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.sellerDetails}>
                  <Text style={styles.sellerName}>{seller.name}</Text>
                  <View style={styles.sellerMeta}>
                    <Icon name="map-marker" size={14} color="#616161" />
                    <Text style={styles.sellerDistance}>{seller.distance}</Text>
                    <Icon name="circle-small" size={14} color="#616161" />
                    <Text style={styles.sellerMinerals}>
                      {seller.mineralsAvailable} {seller.mineralsAvailable === 1 ? 'mineral' : 'minerals'} available
                    </Text>
                  </View>
                </View>
                <Button 
                  mode="outlined" 
                  compact 
                  style={styles.viewButton}
                  onPress={handleNavigateToMarketplace}
                >
                  View
                </Button>
              </View>
              {index < nearbySellers.length - 1 && <Divider style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#1976D2',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  welcomeCard: {
    margin: 16,
    elevation: 4,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    opacity: 0.7,
  },
  profileAvatar: {
    alignItems: 'center',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  recentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllButton: {
    marginTop: -8,
  },
  purchaseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  purchaseDetails: {
    flex: 1,
  },
  purchaseMineralType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  purchaseQuantity: {
    fontSize: 14,
    color: '#616161',
    marginTop: 2,
  },
  purchaseSeller: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  purchaseStatus: {
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 4,
  },
  sellerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sellerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sellerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sellerDistance: {
    fontSize: 12,
    color: '#616161',
    marginLeft: 4,
    marginRight: 4,
  },
  sellerMinerals: {
    fontSize: 12,
    color: '#616161',
    marginLeft: 4,
  },
  viewButton: {
    marginLeft: 8,
  },
});

export default BuyerDashboardScreen; 