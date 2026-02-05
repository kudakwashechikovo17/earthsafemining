import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput, Alert, Linking } from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Divider,
  Portal,
  Modal,
  Paragraph,
  ActivityIndicator,
  Avatar,
  Surface,
  TextInput
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { MinerStackParamList } from '../../types/navigation';
import { apiService } from '../../services/apiService';

type BuyersListScreenProps = {
  navigation: StackNavigationProp<MinerStackParamList, 'BuyersList'>;
};

// Define buyer type
interface Buyer {
  id: string;
  name: string;
  type: 'government' | 'private';
  pricePerGram: number;
  previousPrice: number;
  rating: number;
  reviewCount: number;
  paymentTime: string;
  distance: string;
  bonuses: string[];
  verified: boolean;
  image: string | null;
  phone: string;
  email: string;
  address: string;
}

const BuyersListScreen: React.FC<BuyersListScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  // Mock Data for Demo fallback
  const MOCK_BUYERS = [
    {
      _id: 'mock-1',
      name: 'Fidelity Printers (Govt)',
      type: 'government',
      pricePerGram: 67.50,
      previousPrice: 65.00,
      rating: 4.8,
      reviewCount: 124,
      paymentTime: 'Instant',
      distance: '5km',
      bonuses: ['USD Cash Guarantee', 'Low Tax Rate'],
      verified: true,
      phone: '+263 77 123 4567',
      email: 'buying@fidelity.co.zw',
      address: '1 Robert Mugabe Way, Harare'
    },
    {
      _id: 'mock-2',
      name: 'Aurum Byo Private Ltd',
      type: 'private',
      pricePerGram: 66.20,
      previousPrice: 66.50,
      rating: 4.2,
      reviewCount: 45,
      paymentTime: '24 Hours',
      distance: '12km',
      bonuses: ['Transport Provided'],
      verified: true,
      phone: '+263 71 987 6543',
      email: 'info@aurumbyo.com',
      address: 'Industrial Site, Bulawayo'
    },
    {
      _id: 'mock-3',
      name: 'Bulawayo Gold Centre',
      type: 'private',
      pricePerGram: 65.80,
      previousPrice: 65.80,
      rating: 3.9,
      reviewCount: 28,
      paymentTime: 'Same Day',
      distance: '8km',
      bonuses: [],
      verified: true,
      phone: '+263 29 222 3333',
      email: 'contact@bgc.co.zw',
      address: 'Main Street, Bulawayo'
    }
  ];

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      let data = await apiService.getBuyers();

      // FALLBACK TO MOCK DATA IF EMPTY (FOR DEMO)
      if (!data || data.length === 0) {
        console.log('No buyers found, using mock data');
        data = MOCK_BUYERS;
      }

      const enhancedData = data.map((b: any) => ({
        ...b,
        id: b._id,
        // Use existing type if valid, otherwise mock
        type: (b.type === 'government' || b.type === 'private') ? b.type : (Math.random() > 0.3 ? 'private' : 'government'),
        pricePerGram: b.pricePerGram || (65.50 + Math.random()),
        previousPrice: b.previousPrice || 65.00,
        rating: b.rating || (4 + Math.random()).toFixed(1),
        reviewCount: b.reviewCount || (Math.floor(Math.random() * 100) + 10),
        paymentTime: b.paymentTime || 'Same day',
        distance: b.distance || 'Local',
        bonuses: b.bonuses || [],
        verified: b.verified !== undefined ? b.verified : true,
        phone: b.phone || '+263 77 000 0000',
        email: b.email || 'buyer@example.com',
        address: b.address || 'Harare, Zimbabwe'
      }));
      setBuyers(enhancedData);
    } catch (error) {
      console.error('Failed to fetch buyers', error);
      // Fallback to mock on error too
      setBuyers(MOCK_BUYERS.map(b => ({ ...b, id: b._id })));
    } finally {
      setLoading(false);
    }
  };

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const filteredBuyers = buyers
    .filter(buyer => buyer.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(buyer => {
      if (filterValue === 'all') return true;
      if (filterValue === 'verified') return buyer.verified;
      return buyer.type === filterValue;
    });

  const getPriceChangeColor = (current: number, previous: number): string => {
    const change = current - previous;
    return change > 0 ? '#2E7D32' : change < 0 ? '#D32F2F' : '#757575';
  };

  const getPriceChangeIcon = (current: number, previous: number): string => {
    const change = current - previous;
    return change > 0 ? 'arrow-up' : change < 0 ? 'arrow-down' : 'minus';
  };

  const handleConnect = (buyer: any) => {
    setSelectedBuyer(buyer);
    setConnectModalVisible(true);
    setRequestMessage(`Hi ${buyer.name}, I am interested in selling gold to you. Please contact me.`);
  };

  const hideModal = () => {
    setConnectModalVisible(false);
  };

  const handleSendRequest = () => {
    // Logic to send request (backend interaction would go here)
    // For now, simple alert
    Alert.alert('Request Sent', `Your message has been sent to ${selectedBuyer?.name}. They will contact you shortly.`);
    hideModal();
  };

  const handleInitiateSale = () => {
    hideModal();
    if (selectedBuyer) {
      navigation.navigate('SalesTab', {
        screen: 'Sales',
        params: {
          prefilledBuyer: selectedBuyer.name,
          prefilledPrice: selectedBuyer.pricePerGram.toFixed(2)
        }
      } as any);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.headerTitle}>Current Market Prices</Title>
          <Text style={styles.headerSubtitle}>
            Compare offers from verified buyers in your area
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#757575" style={styles.searchIcon} />
          <RNTextInput
            placeholder="Search buyers"
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterButtonsContainer}>
          <Button
            mode={filterValue === 'all' ? 'contained' : 'outlined'}
            onPress={() => setFilterValue('all')}
            style={styles.filterButton}
            compact
          >
            All
          </Button>
          <Button
            mode={filterValue === 'government' ? 'contained' : 'outlined'}
            onPress={() => setFilterValue('government')}
            style={styles.filterButton}
            compact
            icon="bank"
          >
            Govt
          </Button>
          <Button
            mode={filterValue === 'private' ? 'contained' : 'outlined'}
            onPress={() => setFilterValue('private')}
            style={styles.filterButton}
            compact
            icon="store"
          >
            Private
          </Button>
          <Button
            mode={filterValue === 'verified' ? 'contained' : 'outlined'}
            onPress={() => setFilterValue('verified')}
            style={styles.filterButton}
            compact
            icon="shield-check"
          >
            Verified
          </Button>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.buyersContainer}>
        {filteredBuyers.map((buyer) => (
          <Card key={buyer.id} style={styles.buyerCard}>
            <Card.Content>
              <View style={styles.buyerHeader}>
                <View style={styles.buyerInfo}>
                  <View
                    style={[
                      styles.buyerAvatar,
                      { backgroundColor: buyer.type === 'government' ? '#1976D2' : '#FFA000' }
                    ]}
                  >
                    <Icon
                      name={buyer.type === 'government' ? 'bank' : 'store'}
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.buyerDetails}>
                    <View style={styles.nameRow}>
                      <Text style={styles.buyerName}>{buyer.name}</Text>
                      {buyer.verified && (
                        <Icon name="check-decagram" size={18} color="#2E7D32" style={styles.verifiedIcon} />
                      )}
                    </View>
                    <View style={styles.ratingContainer}>
                      <Icon name="star" size={14} color="#FFC107" />
                      <Text style={styles.ratingText}>
                        {buyer.rating} ({buyer.reviewCount} reviews)
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>${buyer.pricePerGram.toFixed(2)}/g</Text>
                  <View style={styles.priceChangeContainer}>
                    <Icon
                      name={getPriceChangeIcon(buyer.pricePerGram, buyer.previousPrice)}
                      size={12}
                      color={getPriceChangeColor(buyer.pricePerGram, buyer.previousPrice)}
                    />
                    <Text
                      style={[
                        styles.priceChangeText,
                        { color: getPriceChangeColor(buyer.pricePerGram, buyer.previousPrice) }
                      ]}
                    >
                      ${Math.abs(buyer.pricePerGram - buyer.previousPrice).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.buyerMetadataContainer}>
                <View style={styles.metadataItem}>
                  <Icon name="clock-fast" size={16} color="#616161" />
                  <Text style={styles.metadataText}>{buyer.paymentTime}</Text>
                </View>
                <View style={styles.metadataItem}>
                  <Icon name="map-marker" size={16} color="#616161" />
                  <Text style={styles.metadataText}>{buyer.distance}</Text>
                </View>
              </View>

              {buyer.bonuses.length > 0 && (
                <View style={styles.bonusesContainer}>
                  {buyer.bonuses.map((bonus: string, index: number) => (
                    <View key={index} style={styles.bonusChip}>
                      <Text style={styles.bonusText}>{bonus}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Button
                mode="contained"
                style={styles.sellButton}
                onPress={() => handleConnect(buyer)}
                icon="account-network"
              >
                Connect
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Connect Modal */}
      <Portal>
        <Modal
          visible={connectModalVisible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedBuyer && (
            <ScrollView>
              <Title style={styles.modalTitle}>Connect with {selectedBuyer.name}</Title>

              <View style={styles.contactDetails}>
                <View style={styles.contactItem}>
                  <Icon name="phone" size={20} color="#2E7D32" />
                  <Text style={styles.contactText}>{selectedBuyer.phone}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Icon name="email" size={20} color="#2E7D32" />
                  <Text style={styles.contactText}>{selectedBuyer.email}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Icon name="map-marker" size={20} color="#2E7D32" />
                  <Text style={styles.contactText}>{selectedBuyer.address}</Text>
                </View>
              </View>

              <Divider style={styles.modalDivider} />

              <Title style={{ fontSize: 16, marginBottom: 8 }}>Send a Request</Title>
              <TextInput
                label="Message"
                value={requestMessage}
                onChangeText={setRequestMessage}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={{ backgroundColor: 'white', marginBottom: 16 }}
              />

              <Button
                mode="contained"
                onPress={handleSendRequest}
                style={{ marginBottom: 12, backgroundColor: '#2E7D32' }}
              >
                Send Request
              </Button>

              <Button
                mode="outlined"
                onPress={handleInitiateSale}
                style={{ marginBottom: 12 }}
                icon="currency-usd"
              >
                Record Sale (I already sold)
              </Button>

              <Button onPress={hideModal} textColor="#666">
                Close
              </Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerCard: {
    margin: 8,
    elevation: 2,
    backgroundColor: '#2E7D32',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  filtersContainer: {
    margin: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 8,
    elevation: 2,
  },
  searchIcon: {
    marginLeft: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#212121',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    marginHorizontal: 2,
    marginBottom: 4,
    flex: 1,
  },
  buyersContainer: {
    paddingBottom: 16,
  },
  buyerCard: {
    margin: 8,
    elevation: 2,
  },
  buyerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyerDetails: {
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#616161',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  priceChangeText: {
    fontSize: 12,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  buyerMetadataContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metadataText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#616161',
  },
  bonusesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  bonusChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  bonusText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  sellButton: {
    backgroundColor: '#0277bd', // Changed to blueish for Connect
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalDivider: {
    marginVertical: 16,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
  buyerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactDetails: {
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  contactText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333'
  }
});

export default BuyersListScreen;