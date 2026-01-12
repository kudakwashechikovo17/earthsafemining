import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Divider,
  Portal,
  Modal,
  Paragraph,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { MinerStackParamList } from '../../types/navigation';

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
}

const BuyersListScreen: React.FC<BuyersListScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [sellModalVisible, setSellModalVisible] = useState(false);

  // Mock data for buyers
  const buyers: Buyer[] = [
    {
      id: '1',
      name: 'Fidelity Printers Harare',
      type: 'government',
      pricePerGram: 65.50,
      previousPrice: 64.70,
      rating: 4.8,
      reviewCount: 127,
      paymentTime: 'Same day',
      distance: '12km',
      bonuses: ['Free transport', '3% bonus for 50g+'],
      verified: true,
      image: null,
    },
    {
      id: '2',
      name: 'ABC Mining Corp',
      type: 'private',
      pricePerGram: 65.00,
      previousPrice: 65.20,
      rating: 4.5,
      reviewCount: 89,
      paymentTime: 'Immediate',
      distance: '8km',
      bonuses: ['Free assay'],
      verified: true,
      image: null,
    },
    {
      id: '3',
      name: 'Goldfield Enterprises',
      type: 'private',
      pricePerGram: 66.25,
      previousPrice: 65.00,
      rating: 4.2,
      reviewCount: 54,
      paymentTime: '1-2 days',
      distance: '15km',
      bonuses: ['5% bonus for premium quality'],
      verified: false,
      image: null,
    },
    {
      id: '4',
      name: 'Fidelity Printers Bulawayo',
      type: 'government',
      pricePerGram: 65.40,
      previousPrice: 64.60,
      rating: 4.6,
      reviewCount: 112,
      paymentTime: 'Same day',
      distance: '80km',
      bonuses: ['Free transport', '2% bonus for 30g+'],
      verified: true,
      image: null,
    },
    {
      id: '5',
      name: 'Gold Trading Limited',
      type: 'private',
      pricePerGram: 64.80,
      previousPrice: 63.90,
      rating: 3.9,
      reviewCount: 37,
      paymentTime: 'Immediate',
      distance: '5km',
      bonuses: [],
      verified: false,
      image: null,
    },
  ];

  const onChangeSearch = (query: string) => setSearchQuery(query);
  
  const filteredBuyers = buyers
    .filter(buyer => buyer.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(buyer => {
      if (filterValue === 'all') return true;
      if (filterValue === 'government') return buyer.type === 'government';
      if (filterValue === 'private') return buyer.type === 'private';
      if (filterValue === 'verified') return buyer.verified;
      return true;
    })
    .sort((a, b) => b.pricePerGram - a.pricePerGram);

  const getPriceChangeColor = (current: number, previous: number): string => {
    const change = current - previous;
    return change > 0 ? '#2E7D32' : change < 0 ? '#D32F2F' : '#757575';
  };

  const getPriceChangeIcon = (current: number, previous: number): string => {
    const change = current - previous;
    return change > 0 ? 'arrow-up' : change < 0 ? 'arrow-down' : 'minus';
  };

  const handleBuyerSelect = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setSellModalVisible(true);
  };

  const hideModal = () => {
    setSellModalVisible(false);
  };

  const handleContactBuyer = () => {
    // Logic for contacting the buyer would go here
    hideModal();
    // For demonstration, we'll just close the modal
    if (selectedBuyer) {
      alert(`Contact request sent to ${selectedBuyer.name}`);
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
                      {backgroundColor: buyer.type === 'government' ? '#1976D2' : '#FFA000'}
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
                        {color: getPriceChangeColor(buyer.pricePerGram, buyer.previousPrice)}
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
                  {buyer.bonuses.map((bonus, index) => (
                    <View key={index} style={styles.bonusChip}>
                      <Text style={styles.bonusText}>{bonus}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Button 
                mode="contained" 
                style={styles.sellButton}
                onPress={() => handleBuyerSelect(buyer)}
              >
                Sell to this buyer
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Sell Modal */}
      <Portal>
        <Modal
          visible={sellModalVisible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedBuyer && (
            <>
              <Title style={styles.modalTitle}>Sell Gold to {selectedBuyer.name}</Title>
              
              <View style={styles.modalPriceRow}>
                <Text style={styles.modalPriceLabel}>Current Offer:</Text>
                <Text style={styles.modalPriceValue}>${selectedBuyer.pricePerGram.toFixed(2)}/gram</Text>
              </View>
              
              <Divider style={styles.modalDivider} />
              
              <Paragraph style={styles.modalDescription}>
                This buyer is offering ${selectedBuyer.pricePerGram.toFixed(2)} per gram of gold. 
                {selectedBuyer.bonuses.length > 0 && ' They are also offering:'}
              </Paragraph>
              
              {selectedBuyer.bonuses.length > 0 && (
                <View style={styles.modalBonusList}>
                  {selectedBuyer.bonuses.map((bonus, index) => (
                    <View key={index} style={styles.modalBonusItem}>
                      <View style={styles.modalBonusIcon}>
                        <Text style={styles.modalBonusIconText}>✓</Text>
                      </View>
                      <Text style={styles.modalBonusText}>{bonus}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <Paragraph style={styles.modalDescription}>
                Payment will be processed {selectedBuyer.paymentTime.toLowerCase()}.
                This buyer is located {selectedBuyer.distance} from your registered location.
              </Paragraph>
              
              <View style={styles.modalButtonsContainer}>
                <Button onPress={hideModal} style={styles.modalButton}>
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleContactBuyer} 
                  style={styles.modalButton}
                >
                  Contact Buyer
                </Button>
              </View>
            </>
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
    backgroundColor: '#FFA000',
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
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalPriceLabel: {
    fontSize: 16,
  },
  modalPriceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalDivider: {
    marginVertical: 16,
  },
  modalDescription: {
    marginBottom: 12,
  },
  modalBonusList: {
    marginBottom: 16,
  },
  modalBonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalBonusIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBonusIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalBonusText: {
    marginLeft: 8,
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
});

export default BuyersListScreen; 