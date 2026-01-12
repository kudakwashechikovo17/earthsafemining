import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Card,
  Title,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  Text,
  Divider,
  List,
  Avatar,
  SegmentedButtons,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const ProductionScreen = () => {
  const [visible, setVisible] = useState(false);
  const [timeFilter, setTimeFilter] = useState('week');
  const [productionEntries, setProductionEntries] = useState([
    {
      id: '1',
      date: '2023-11-15',
      mineralType: 'gold',
      quantity: 25,
      unit: 'grams',
      purity: 92,
      location: 'Mine Site A',
      verified: true,
    },
    {
      id: '2',
      date: '2023-11-14',
      mineralType: 'gold',
      quantity: 18,
      unit: 'grams',
      purity: 88,
      location: 'Mine Site B',
      verified: false,
    },
    {
      id: '3',
      date: '2023-11-13',
      mineralType: 'gold',
      quantity: 32,
      unit: 'grams',
      purity: 95,
      location: 'Mine Site A',
      verified: true,
    },
  ]);

  const [newEntry, setNewEntry] = useState({
    mineralType: 'gold',
    quantity: '',
    unit: 'grams',
    purity: '',
    location: '',
    notes: '',
    images: [],
  });

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewEntry({
        ...newEntry,
        images: [...newEntry.images, result.assets[0].uri],
      });
    }
  };

  const handleLocationPicker = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setNewEntry({
      ...newEntry,
      location: `${location.coords.latitude}, ${location.coords.longitude}`,
    });
  };

  const handleSubmit = () => {
    // TODO: Implement API call to save production entry
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ...newEntry,
      verified: false,
    };

    setProductionEntries([entry, ...productionEntries]);
    setNewEntry({
      mineralType: 'gold',
      quantity: '',
      unit: 'grams',
      purity: '',
      location: '',
      notes: '',
      images: [],
    });
    hideModal();
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Production Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Production Summary</Title>
            <SegmentedButtons
              value={timeFilter}
              onValueChange={setTimeFilter}
              buttons={[
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
              ]}
              style={styles.filterButtons}
            />
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>75g</Text>
                <Text style={styles.summaryLabel}>Total Production</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>91.6%</Text>
                <Text style={styles.summaryLabel}>Avg. Purity</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>66%</Text>
                <Text style={styles.summaryLabel}>Verified</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Production Entries List */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Production Entries</Title>
            {productionEntries.map((entry) => (
              <View key={entry.id}>
                <List.Item
                  title={`${entry.quantity} ${entry.unit} of ${entry.mineralType}`}
                  description={`Location: ${entry.location}\nPurity: ${entry.purity}%`}
                  left={() => (
                    <Avatar.Icon
                      size={40}
                      icon="pickaxe"
                      style={{
                        backgroundColor: entry.verified ? '#2E7D32' : '#FFA000',
                      }}
                    />
                  )}
                  right={() => (
                    <View style={styles.entryMetadata}>
                      <Text style={styles.entryDate}>{entry.date}</Text>
                      {entry.verified && (
                        <Icon name="check-circle" size={20} color="#2E7D32" />
                      )}
                    </View>
                  )}
                />
                <Divider />
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add Production Entry FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={showModal}
      />

      {/* Add Production Entry Modal */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Add Production Entry</Title>

            <TextInput
              label="Quantity"
              value={newEntry.quantity}
              onChangeText={(text) => setNewEntry({ ...newEntry, quantity: text })}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Purity (%)"
              value={newEntry.purity}
              onChangeText={(text) => setNewEntry({ ...newEntry, purity: text })}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Location"
              value={newEntry.location}
              onChangeText={(text) => setNewEntry({ ...newEntry, location: text })}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon="map-marker"
                  onPress={handleLocationPicker}
                />
              }
            />

            <TextInput
              label="Notes"
              value={newEntry.notes}
              onChangeText={(text) => setNewEntry({ ...newEntry, notes: text })}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <Button
              mode="outlined"
              onPress={handleImagePicker}
              style={styles.imageButton}
              icon="camera"
            >
              Add Images
            </Button>

            {newEntry.images.length > 0 && (
              <Text style={styles.imageCount}>
                {newEntry.images.length} image(s) selected
              </Text>
            )}

            <View style={styles.modalActions}>
              <Button onPress={hideModal} style={styles.modalButton}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.modalButton}
              >
                Save
              </Button>
            </View>
          </ScrollView>
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
  card: {
    margin: 8,
    elevation: 2,
  },
  filterButtons: {
    marginVertical: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  entryMetadata: {
    alignItems: 'flex-end',
  },
  entryDate: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2E7D32',
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
  input: {
    marginBottom: 16,
  },
  imageButton: {
    marginBottom: 16,
  },
  imageCount: {
    marginBottom: 16,
    color: '#666666',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});

export default ProductionScreen; 