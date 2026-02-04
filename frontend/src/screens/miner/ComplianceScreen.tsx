import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import {
  Card,
  Title,
  Text,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  List,
  Avatar,
  Divider,
  ProgressBar,
  Chip,
  Menu,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';

// Define the required document types for 100% compliance
const REQUIRED_DOCUMENT_TYPES = [
  'Mining License',
  'Prospecting License',
  'Environmental Impact Assessment Certificate',
  'Health and Safety Certification',
  'Local Permit',
];

const ComplianceScreen = () => {
  const navigation = useNavigation();
  const { currentOrg } = useSelector((state: RootState) => state.auth);
  const [visible, setVisible] = useState(false);
  const [documentTypeMenuVisible, setDocumentTypeMenuVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (currentOrg) {
      fetchDocuments();
    }
  }, [currentOrg]);

  const fetchDocuments = async () => {
    if (!currentOrg) return;
    try {
      setLoading(true);
      const data = await apiService.getComplianceDocuments(currentOrg._id);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch compliance documents:', error);
      Alert.alert('Error', 'Failed to load compliance documents');
    } finally {
      setLoading(false);
    }
  };

  const [newDocument, setNewDocument] = useState({
    type: '',
    number: '',
    issuedDate: '',
    expiryDate: '',
    issuer: '',
    file: null as string | null,
    notes: '',
  });

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const showDocumentTypeMenu = () => setDocumentTypeMenuVisible(true);
  const hideDocumentTypeMenu = () => setDocumentTypeMenuVisible(false);

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (!result.canceled) {
        setNewDocument({
          ...newDocument,
          file: result.assets[0].uri,
        });
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const handleSubmit = async () => {
    if (!newDocument.type) {
      Alert.alert('Error', 'Please select a document type');
      return;
    }

    if (!currentOrg) {
      Alert.alert('Error', 'No organization selected');
      return;
    }

    // Check if document type already exists and is not expired
    const existingDoc = documents.find(
      doc => doc.type === newDocument.type && doc.status !== 'expired'
    );

    if (existingDoc) {
      Alert.alert('Warning', `You already have an active ${newDocument.type} document. Please update it instead of adding a new one.`);
      return;
    }

    // Start the upload
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 0.25;
        return newProgress > 0.9 ? 0.9 : newProgress;
      });
    }, 500);

    try {
      const documentData = {
        type: newDocument.type,
        number: newDocument.number,
        issuedDate: newDocument.issuedDate,
        expiryDate: newDocument.expiryDate,
        issuer: newDocument.issuer,
        notes: newDocument.notes,
        fileUrl: newDocument.file, // Placeholder for now
      };

      await apiService.uploadComplianceDocument(currentOrg._id, documentData);

      clearInterval(progressInterval);
      setUploadProgress(1);

      // Refresh documents list
      await fetchDocuments();

      // Reset form and states
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setNewDocument({
          type: '',
          number: '',
          issuedDate: '',
          expiryDate: '',
          issuer: '',
          file: null,
          notes: '',
        });
        hideModal();
        Alert.alert('Success', 'Document uploaded successfully');
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#2E7D32';
      case 'expiring':
        return '#FFA000';
      case 'expired':
        return '#D32F2F';
      default:
        return '#757575';
    }
  };

  // Get missing document types
  const getMissingDocuments = () => {
    // Get all active and expiring document types (not expired)
    const activeDocumentTypes = documents
      .filter(doc => doc.status !== 'expired')
      .map(doc => doc.type);

    // Find required documents that are not in the active documents list
    return REQUIRED_DOCUMENT_TYPES.filter(
      type => !activeDocumentTypes.includes(type)
    );
  };

  // Calculate compliance score based on required documents
  const getComplianceScore = () => {
    const total = REQUIRED_DOCUMENT_TYPES.length;

    // Only count active and expiring documents (not expired)
    const validDocuments = documents.filter(doc => doc.status !== 'expired');
    const uniqueValidTypes = new Set(validDocuments.map(doc => doc.type));
    const valid = uniqueValidTypes.size;

    // Ensure we return a number, not a string
    const score = (valid / total) * 100;
    return score.toString();
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Safety Hub */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Safety Hub</Title>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="alert-octagon"
                onPress={() => (navigation as any).navigate('IncidentReport')}
                style={[styles.actionButton, { backgroundColor: '#D32F2F' }]}
              >
                Report Incident
              </Button>
              <Button
                mode="contained"
                icon="clipboard-check"
                onPress={() => (navigation as any).navigate('SafetyChecklist')}
                style={[styles.actionButton, { backgroundColor: '#0288D1' }]}
              >
                Daily Checklist
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Compliance Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Compliance Documents</Title>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreValue}>{getComplianceScore()}%</Text>
              <Text style={styles.scoreLabel}>Compliance Score</Text>
              <ProgressBar
                progress={parseFloat(getComplianceScore()) / 100}
                color={getStatusColor('active')}
                style={styles.progressBar}
              />
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {documents.filter(doc => doc.status === 'active').length}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {documents.filter(doc => doc.status === 'expiring').length}
                </Text>
                <Text style={styles.statLabel}>Expiring Soon</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {documents.filter(doc => doc.status === 'expired').length}
                </Text>
                <Text style={styles.statLabel}>Expired</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Missing Documents */}
        {getMissingDocuments().length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Missing Documents</Title>
              <Text style={styles.missingDocumentsText}>
                To achieve 100% compliance, please upload the following documents:
              </Text>
              {getMissingDocuments().map((docType, index) => (
                <View key={index} style={styles.missingDocumentItem}>
                  <Icon name="file-alert-outline" size={20} color="#D32F2F" style={styles.missingDocumentIcon} />
                  <Text style={styles.missingDocumentText}>{docType}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Documents List */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Required Documents</Title>
            {documents.map((document) => (
              <View key={document.id}>
                <List.Item
                  title={document.type}
                  description={`Number: ${document.number}\nIssued by: ${document.issuer}\nValid until: ${document.expiryDate}`}
                  left={() => (
                    <Avatar.Icon
                      size={40}
                      icon="file-document"
                      style={{
                        backgroundColor: getStatusColor(document.status),
                      }}
                    />
                  )}
                  right={() => (
                    <View style={styles.documentMetadata}>
                      <View
                        style={[
                          styles.statusBadge,
                          { borderColor: getStatusColor(document.status) }
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(document.status) }
                          ]}
                        >
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </Text>
                      </View>
                      {document.daysLeft > 0 && (
                        <Text
                          style={[
                            styles.daysLeft,
                            { color: getStatusColor(document.status) },
                          ]}
                        >
                          {document.daysLeft} days left
                        </Text>
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

      {/* Add Document FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={showModal}
      />

      {/* Add Document Modal */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Add Document</Title>

            {/* Document Type Selection */}
            <View style={styles.documentTypeContainer}>
              <Text style={styles.inputLabel}>Document Type*</Text>
              <Button
                mode="outlined"
                onPress={showDocumentTypeMenu}
                style={styles.documentTypeButton}
              >
                {newDocument.type || 'Select Document Type'}
                <Icon name="menu-down" size={20} />
              </Button>

              <Portal>
                <Modal
                  visible={documentTypeMenuVisible}
                  onDismiss={hideDocumentTypeMenu}
                  contentContainerStyle={styles.documentTypeModal}
                >
                  <Title style={styles.documentTypeModalTitle}>Select Document Type</Title>
                  {REQUIRED_DOCUMENT_TYPES.map((docType) => (
                    <Button
                      key={docType}
                      mode="text"
                      style={styles.documentTypeOption}
                      onPress={() => {
                        setNewDocument({ ...newDocument, type: docType });
                        hideDocumentTypeMenu();
                      }}
                    >
                      {docType}
                    </Button>
                  ))}
                  <Button
                    mode="outlined"
                    onPress={hideDocumentTypeMenu}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                </Modal>
              </Portal>
            </View>

            <TextInput
              label="Document Number"
              value={newDocument.number}
              onChangeText={(text) => setNewDocument({ ...newDocument, number: text })}
              style={styles.input}
            />

            <TextInput
              label="Issuing Authority"
              value={newDocument.issuer}
              onChangeText={(text) => setNewDocument({ ...newDocument, issuer: text })}
              style={styles.input}
            />

            <TextInput
              label="Issue Date"
              value={newDocument.issuedDate}
              onChangeText={(text) => setNewDocument({ ...newDocument, issuedDate: text })}
              style={styles.input}
              placeholder="YYYY-MM-DD"
            />

            <TextInput
              label="Expiry Date"
              value={newDocument.expiryDate}
              onChangeText={(text) => setNewDocument({ ...newDocument, expiryDate: text })}
              style={styles.input}
              placeholder="YYYY-MM-DD"
            />

            <TextInput
              label="Notes"
              value={newDocument.notes}
              onChangeText={(text) => setNewDocument({ ...newDocument, notes: text })}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <Button
              mode="outlined"
              onPress={handleDocumentPicker}
              style={styles.documentButton}
              icon="file-upload"
            >
              Upload Document
            </Button>

            {newDocument.file && (
              <Text style={styles.fileConfirmation}>Document uploaded</Text>
            )}

            <View style={styles.modalActions}>
              <Button onPress={hideModal} style={styles.modalButton} disabled={isUploading}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.modalButton}
                loading={isUploading}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Save'}
              </Button>
            </View>

            {isUploading && (
              <View style={styles.uploadingContainer}>
                <Text style={styles.uploadingText}>
                  Uploading Document... {Math.round(uploadProgress * 100)}%
                </Text>
                <ProgressBar
                  progress={uploadProgress}
                  color="#2E7D32"
                  style={styles.uploadProgressBar}
                />
              </View>
            )}
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10
  },
  actionButton: {
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666666',
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    width: '100%',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  documentMetadata: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
    marginLeft: 8,
  },
  statusBadge: {
    padding: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  daysLeft: {
    fontSize: 12,
    fontWeight: 'bold',
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
  documentButton: {
    marginBottom: 16,
  },
  fileConfirmation: {
    marginBottom: 16,
    color: '#2E7D32',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
  missingDocumentsText: {
    marginVertical: 8,
    color: '#666666',
  },
  missingDocumentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  missingDocumentIcon: {
    marginRight: 8,
  },
  missingDocumentText: {
    color: '#D32F2F',
  },
  documentTypeContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  documentTypeButton: {
    width: '100%',
    justifyContent: 'space-between',
  },
  documentTypeModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  documentTypeModalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  documentTypeOption: {
    marginVertical: 4,
  },
  cancelButton: {
    marginTop: 16,
  },
  uploadingContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  uploadingText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadProgressBar: {
    height: 6,
    borderRadius: 3,
  },
});

export default ComplianceScreen; 