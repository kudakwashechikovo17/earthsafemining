import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
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
import { RouteProp } from '@react-navigation/native';

// Define the navigation and route types
type SellerDetailScreenProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any, any>;
};

// Define mineral type
interface Mineral {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  price: number;
  image: string | null;
}

// Define seller type
interface Seller {
  id: string;
  name: string;
  type: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  joinedDate: string;
  description: string;
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  mineralsOffered: Mineral[];
  certifications: string[];
  image: string | null;
}

// Mock seller data
const mockSeller: Seller = {
  id: 's1',
  name: 'Gold Mining Co-op',
  type: 'Cooperative',
  location: 'Eastern Region, Ghana',
  distance: '15 km away',
  rating: 4.8,
  reviewCount: 157,
  verified: true,
  joinedDate: 'February 2022',
  description: 'Gold Mining Co-op is a community-owned cooperative of small-scale miners focused on ethical gold mining. We follow fair trade practices and ensure all our minerals are conflict-free and traceable.',
  contactInfo: {
    phone: '+233 20 1234 5678',
    email: 'info@goldminingcoop.com',
    website: 'www.goldminingcoop.com',
  },
  mineralsOffered: [
    {
      id: 'm1',
      name: 'High-Quality Gold Ore',
      type: 'gold',
      quantity: 5,
      unit: 'kg',
      price: 50000,
      image: null,
    },
    {
      id: 'm2',
      name: 'Raw Gold Nuggets',
      type: 'gold',
      quantity: 1.2,
      unit: 'kg',
      price: 52000,
      image: null,
    },
    {
      id: 'm3',
      name: 'Fine Gold Dust',
      type: 'gold',
      quantity: 0.8,
      unit: 'kg',
      price: 49000,
      image: null,
    },
  ],
  certifications: ['Fair Trade Certified', 'Conflict-Free', 'Community Supported', 'Environmentally Responsible'],
  image: null,
};

// Reviews mock data
const reviews = [
  { id: 'r1', user: 'John D.', rating: 5, comment: 'Excellent quality gold ore, exactly as described.', date: '2023-02-15' },
  { id: 'r2', user: 'Sarah M.', rating: 4, comment: 'Good communication and on-time delivery.', date: '2023-01-28' },
  { id: 'r3', user: 'Robert K.', rating: 5, comment: 'Very satisfied with their certification and transparency.', date: '2023-01-10' },
];

const SellerDetailScreen: React.FC<SellerDetailScreenProps> = ({ navigation, route }) => {
  const [selectedMineral, setSelectedMineral] = useState<Mineral | null>(null);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Ideally, we would get the seller ID from route params and fetch the data
  // For now, we'll use our mock data
  const seller = mockSeller;
  
  const handleMineralSelect = (mineral: Mineral) => {
    setSelectedMineral(mineral);
    setOrderModalVisible(true);
  };
  
  const hideOrderModal = () => {
    setOrderModalVisible(false);
  };
  
  const handlePlaceOrder = () => {
    hideOrderModal();
    if (selectedMineral) {
      alert(`Order request sent for ${selectedMineral.name}`);
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
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={`star-${i}`} name="star" size={16} color="#FFC107" style={styles.starIcon} />
      );
    }
    
    if (halfStar) {
      stars.push(
        <Icon key="half-star" name="star-half" size={16} color="#FFC107" style={styles.starIcon} />
      );
    }
    
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-star-${i}`} name="star-outline" size={16} color="#FFC107" style={styles.starIcon} />
      );
    }
    
    return stars;
  };
  
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.sellerCard}>
        <Card.Content>
          <View style={styles.sellerHeader}>
            <View style={styles.sellerAvatar}>
              <Icon name="account-group" size={40} color="#FFFFFF" />
            </View>
            <View style={styles.sellerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.sellerName}>{seller.name}</Text>
                {seller.verified && (
                  <Icon name="check-decagram" size={20} color="#2E7D32" style={styles.verifiedIcon} />
                )}
              </View>
              <Text style={styles.sellerType}>{seller.type}</Text>
              <View style={styles.ratingContainer}>
                {renderStars(seller.rating)}
                <Text style={styles.ratingText}>
                  {seller.rating} ({seller.reviewCount} reviews)
                </Text>
              </View>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.locationContainer}>
            <Icon name="map-marker" size={20} color="#616161" />
            <Text style={styles.locationText}>{seller.location} • {seller.distance}</Text>
          </View>
          
          <Paragraph style={styles.sellerDescription}>
            {seller.description}
          </Paragraph>
          
          <View style={styles.certificationContainer}>
            {seller.certifications.map((cert, index) => (
              <View key={index} style={styles.certChip}>
                <Text style={styles.certText}>{cert}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Contact Information</Title>
          
          {seller.contactInfo.phone && (
            <View style={styles.contactItem}>
              <Icon name="phone" size={20} color="#1976D2" />
              <Text style={styles.contactText}>{seller.contactInfo.phone}</Text>
            </View>
          )}
          
          {seller.contactInfo.email && (
            <View style={styles.contactItem}>
              <Icon name="email" size={20} color="#1976D2" />
              <Text style={styles.contactText}>{seller.contactInfo.email}</Text>
            </View>
          )}
          
          {seller.contactInfo.website && (
            <View style={styles.contactItem}>
              <Icon name="web" size={20} color="#1976D2" />
              <Text style={styles.contactText}>{seller.contactInfo.website}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Available Minerals</Title>
          
          {seller.mineralsOffered.map((mineral, index) => (
            <View key={mineral.id}>
              {index > 0 && <Divider style={styles.mineralDivider} />}
              <View style={styles.mineralItem}>
                <View style={styles.mineralInfo}>
                  <View
                    style={[
                      styles.mineralIcon,
                      { backgroundColor: getMineralColor(mineral.type) }
                    ]}
                  >
                    <Icon 
                      name={getMineralIcon(mineral.type)} 
                      size={24} 
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.mineralDetails}>
                    <Text style={styles.mineralName}>{mineral.name}</Text>
                    <Text style={styles.mineralQuantity}>
                      {mineral.quantity} {mineral.unit} available
                    </Text>
                    <Text style={styles.mineralPrice}>
                      ${mineral.price.toLocaleString('en-US')}/{mineral.unit}
                    </Text>
                  </View>
                </View>
                <Button 
                  mode="contained" 
                  compact
                  style={styles.orderButton}
                  onPress={() => handleMineralSelect(mineral)}
                >
                  Order
                </Button>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
      
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.reviewHeader}>
            <Title style={styles.sectionTitle}>Reviews</Title>
            <Text style={styles.reviewCount}>{seller.reviewCount} total</Text>
          </View>
          
          {displayedReviews.map((review, index) => (
            <View key={review.id}>
              {index > 0 && <Divider style={styles.reviewDivider} />}
              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{review.user}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <View style={styles.reviewRating}>
                  {renderStars(review.rating)}
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            </View>
          ))}
          
          {reviews.length > 2 && (
            <Button 
              mode="text" 
              onPress={() => setShowAllReviews(!showAllReviews)}
              style={styles.showMoreButton}
            >
              {showAllReviews ? 'Show Less' : 'Show More Reviews'}
            </Button>
          )}
        </Card.Content>
      </Card>
      
      {/* Order Modal */}
      <Portal>
        <Modal
          visible={orderModalVisible}
          onDismiss={hideOrderModal}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedMineral && (
            <>
              <Title style={styles.modalTitle}>Place Order</Title>
              
              <View style={styles.modalMineralInfo}>
                <View
                  style={[
                    styles.modalMineralIcon,
                    { backgroundColor: getMineralColor(selectedMineral.type) }
                  ]}
                >
                  <Icon 
                    name={getMineralIcon(selectedMineral.type)} 
                    size={24} 
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.modalMineralDetails}>
                  <Text style={styles.modalMineralName}>{selectedMineral.name}</Text>
                  <Text style={styles.modalMineralPrice}>
                    ${selectedMineral.price.toLocaleString('en-US')}/{selectedMineral.unit}
                  </Text>
                </View>
              </View>
              
              <Divider style={styles.modalDivider} />
              
              <Paragraph style={styles.modalDescription}>
                You are placing an order with {seller.name} for {selectedMineral.name}.
                The current market price is ${selectedMineral.price.toLocaleString('en-US')} per {selectedMineral.unit}.
              </Paragraph>
              
              <Paragraph style={styles.modalQuantityInfo}>
                Available Quantity: {selectedMineral.quantity} {selectedMineral.unit}
              </Paragraph>
              
              <View style={styles.modalButtonsContainer}>
                <Button onPress={hideOrderModal} style={styles.modalButton}>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  sellerCard: {
    margin: 8,
    elevation: 2,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sellerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sellerType: {
    fontSize: 14,
    color: '#616161',
    marginTop: 2,
  },
  verifiedIcon: {
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#616161',
    marginLeft: 4,
  },
  divider: {
    marginVertical: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#616161',
  },
  sellerDescription: {
    marginVertical: 12,
    lineHeight: 20,
  },
  certificationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  certChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  certText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  sectionCard: {
    margin: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 12,
    fontSize: 16,
  },
  mineralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  mineralInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mineralIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mineralDetails: {
    marginLeft: 12,
    flex: 1,
  },
  mineralName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mineralQuantity: {
    fontSize: 14,
    color: '#616161',
    marginTop: 2,
  },
  mineralPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginTop: 2,
  },
  mineralDivider: {
    marginVertical: 8,
  },
  orderButton: {
    backgroundColor: '#1976D2',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCount: {
    color: '#757575',
    fontSize: 14,
  },
  reviewItem: {
    paddingVertical: 12,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: 12,
    color: '#757575',
  },
  reviewRating: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  reviewDivider: {
    marginVertical: 8,
  },
  showMoreButton: {
    marginTop: 8,
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
  modalMineralInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalMineralIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalMineralDetails: {
    flex: 1,
  },
  modalMineralName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalMineralPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginTop: 2,
  },
  modalDivider: {
    marginVertical: 16,
  },
  modalDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  modalQuantityInfo: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});

export default SellerDetailScreen; 