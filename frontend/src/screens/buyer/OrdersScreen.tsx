import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';

// Define the Order type
interface Order {
  id: string;
  product: string;
  quantity: string;
  price: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  seller: string;
}

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: '1',
    product: 'Gold',
    quantity: '2 kg',
    price: '$100,000',
    date: '2023-03-01',
    status: 'delivered',
    seller: 'Gold Mining Co-op',
  },
  {
    id: '2',
    product: 'Copper',
    quantity: '50 kg',
    price: '$4,250',
    date: '2023-03-05',
    status: 'shipped',
    seller: 'Copper Miners Association',
  },
  {
    id: '3',
    product: 'Diamond',
    quantity: '20 carats',
    price: '$70,000',
    date: '2023-03-08',
    status: 'processing',
    seller: 'Diamond Cooperative',
  },
];

const OrdersScreen = () => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#FFA000'; // Amber
      case 'processing':
        return '#2196F3'; // Blue
      case 'shipped':
        return '#7B1FA2'; // Purple
      case 'delivered':
        return '#388E3C'; // Green
      case 'cancelled':
        return '#D32F2F'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  const renderItem = ({ item }: { item: Order }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.product}</Title>
        <View style={styles.detailsRow}>
          <Paragraph>Order ID: {item.id}</Paragraph>
          <Chip 
            style={{ backgroundColor: getStatusColor(item.status) }} 
            textStyle={{ color: 'white' }}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
        <Paragraph>Quantity: {item.quantity}</Paragraph>
        <Paragraph>Price: {item.price}</Paragraph>
        <Paragraph>Date: {item.date}</Paragraph>
        <Paragraph>Seller: {item.seller}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Orders</Text>
      </View>
      
      <FlatList
        data={mockOrders}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#2E7D32',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
});

export default OrdersScreen; 