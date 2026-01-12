import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput, FlatList } from 'react-native';
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
import { BuyerStackParamList } from '../../types/navigation';

// Define the MarketplaceItem type
interface MarketplaceItem {
  id: string;
  name: string;
  mineralType: 'gold' | 'copper' | 'diamond' | 'other';
  quantity: number;
  unit: string;
  pricePerUnit: number;
  seller: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
  location: string;
    distance: string;
  };
  purity: string;
  description: string;
  tags: string[];
  listedDate: string;
  image: string | null;
}

// Mock data for marketplace items
const mockItems: MarketplaceItem[] = [
  {
    id: '1',
    name: 'High-Quality Gold Ore',
    mineralType: 'gold',
    quantity: 5,
    unit: 'kg',
    pricePerUnit: 50000,
    seller: {
      id: 's1',
      name: 'Gold Mining Co-op',
      rating: 4.8,
      reviewCount: 157,
      verified: true,
    location: 'Eastern Region',
      distance: '15 km away',
    },
    purity: '99.9%',
    description: 'High-quality gold ore with certification of origin. Ethically sourced from community-owned mines.',
    tags: ['Certified', 'Fair Trade', 'Community Owned'],
    listedDate: '2023-03-05',
    image: null,
  },
  {
    id: '2',
    name: 'Raw Copper Ore',
    mineralType: 'copper',
    quantity: 100,
    unit: 'kg',
    pricePerUnit: 85,
    seller: {
      id: 's2',
      name: 'Copper Miners Association',
      rating: 4.5,
      reviewCount: 89,
      verified: true,
    location: 'Western Region',
      distance: '35 km away',
    },
    purity: '96%',
    description: 'Industrial grade copper ore suitable for manufacturing and electronics. Consistent quality.',
    tags: ['Industrial Grade', 'Bulk Available'],
    listedDate: '2023-03-10',
    image: null,
  },
  {
    id: '3',
    name: 'Rough Diamond Collection',
    mineralType: 'diamond',
    quantity: 50,
    unit: 'carats',
    pricePerUnit: 3500,
    seller: {
      id: 's3',
      name: 'Diamond Cooperative',
      rating: 4.9,
      reviewCount: 43,
      verified: true,
    location: 'Northern Mines',
      distance: '50 km away',
    },
    purity: 'Mixed quality',
    description: 'Conflict-free diamonds with certification. Various sizes available.',
    tags: ['Conflict-Free', 'Certified', 'Varied Sizes'],
    listedDate: '2023-03-15',
    image: null,
  },
  {
    id: '4',
    name: 'Placer Gold',
    mineralType: 'gold',
    quantity: 2.5,
    unit: 'kg',
    pricePerUnit: 48000,
    seller: {
      id: 's4',
      name: 'River Gold Miners',
      rating: 4.3,
      reviewCount: 28,
      verified: false,
      location: 'Southern Rivers',
      distance: '85 km away',
    },
    purity: '98%',
    description: 'Alluvial gold from river deposits. Washed and sorted.',
    tags: ['Alluvial', 'River Gold'],
    listedDate: '2023-03-18',
    image: null,
  },
  {
    id: '5',
    name: 'Fine Gold Dust',
    mineralType: 'gold',
    quantity: 1.2,
    unit: 'kg',
    pricePerUnit: 49000,
    seller: {
      id: 's5',
      name: 'Artisanal Miners Group',
      rating: 4.2,
      reviewCount: 36,
      verified: false,
      location: 'Central Region',
      distance: '25 km away',
    },
    purity: '99%',
    description: 'Fine gold dust collected by artisanal miners. Good for small scale jewelry production.',
    tags: ['Artisanal', 'Fine Grain'],
    listedDate: '2023-03-20',
    image: null,
  },
  {
    id: '6',
    name: 'Mixed Metal Ore',
    mineralType: 'other',
    quantity: 200,
    unit: 'kg',
    pricePerUnit: 75,
    seller: {
      id: 's6',
      name: 'Community Mining Collective',
      rating: 4.0,
      reviewCount: 15,
      verified: false,
      location: 'Western Region',
      distance: '40 km away',
    },
    purity: 'Mixed',
    description: 'Mixed metal ore containing copper, zinc, and trace gold. Good for processing plants.',
    tags: ['Mixed', 'Processing Required'],
    listedDate: '2023-03-25',
    image: null,
  },
];

// Define navigation props
type MarketplaceScreenProps = {
  navigation: StackNavigationProp<BuyerStackParamList, 'Marketplace'>;
};

const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [mineralFilter, setMineralFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };
  
  const handleLocationFilter = (location: string) => {
    setLocationFilter(location);
  };

  const handleViewSeller = (sellerID: string, sellerName: string) => {
    navigation.navigate('SellerDetail', { sellerID, sellerName });
  };

  const filteredItems = mockItems
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(item => 
      locationFilter === '' || 
      item.seller.location.toLowerCase().includes(locationFilter.toLowerCase())
    )
    .filter(item => {
      if (mineralFilter === 'all') return true;
      return item.mineralType === mineralFilter;
    });
    
  const handleItemSelect = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };
  
  const hideModal = () => {
    setDetailModalVisible(false);
  };
  
  const handlePlaceOrder = () => {
    // Logic for placing order would go here
    hideModal();
    if (selectedItem) {
      alert(`Order request sent for ${selectedItem.name}`);
    }
  };
  
  const getMineralIcon = (mineralType: string): string => {
    switch(mineralType) {
      case 'gold': return 'gold';
      case 'copper': return 'circle';
      case 'diamond': return 'diamond-stone';
      default: return 'rock';
    }
  };
  
  const getMineralColor = (mineralType: string): string => {
    switch(mineralType) {
      case 'gold': return '#FFC107';
      case 'copper': return '#D2691E';
      case 'diamond': return '#B9F2FF';
      default: return '#9E9E9E';
    }
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <Card style={styles.itemCard} onPress={() => handleItemSelect(item)}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <View style={styles.mineralInfo}>
            <View
              style={[
                styles.mineralIcon,
                { backgroundColor: getMineralColor(item.mineralType) }
              ]}
            >
              <Icon 
                name={getMineralIcon(item.mineralType)} 
                size={24} 
                color="#FFFFFF"
              />
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityText}>
                  {item.quantity} {item.unit}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              ${item.pricePerUnit.toLocaleString('en-US')}/{item.unit}
            </Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.sellerContainer}>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{item.seller.name}</Text>
            {item.seller.verified && (
              <Icon name="check-decagram" size={16} color="#2E7D32" style={styles.verifiedIcon} />
            )}
          </View>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFC107" />
            <Text style={styles.ratingText}>
              {item.seller.rating} ({item.seller.reviewCount} reviews)
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleViewSeller(item.seller.id, item.seller.name)}>
            <Text style={styles.viewSellerLink}>View Seller Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.locationContainer}>
          <Icon name="map-marker" size={16} color="#616161" />
          <Text style={styles.locationText}>{item.seller.location} • {item.seller.distance}</Text>
        </View>
        
        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          <Button 
            mode="contained" 
            style={styles.viewButton}
            onPress={() => handleItemSelect(item)}
          >
            View Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.headerTitle}>Mineral Marketplace</Title>
          <Text style={styles.headerSubtitle}>
            Discover high-quality minerals from verified sellers
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#757575" style={styles.searchIcon} />
          <RNTextInput
            placeholder="Search minerals or sellers"
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.locationFilterContainer}>
          <Icon name="map-marker" size={20} color="#757575" style={styles.locationIcon} />
          <RNTextInput
            placeholder="Filter by location"
            onChangeText={handleLocationFilter}
            value={locationFilter}
            style={styles.locationInput}
          />
          {locationFilter.length > 0 && (
            <TouchableOpacity onPress={() => setLocationFilter('')}>
              <Icon name="close" size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filterButtonsContainer}>
          <Button 
            mode={mineralFilter === 'all' ? 'contained' : 'outlined'} 
            onPress={() => setMineralFilter('all')}
            style={styles.filterButton}
            compact
          >
            All
          </Button>
          <Button 
            mode={mineralFilter === 'gold' ? 'contained' : 'outlined'} 
            onPress={() => setMineralFilter('gold')}
            style={styles.filterButton}
            compact
            icon="gold"
          >
            Gold
          </Button>
          <Button 
            mode={mineralFilter === 'copper' ? 'contained' : 'outlined'} 
            onPress={() => setMineralFilter('copper')}
            style={styles.filterButton}
            compact
            icon="circle"
          >
            Copper
          </Button>
          <Button 
            mode={mineralFilter === 'diamond' ? 'contained' : 'outlined'} 
            onPress={() => setMineralFilter('diamond')}
            style={styles.filterButton}
            compact
            icon="diamond-stone"
          >
            Diamond
          </Button>
        </View>
      </View>
      
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {/* Item Detail Modal */}
      <Portal>
        <Modal
          visible={detailModalVisible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedItem && (
            <>
              <Title style={styles.modalTitle}>{selectedItem.name}</Title>
              
              <View style={styles.modalPriceRow}>
                <Text style={styles.modalPriceLabel}>Current Price:</Text>
                <Text style={styles.modalPriceValue}>
                  ${selectedItem.pricePerUnit.toLocaleString('en-US')}/{selectedItem.unit}
                </Text>
              </View>
              
              <Divider style={styles.modalDivider} />
              
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Quantity Available:</Text>
                <Text style={styles.modalInfoValue}>{selectedItem.quantity} {selectedItem.unit}</Text>
              </View>
              
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Purity:</Text>
                <Text style={styles.modalInfoValue}>{selectedItem.purity}</Text>
              </View>
              
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Listed Date:</Text>
                <Text style={styles.modalInfoValue}>{selectedItem.listedDate}</Text>
              </View>
              
              <Divider style={styles.modalDivider} />
              
              <Text style={styles.modalSectionTitle}>About the Seller</Text>
              
              <View style={styles.modalSellerInfo}>
                <Text style={styles.modalSellerName}>{selectedItem.seller.name}</Text>
                {selectedItem.seller.verified && (
                  <Icon name="check-decagram" size={16} color="#2E7D32" style={styles.verifiedIcon} />
                )}
              </View>
              
              <View style={styles.modalRatingContainer}>
                <Icon name="star" size={14} color="#FFC107" />
                <Text style={styles.modalRatingText}>
                  {selectedItem.seller.rating} ({selectedItem.seller.reviewCount} reviews)
                </Text>
              </View>
              
              <View style={styles.modalLocationContainer}>
                <Icon name="map-marker" size={16} color="#616161" />
                <Text style={styles.modalLocationText}>
                  {selectedItem.seller.location} • {selectedItem.seller.distance}
                </Text>
              </View>
              
              <Divider style={styles.modalDivider} />
              
              <Text style={styles.modalSectionTitle}>Description</Text>
              <Paragraph style={styles.modalDescription}>
                {selectedItem.description}
              </Paragraph>
              
              {selectedItem.tags.length > 0 && (
                <View style={styles.modalTagsContainer}>
                  {selectedItem.tags.map((tag, index) => (
                    <View key={index} style={styles.modalTagChip}>
                      <Text style={styles.modalTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.modalButtonsContainer}>
                <Button onPress={hideModal} style={styles.modalButton}>
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handlePlaceOrder} 
                  style={styles.modalButton}
                >
                  Place Order
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
    backgroundColor: '#1976D2',
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
  locationFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 8,
    elevation: 2,
  },
  locationIcon: {
    marginLeft: 8,
    marginRight: 12,
  },
  locationInput: {
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
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  itemCard: {
    marginVertical: 8,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mineralInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mineralIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityContainer: {
    marginTop: 4,
  },
  quantityText: {
    fontSize: 14,
    color: '#616161',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  divider: {
    marginVertical: 12,
  },
  sellerContainer: {
    marginBottom: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 14,
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#616161',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  tagText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    backgroundColor: '#1976D2',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
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
    color: '#1976D2',
  },
  modalDivider: {
    marginVertical: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#616161',
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalSellerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  modalRatingText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#616161',
  },
  modalLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  modalLocationText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#616161',
  },
  modalDescription: {
    marginBottom: 16,
  },
  modalTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  modalTagChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  modalTagText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
  viewSellerLink: {
    color: '#1976D2',
    fontSize: 12,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});

export default MarketplaceScreen; 