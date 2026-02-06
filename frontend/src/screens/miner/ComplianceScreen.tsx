import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import { Text, Portal, Modal, TextInput, Button, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import ScreenWrapper from '../../components/ScreenWrapper';
import { colors } from '../../theme/darkTheme';

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

  const [tab, setTab] = useState('documents');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [documentTypeMenuVisible, setDocumentTypeMenuVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newDocument, setNewDocument] = useState({
    type: '',
    number: '',
    issuedDate: '',
    expiryDate: '',
    issuer: '',
    file: null as string | null,
    notes: '',
  });

  useFocusEffect(
    React.useCallback(() => {
      if (currentOrg) loadData();
    }, [currentOrg])
  );

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchDocuments(), fetchIncidents()]);
    setLoading(false);
    setRefreshing(false);
  };

  const fetchDocuments = async () => {
    if (!currentOrg) return;
    try {
      const data = await apiService.getComplianceDocuments(currentOrg._id);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch compliance documents:', error);
    }
  };

  const fetchIncidents = async () => {
    if (!currentOrg) return;
    try {
      const data = await apiService.getIncidents(currentOrg._id);
      setIncidents(data);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const showDocModal = (prefilledType?: string) => {
    if (prefilledType) setNewDocument(prev => ({ ...prev, type: prefilledType }));
    setDocModalVisible(true);
  };

  const hideDocModal = () => setDocModalVisible(false);

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'] });
      if (!result.canceled) {
        setNewDocument({ ...newDocument, file: result.assets[0].uri });
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const handleSubmitDocument = async () => {
    if (!newDocument.type) {
      Alert.alert('Error', 'Please select a document type');
      return;
    }
    if (!currentOrg) return;

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => (prev + 0.1 > 0.9 ? 0.9 : prev + 0.1));
    }, 500);

    try {
      const formData = new FormData();
      formData.append('type', newDocument.type);
      formData.append('number', newDocument.number);
      formData.append('issuedDate', newDocument.issuedDate);
      formData.append('expiryDate', newDocument.expiryDate);
      formData.append('issuer', newDocument.issuer);
      formData.append('notes', newDocument.notes);

      if (newDocument.file) {
        const filename = newDocument.file.split('/').pop() || 'document.jpg';
        const fileType = filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
        formData.append('file', { uri: newDocument.file, name: filename, type: fileType } as any);
      }

      await apiService.uploadComplianceDocument(currentOrg._id, formData);

      clearInterval(progressInterval);
      setUploadProgress(1);
      await fetchDocuments();

      setTimeout(() => {
        setIsUploading(false);
        setNewDocument({ type: '', number: '', issuedDate: '', expiryDate: '', issuer: '', file: null, notes: '' });
        hideDocModal();
        Alert.alert('Success', 'Document uploaded successfully');
      }, 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      setIsUploading(false);
      Alert.alert('Error', error.response?.data?.message || 'Failed to upload document');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    const doDelete = async () => {
      try {
        if (!currentOrg) return;
        await apiService.deleteComplianceDocument(currentOrg._id, docId);
        fetchDocuments();
      } catch (error) {
        Alert.alert('Error', 'Failed to delete document');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete this document?')) doDelete();
    } else {
      Alert.alert('Delete', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: doDelete }]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'expiring': return colors.gold;
      case 'expired': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getMissingDocuments = () => {
    const activeTypes = documents.filter(d => d.status !== 'expired').map(d => d.type);
    return REQUIRED_DOCUMENT_TYPES.filter(t => !activeTypes.includes(t));
  };

  const getComplianceScore = () => {
    const uniqueValid = new Set(documents.filter(d => d.status !== 'expired').map(d => d.type)).size;
    return (uniqueValid / REQUIRED_DOCUMENT_TYPES.length) * 100;
  };

  if (loading && !refreshing) {
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
        {/* Safety Hub */}
        <View style={styles.safetyHub}>
          <TouchableOpacity style={[styles.safetyButton, { backgroundColor: 'rgba(211, 47, 47, 0.15)' }]} onPress={() => (navigation as any).navigate('IncidentReport')}>
            <Icon name="alert-octagon" size={28} color={colors.error} />
            <Text style={styles.safetyButtonText}>Report Incident</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.safetyButton, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]} onPress={() => (navigation as any).navigate('SafetyChecklist')}>
            <Icon name="clipboard-check" size={28} color="#2196F3" />
            <Text style={styles.safetyButtonText}>Daily Checklist</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, tab === 'documents' && styles.tabActive]} onPress={() => setTab('documents')}>
            <Icon name="file-document" size={18} color={tab === 'documents' ? colors.gold : colors.textMuted} />
            <Text style={[styles.tabText, tab === 'documents' && styles.tabTextActive]}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'incidents' && styles.tabActive]} onPress={() => setTab('incidents')}>
            <Icon name="alert" size={18} color={tab === 'incidents' ? colors.gold : colors.textMuted} />
            <Text style={[styles.tabText, tab === 'incidents' && styles.tabTextActive]}>Incidents</Text>
          </TouchableOpacity>
        </View>

        {tab === 'documents' ? (
          <>
            {/* Score Card */}
            <View style={styles.scoreCard}>
              <View style={styles.scoreHeader}>
                <View>
                  <Text style={styles.scoreValue}>{Math.round(getComplianceScore())}%</Text>
                  <Text style={styles.scoreLabel}>Compliance Score</Text>
                </View>
                <View style={[styles.scoreIcon, { backgroundColor: getComplianceScore() === 100 ? 'rgba(76, 175, 80, 0.15)' : colors.goldLight }]}>
                  <Icon name={getComplianceScore() === 100 ? 'shield-check' : 'shield-alert'} size={32} color={getComplianceScore() === 100 ? colors.success : colors.gold} />
                </View>
              </View>
              <ProgressBar progress={getComplianceScore() / 100} color={colors.gold} style={styles.scoreProgress} />
              <View style={styles.scoreStats}>
                <View style={styles.scoreStat}>
                  <Text style={[styles.scoreStatValue, { color: colors.success }]}>{documents.filter(d => d.status === 'active').length}</Text>
                  <Text style={styles.scoreStatLabel}>Active</Text>
                </View>
                <View style={styles.scoreStat}>
                  <Text style={[styles.scoreStatValue, { color: colors.gold }]}>{documents.filter(d => d.status === 'expiring').length}</Text>
                  <Text style={styles.scoreStatLabel}>Expiring</Text>
                </View>
                <View style={styles.scoreStat}>
                  <Text style={[styles.scoreStatValue, { color: colors.error }]}>{documents.filter(d => d.status === 'expired').length}</Text>
                  <Text style={styles.scoreStatLabel}>Expired</Text>
                </View>
              </View>
            </View>

            {/* Missing Docs */}
            {getMissingDocuments().length > 0 && (
              <View style={styles.missingSection}>
                <Text style={styles.missingSectionTitle}>Missing Documents</Text>
                {getMissingDocuments().map((docType, i) => (
                  <TouchableOpacity key={i} style={styles.missingItem} onPress={() => showDocModal(docType)}>
                    <Icon name="file-alert-outline" size={20} color={colors.error} />
                    <Text style={styles.missingText}>{docType}</Text>
                    <Icon name="plus-circle" size={20} color={colors.gold} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Documents List */}
            <Text style={styles.sectionTitle}>All Documents</Text>
            {documents.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="file-document-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No documents uploaded</Text>
              </View>
            ) : (
              documents.map(doc => (
                <View key={doc._id} style={styles.documentCard}>
                  <View style={styles.docRow}>
                    <View style={[styles.docIcon, { backgroundColor: `${getStatusColor(doc.status)}20` }]}>
                      <Icon name="file-document" size={22} color={getStatusColor(doc.status)} />
                    </View>
                    <View style={styles.docContent}>
                      <Text style={styles.docType}>{doc.type}</Text>
                      <Text style={styles.docMeta}>#{doc.number || 'N/A'}</Text>
                      <Text style={styles.docMeta}>Exp: {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.docFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(doc.status)}15`, borderColor: getStatusColor(doc.status) }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(doc.status) }]}>{doc.status?.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteDocument(doc._id)} style={styles.deleteBtn}>
                      <Icon name="delete-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Reported Incidents</Text>
            {incidents.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="check-circle" size={48} color={colors.success} />
                <Text style={styles.emptyText}>No incidents reported</Text>
                <Text style={styles.emptySubtext}>Great safety record!</Text>
              </View>
            ) : (
              incidents.map(incident => (
                <View key={incident._id} style={styles.incidentCard}>
                  <View style={[styles.incidentIcon, { backgroundColor: incident.severity === 'critical' ? 'rgba(211, 47, 47, 0.15)' : colors.goldLight }]}>
                    <Icon name="alert" size={22} color={incident.severity === 'critical' ? colors.error : colors.gold} />
                  </View>
                  <View style={styles.incidentContent}>
                    <Text style={styles.incidentType}>{incident.type?.toUpperCase() || 'INCIDENT'}</Text>
                    <Text style={styles.incidentDesc}>{incident.description}</Text>
                    <Text style={styles.incidentMeta}>Location: {incident.location}</Text>
                  </View>
                  <View style={[styles.incidentStatus, { backgroundColor: incident.status === 'resolved' ? 'rgba(76, 175, 80, 0.15)' : colors.goldLight }]}>
                    <Text style={[styles.incidentStatusText, { color: incident.status === 'resolved' ? colors.success : colors.gold }]}>{incident.status}</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      {tab === 'documents' && (
        <TouchableOpacity style={styles.fab} onPress={() => showDocModal()}>
          <Icon name="plus" size={28} color="#121212" />
        </TouchableOpacity>
      )}

      {/* Modal */}
      <Portal>
        <Modal visible={docModalVisible} onDismiss={hideDocModal} contentContainerStyle={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>Add Document</Text>

            <Text style={styles.inputLabel}>Document Type*</Text>
            <TouchableOpacity style={styles.selectButton} onPress={() => setDocumentTypeMenuVisible(true)}>
              <Text style={styles.selectText}>{newDocument.type || 'Select Type'}</Text>
              <Icon name="menu-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Document Number</Text>
            <TextInput value={newDocument.number} onChangeText={t => setNewDocument({ ...newDocument, number: t })} mode="flat" style={styles.input} textColor={colors.textPrimary} />

            <Text style={styles.inputLabel}>Issuing Authority</Text>
            <TextInput value={newDocument.issuer} onChangeText={t => setNewDocument({ ...newDocument, issuer: t })} mode="flat" style={styles.input} textColor={colors.textPrimary} />

            <View style={styles.inputRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Issue Date</Text>
                <TextInput value={newDocument.issuedDate} onChangeText={t => setNewDocument({ ...newDocument, issuedDate: t })} mode="flat" style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textPlaceholder} textColor={colors.textPrimary} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput value={newDocument.expiryDate} onChangeText={t => setNewDocument({ ...newDocument, expiryDate: t })} mode="flat" style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textPlaceholder} textColor={colors.textPrimary} />
              </View>
            </View>

            <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPicker}>
              <Icon name="file-upload" size={20} color={colors.textSecondary} />
              <Text style={styles.uploadText}>{newDocument.file ? 'Change Document' : 'Upload Document'}</Text>
            </TouchableOpacity>

            {newDocument.file && <Text style={styles.fileText}>File selected ✓</Text>}

            {isUploading && (
              <View style={styles.uploadingBox}>
                <Text style={styles.uploadingText}>Uploading... {Math.round(uploadProgress * 100)}%</Text>
                <ProgressBar progress={uploadProgress} color={colors.gold} style={styles.uploadProgress} />
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={hideDocModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmitDocument} disabled={isUploading}>
                <Text style={styles.saveText}>{isUploading ? 'Uploading...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>

        {/* Type Selector Modal */}
        <Modal visible={documentTypeMenuVisible} onDismiss={() => setDocumentTypeMenuVisible(false)} contentContainerStyle={styles.typeModal}>
          <Text style={styles.typeModalTitle}>Select Document Type</Text>
          {REQUIRED_DOCUMENT_TYPES.map(type => (
            <TouchableOpacity key={type} style={styles.typeOption} onPress={() => { setNewDocument({ ...newDocument, type }); setDocumentTypeMenuVisible(false); }}>
              <Text style={styles.typeOptionText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </Modal>
      </Portal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingVertical: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  safetyHub: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  safetyButton: { flex: 1, marginHorizontal: 4, borderRadius: 16, padding: 20, alignItems: 'center' },
  safetyButtonText: { color: colors.textPrimary, fontSize: 13, fontWeight: '600', marginTop: 8 },
  tabRow: { flexDirection: 'row', backgroundColor: colors.cardBackground, borderRadius: 14, padding: 4, marginBottom: 20 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  tabActive: { backgroundColor: colors.inputBackground },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginLeft: 6 },
  tabTextActive: { color: colors.gold },
  scoreCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 40, // Increased margin
    overflow: 'hidden', // Ensure content doesn't bleed
  },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreValue: { color: colors.textPrimary, fontSize: 42, fontWeight: 'bold' },
  scoreLabel: { color: colors.textMuted, fontSize: 14 },
  scoreIcon: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  scoreProgress: { height: 8, borderRadius: 4, backgroundColor: colors.inputBackground, marginVertical: 24 },
  scoreStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)'
  },
  scoreStat: { alignItems: 'center', flex: 1 },
  scoreStatValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  scoreStatLabel: { color: colors.textMuted, fontSize: 12 },
  missingSection: { marginBottom: 24, marginTop: 0 },
  missingSectionTitle: { color: colors.error, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  missingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(211, 47, 47, 0.1)', padding: 14, borderRadius: 12, marginBottom: 8 },
  missingText: { flex: 1, color: colors.error, fontSize: 14, marginLeft: 12 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  emptyState: { backgroundColor: colors.inputBackground, borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: colors.inputBorder },
  emptyText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptySubtext: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  documentCard: { backgroundColor: colors.inputBackground, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.inputBorder },
  docRow: { flexDirection: 'row', alignItems: 'flex-start' },
  docIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  docContent: { flex: 1 },
  docType: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  docMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  docFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.divider },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  deleteBtn: { padding: 6, backgroundColor: 'rgba(211, 47, 47, 0.1)', borderRadius: 8 },
  incidentCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.inputBackground, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.inputBorder },
  incidentIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  incidentContent: { flex: 1 },
  incidentType: { color: colors.textPrimary, fontSize: 14, fontWeight: 'bold' },
  incidentDesc: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  incidentMeta: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  incidentStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  incidentStatusText: { fontSize: 11, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.gold, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  modalContainer: { backgroundColor: colors.cardBackgroundSolid, margin: 20, borderRadius: 20, padding: 24, maxHeight: '90%', borderWidth: 1, borderColor: colors.cardBorder },
  modalTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  inputLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: colors.inputBackground, borderRadius: 12, marginBottom: 16, height: 52 },
  inputRow: { flexDirection: 'row' },
  selectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.inputBackground, borderRadius: 12, padding: 16, marginBottom: 16 },
  selectText: { color: colors.textSecondary, fontSize: 15 },
  uploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.inputBackground, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.inputBorder },
  uploadText: { color: colors.textSecondary, marginLeft: 8 },
  fileText: { color: colors.success, fontSize: 13, marginBottom: 16, textAlign: 'center' },
  uploadingBox: { marginBottom: 16 },
  uploadingText: { color: colors.textMuted, fontSize: 13, marginBottom: 8 },
  uploadProgress: { height: 6, borderRadius: 3, backgroundColor: colors.inputBackground },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  cancelText: { color: colors.textSecondary },
  saveBtn: { backgroundColor: colors.gold, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  saveText: { color: '#121212', fontWeight: 'bold' },
  typeModal: { backgroundColor: colors.cardBackgroundSolid, margin: 40, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.cardBorder },
  typeModalTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  typeOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  typeOptionText: { color: colors.textSecondary, fontSize: 15 },
});

export default ComplianceScreen;