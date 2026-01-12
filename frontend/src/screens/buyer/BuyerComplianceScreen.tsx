import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Text, 
  Button, 
  Divider, 
  List, 
  IconButton,
  Portal,
  Modal,
  Paragraph,
  ActivityIndicator
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { BuyerStackParamList } from '../../types/navigation';

// Try to import document picker, but handle gracefully if it's not available
let DocumentPicker: any;
try {
  DocumentPicker = require('expo-document-picker');
} catch (error) {
  console.log('expo-document-picker not available');
}

// Define navigation type
type BuyerComplianceScreenProps = {
  navigation: StackNavigationProp<BuyerStackParamList, 'Compliance'>;
};

// Define document type
interface ComplianceDocument {
  id: string;
  type: 'license' | 'certificate' | 'permit' | 'other';
  name: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  documentUrl: string | null;
  notes: string;
  required: boolean;
}

// Mock data for compliance documents
const initialComplianceDocuments: ComplianceDocument[] = [
  {
    id: 'doc1',
    type: 'license',
    name: 'Mineral Buyer\'s License',
    issueDate: '2023-01-15',
    expiryDate: '2024-01-14',
    issuingAuthority: 'Ministry of Mines',
    status: 'valid',
    documentUrl: null,
    notes: 'Annual renewal required',
    required: true,
  },
  {
    id: 'doc2',
    type: 'license',
    name: 'Trading License',
    issueDate: '2022-11-10',
    expiryDate: '2023-11-09',
    issuingAuthority: 'Department of Trade and Industry',
    status: 'expiring',
    documentUrl: null,
    notes: 'Renewal application submitted',
    required: true,
  },
  {
    id: 'doc3',
    type: 'certificate',
    name: 'Kimberley Process Certificate',
    issueDate: '2023-03-22',
    expiryDate: '2024-03-21',
    issuingAuthority: 'Kimberley Process Certification Scheme',
    status: 'valid',
    documentUrl: null,
    notes: 'Required for diamond trading only',
    required: false,
  },
  {
    id: 'doc4',
    type: 'permit',
    name: 'Customs Import Permit',
    issueDate: '2023-02-05',
    expiryDate: '2024-02-04',
    issuingAuthority: 'Customs Department',
    status: 'valid',
    documentUrl: null,
    notes: 'For international mineral purchases',
    required: true,
  },
  {
    id: 'doc5',
    type: 'permit',
    name: 'Customs Export Permit',
    issueDate: '2023-02-05',
    expiryDate: '2024-02-04',
    issuingAuthority: 'Customs Department',
    status: 'valid',
    documentUrl: null,
    notes: 'For international mineral sales',
    required: true,
  },
];

const BuyerComplianceScreen: React.FC<BuyerComplianceScreenProps> = ({ navigation }) => {
  const [complianceDocuments, setComplianceDocuments] = useState<ComplianceDocument[]>(initialComplianceDocuments);
  const [selectedDocument, setSelectedDocument] = useState<ComplianceDocument | null>(null);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [renewalModalVisible, setRenewalModalVisible] = useState(false);
  const [renewalLoading, setRenewalLoading] = useState(false);

  // Calculate compliance score (simple percentage of valid required documents)
  const requiredDocuments = complianceDocuments.filter(doc => doc.required);
  const validRequiredDocuments = requiredDocuments.filter(doc => doc.status === 'valid');
  const complianceScore = requiredDocuments.length > 0 
    ? Math.round((validRequiredDocuments.length / requiredDocuments.length) * 100) 
    : 100;

  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'valid': return '#2E7D32';
      case 'expiring': return '#FFA000';
      case 'expired': return '#D32F2F';
      case 'pending': return '#1976D2';
      default: return '#757575';
    }
  };

  const getDocumentIcon = (type: string): string => {
    switch(type) {
      case 'license': return 'license';
      case 'certificate': return 'certificate';
      case 'permit': return 'file-document-outline';
      default: return 'file-outline';
    }
  };

  const handleDocumentSelect = (document: ComplianceDocument) => {
    setSelectedDocument(document);
    setDocumentModalVisible(true);
  };

  const hideDocumentModal = () => {
    setDocumentModalVisible(false);
  };

  const handleRenewalRequest = (document: ComplianceDocument) => {
    setSelectedDocument(document);
    setRenewalModalVisible(true);
  };

  const hideRenewalModal = () => {
    setRenewalModalVisible(false);
  };

  const handleSubmitRenewal = async () => {
    if (!selectedDocument) return;
    
    setRenewalLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedDocuments = complianceDocuments.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, status: 'pending' as const, notes: doc.notes + ' - Renewal submitted' } 
          : doc
      );
      
      setComplianceDocuments(updatedDocuments);
      setRenewalLoading(false);
      setRenewalModalVisible(false);
      
      // Show success message
      Alert.alert('Success', 'Renewal request submitted successfully');
    }, 2000);
  };

  const handleDocumentUpload = async (documentId: string) => {
    // If DocumentPicker is not available, show an alert
    if (!DocumentPicker) {
      Alert.alert(
        'Feature Not Available',
        'Document upload functionality is not available in this build.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Update the document with the new URL
        const updatedDocuments = complianceDocuments.map(doc => 
          doc.id === documentId 
            ? { ...doc, documentUrl: asset.uri } 
            : doc
        );
        
        setComplianceDocuments(updatedDocuments);
        
        // If there's a selected document in the modal, update it too
        if (selectedDocument && selectedDocument.id === documentId) {
          setSelectedDocument({ ...selectedDocument, documentUrl: asset.uri });
        }
        
        // Show success message
        Alert.alert('Success', 'Document uploaded successfully');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  const renderComplianceStatus = () => {
    let statusText = '';
    let statusColor = '';
    
    if (complianceScore === 100) {
      statusText = 'Fully Compliant';
      statusColor = '#2E7D32';
    } else if (complianceScore >= 75) {
      statusText = 'Mostly Compliant';
      statusColor = '#FFA000';
    } else if (complianceScore >= 50) {
      statusText = 'Partially Compliant';
      statusColor = '#FFA000';
    } else {
      statusText = 'Non-Compliant';
      statusColor = '#D32F2F';
    }
    
    return (
      <View style={styles.complianceStatusContainer}>
        <View style={[styles.complianceScoreCircle, { borderColor: statusColor }]}>
          <Text style={[styles.complianceScoreText, { color: statusColor }]}>{complianceScore}%</Text>
        </View>
        <View style={styles.complianceStatusTextContainer}>
          <Text style={[styles.complianceStatusText, { color: statusColor }]}>{statusText}</Text>
          <Text style={styles.complianceStatusSubtext}>
            {validRequiredDocuments.length} of {requiredDocuments.length} required documents are valid
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.headerTitle}>Buyer Compliance</Title>
          <Text style={styles.headerSubtitle}>
            Manage your licenses, certificates, and regulatory compliance
          </Text>
        </Card.Content>
      </Card>
      
      <Card style={styles.complianceCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Compliance Status</Title>
          {renderComplianceStatus()}
          
          {complianceScore < 100 && (
            <Text style={styles.warningText}>
              Some of your documents need attention. Review the items below.
            </Text>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.documentsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Required Documents</Title>
          
          {requiredDocuments.map((document) => (
            <React.Fragment key={document.id}>
              <List.Item
                title={document.name}
                description={`Expires: ${document.expiryDate} • ${document.issuingAuthority}`}
                left={props => (
                  <View style={[
                    styles.documentIconContainer, 
                    { backgroundColor: getStatusColor(document.status) + '20' }
                  ]}>
                    <Icon 
                      name={getDocumentIcon(document.type)} 
                      size={24} 
                      color={getStatusColor(document.status)} 
                    />
                  </View>
                )}
                right={props => (
                  <View style={styles.documentActionsContainer}>
                    <View 
                      style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: getStatusColor(document.status) + '20',
                          borderColor: getStatusColor(document.status)
                        }
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
                    <IconButton 
                      icon="dots-vertical" 
                      size={20} 
                      onPress={() => handleDocumentSelect(document)} 
                    />
                  </View>
                )}
                onPress={() => handleDocumentSelect(document)}
                style={styles.documentItem}
              />
              <Divider />
            </React.Fragment>
          ))}
          
          <Title style={[styles.sectionTitle, styles.optionalTitle]}>Optional Documents</Title>
          
          {complianceDocuments.filter(doc => !doc.required).map((document) => (
            <React.Fragment key={document.id}>
              <List.Item
                title={document.name}
                description={`Expires: ${document.expiryDate} • ${document.issuingAuthority}`}
                left={props => (
                  <View style={[
                    styles.documentIconContainer, 
                    { backgroundColor: getStatusColor(document.status) + '20' }
                  ]}>
                    <Icon 
                      name={getDocumentIcon(document.type)} 
                      size={24} 
                      color={getStatusColor(document.status)} 
                    />
                  </View>
                )}
                right={props => (
                  <View style={styles.documentActionsContainer}>
                    <View 
                      style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: getStatusColor(document.status) + '20',
                          borderColor: getStatusColor(document.status)
                        }
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
                    <IconButton 
                      icon="dots-vertical" 
                      size={20} 
                      onPress={() => handleDocumentSelect(document)} 
                    />
                  </View>
                )}
                onPress={() => handleDocumentSelect(document)}
                style={styles.documentItem}
              />
              <Divider />
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>
      
      {/* Document Details Modal */}
      <Portal>
        <Modal
          visible={documentModalVisible}
          onDismiss={hideDocumentModal}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedDocument && (
            <>
              <View style={styles.modalHeader}>
                <Title style={styles.modalTitle}>{selectedDocument.name}</Title>
                <View 
                  style={[
                    styles.modalStatusBadge, 
                    { 
                      backgroundColor: getStatusColor(selectedDocument.status) + '20',
                      borderColor: getStatusColor(selectedDocument.status)
                    }
                  ]}
                >
                  <Text 
                    style={[
                      styles.modalStatusText, 
                      { color: getStatusColor(selectedDocument.status) }
                    ]}
                  >
                    {selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
                  </Text>
                </View>
              </View>
              
              <Divider style={styles.modalDivider} />
              
              <View style={styles.documentDetailRow}>
                <Text style={styles.documentDetailLabel}>Type:</Text>
                <Text style={styles.documentDetailValue}>
                  {selectedDocument.type.charAt(0).toUpperCase() + selectedDocument.type.slice(1)}
                </Text>
              </View>
              
              <View style={styles.documentDetailRow}>
                <Text style={styles.documentDetailLabel}>Issuing Authority:</Text>
                <Text style={styles.documentDetailValue}>{selectedDocument.issuingAuthority}</Text>
              </View>
              
              <View style={styles.documentDetailRow}>
                <Text style={styles.documentDetailLabel}>Issue Date:</Text>
                <Text style={styles.documentDetailValue}>{selectedDocument.issueDate}</Text>
              </View>
              
              <View style={styles.documentDetailRow}>
                <Text style={styles.documentDetailLabel}>Expiry Date:</Text>
                <Text style={styles.documentDetailValue}>{selectedDocument.expiryDate}</Text>
              </View>
              
              <View style={styles.documentDetailRow}>
                <Text style={styles.documentDetailLabel}>Required:</Text>
                <Text style={styles.documentDetailValue}>{selectedDocument.required ? 'Yes' : 'No'}</Text>
              </View>
              
              <Divider style={styles.modalDivider} />
              
              <Text style={styles.notesLabel}>Notes:</Text>
              <Paragraph style={styles.notesText}>
                {selectedDocument.notes}
              </Paragraph>
              
              <View style={styles.documentFileSection}>
                <Text style={styles.documentFileLabel}>Document File:</Text>
                {selectedDocument.documentUrl ? (
                  <View style={styles.documentFileRow}>
                    <Icon name="file-pdf-box" size={24} color="#D32F2F" />
                    <Text style={styles.documentFileName}>
                      {selectedDocument.name.replace(/\s+/g, '_').toLowerCase()}.pdf
                    </Text>
                    <Button 
                      mode="text" 
                      compact 
                      onPress={() => alert('Viewing document...')}
                    >
                      View
                    </Button>
                  </View>
                ) : (
                  <Button 
                    mode="outlined" 
                    icon="upload" 
                    onPress={() => handleDocumentUpload(selectedDocument.id)}
                    style={styles.uploadButton}
                  >
                    Upload Document
                  </Button>
                )}
              </View>
              
              <View style={styles.modalButtonsContainer}>
                <Button 
                  onPress={hideDocumentModal} 
                  style={styles.modalButton}
                >
                  Close
                </Button>
                
                {(selectedDocument.status === 'expiring' || selectedDocument.status === 'expired') && (
                  <Button 
                    mode="contained" 
                    onPress={() => {
                      hideDocumentModal();
                      handleRenewalRequest(selectedDocument);
                    }}
                    style={styles.modalButton}
                    icon="autorenew"
                  >
                    Request Renewal
                  </Button>
                )}
              </View>
            </>
          )}
        </Modal>
      </Portal>
      
      {/* Renewal Request Modal */}
      <Portal>
        <Modal
          visible={renewalModalVisible}
          onDismiss={hideRenewalModal}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedDocument && (
            <>
              <Title style={styles.modalTitle}>Request Document Renewal</Title>
              
              <Paragraph style={styles.renewalText}>
                You are about to request renewal for:
              </Paragraph>
              
              <View style={styles.renewalDocumentCard}>
                <Text style={styles.renewalDocumentName}>{selectedDocument.name}</Text>
                <Text style={styles.renewalDocumentDetails}>
                  Expires on {selectedDocument.expiryDate}
                </Text>
              </View>
              
              <Paragraph style={styles.renewalText}>
                This will submit a request to {selectedDocument.issuingAuthority} for renewal of your document.
                You may be contacted for additional information or payment details.
              </Paragraph>
              
              <View style={styles.modalButtonsContainer}>
                <Button 
                  onPress={hideRenewalModal} 
                  style={styles.modalButton}
                  disabled={renewalLoading}
                >
                  Cancel
                </Button>
                
                <Button 
                  mode="contained" 
                  onPress={handleSubmitRenewal}
                  style={styles.modalButton}
                  disabled={renewalLoading}
                  loading={renewalLoading}
                >
                  {renewalLoading ? 'Submitting...' : 'Submit Request'}
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
  complianceCard: {
    margin: 8,
    elevation: 2,
  },
  documentsCard: {
    margin: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  optionalTitle: {
    marginTop: 16,
  },
  complianceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  complianceScoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  complianceScoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  complianceStatusTextContainer: {
    flex: 1,
  },
  complianceStatusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  complianceStatusSubtext: {
    fontSize: 14,
    color: '#757575',
  },
  warningText: {
    color: '#FFA000',
    marginTop: 8,
  },
  documentItem: {
    paddingVertical: 8,
  },
  documentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginVertical: 8,
  },
  documentActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalDivider: {
    marginVertical: 16,
  },
  documentDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  documentDetailLabel: {
    width: 120,
    fontWeight: 'bold',
    color: '#616161',
  },
  documentDetailValue: {
    flex: 1,
  },
  notesLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notesText: {
    marginBottom: 16,
  },
  documentFileSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  documentFileLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  documentFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentFileName: {
    flex: 1,
    marginLeft: 8,
  },
  uploadButton: {
    marginTop: 8,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
  renewalText: {
    marginBottom: 16,
  },
  renewalDocumentCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  renewalDocumentName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  renewalDocumentDetails: {
    color: '#616161',
  },
});

export default BuyerComplianceScreen; 