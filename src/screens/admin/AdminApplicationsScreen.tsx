import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FirebaseService, { StallApplication } from '../../services/FirebaseService';

type AdminApplicationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminApplications'>;

const AdminApplicationsScreen = () => {
  const navigation = useNavigation<AdminApplicationsScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  
  const [applications, setApplications] = useState<StallApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingApplicationId, setProcessingApplicationId] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const data = await FirebaseService.getAllApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
      Alert.alert('Error', 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadApplications();
    setIsRefreshing(false);
  };

  const handleStatusChange = async (applicationId: string, newStatus: 'approved' | 'rejected', application: StallApplication) => {
    const action = newStatus === 'approved' ? 'approve' : 'reject';
    const actionCapitalized = newStatus === 'approved' ? 'Approve' : 'Reject';
    
    Alert.alert(
      `${actionCapitalized} Application`,
      `Are you sure you want to ${action} the application for "${application.firmName}" by ${application.ownerName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: actionCapitalized,
          style: newStatus === 'approved' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setProcessingApplicationId(applicationId);
              
              await FirebaseService.updateApplicationStatus(applicationId, newStatus);
              
              Alert.alert(
                'Success!', 
                `Application has been ${newStatus} successfully. The applicant will be notified.`,
                [
                  {
                    text: 'OK',
                    onPress: () => loadApplications() // Refresh the list
                  }
                ]
              );
            } catch (error) {
              console.error('Error updating status:', error);
              Alert.alert(
                'Error', 
                `Failed to ${action} application. Please try again.`,
                [{ text: 'OK' }]
              );
            } finally {
              setProcessingApplicationId(null);
            }
          },
        },
      ]
    );
  };

  const handleViewDocuments = (application: StallApplication) => {
    const documents = [];
    
    if (application.aadharCardFile) {
      documents.push({
        name: 'Aadhar Card',
        url: application.aadharCardFile,
      });
    }
    
    if (application.registrationCertificateFile) {
      documents.push({
        name: 'Registration Certificate',
        url: application.registrationCertificateFile,
      });
    }

    if (documents.length === 0) {
      Alert.alert('No Documents', 'No documents uploaded for this application');
      return;
    }

    Alert.alert(
      'View Documents',
      'Select a document to view:',
      [
        ...documents.map(doc => ({
          text: doc.name,
          onPress: () => Linking.openURL(doc.url),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const filteredApplications = applications.filter(app => {
    if (selectedStatus === 'all') return true;
    return app.status === selectedStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'approved': return COLORS.success;
      case 'rejected': return COLORS.error;
      default: return COLORS.text.tertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'approved': return 'checkmark-circle-outline';
      case 'rejected': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const renderApplicationCard = (application: StallApplication) => (
    <View key={application.id} style={styles.applicationCard}>
      <View style={styles.applicationHeader}>
        <View style={styles.applicationInfo}>
          <H3 color={COLORS.text.primary} weight='semiBold' size='md'>
            {application.firmName}
          </H3>
          <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
            {application.ownerName} • {application.categoryName}
          </BodyText>
          <BodyText color={COLORS.text.tertiary} size='xs'>
            Applied: {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'N/A'}
          </BodyText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
          <Ionicons 
            name={getStatusIcon(application.status)} 
            size={16} 
            color={getStatusColor(application.status)} 
          />
          <BodyText color={getStatusColor(application.status)} size='xs' weight='medium' style={styles.statusText}>
            {application.status.toUpperCase()}
          </BodyText>
        </View>
      </View>

      <View style={styles.applicationDetails}>
        {/* Contact Information */}
        <View style={styles.detailSection}>
          <BodyText color={COLORS.text.primary} size='xs' weight='semiBold' style={styles.sectionTitle}>
            CONTACT INFORMATION
          </BodyText>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={14} color={COLORS.text.tertiary} />
            <BodyText color={COLORS.text.secondary} size='xs' style={styles.detailText}>
              {application.email}
            </BodyText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color={COLORS.text.tertiary} />
            <BodyText color={COLORS.text.secondary} size='xs' style={styles.detailText}>
              {application.mobileNumber}
            </BodyText>
          </View>
          {application.alternateMobileNumber && (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={14} color={COLORS.text.tertiary} />
              <BodyText color={COLORS.text.secondary} size='xs' style={styles.detailText}>
                Alt: {application.alternateMobileNumber}
              </BodyText>
            </View>
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.detailSection}>
          <BodyText color={COLORS.text.primary} size='xs' weight='semiBold' style={styles.sectionTitle}>
            PERSONAL INFORMATION
          </BodyText>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={14} color={COLORS.text.tertiary} />
            <BodyText color={COLORS.text.secondary} size='xs' style={styles.detailText}>
              Father: {application.fatherName}
            </BodyText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={14} color={COLORS.text.tertiary} />
            <BodyText color={COLORS.text.secondary} size='xs' style={styles.detailText}>
              Aadhar: {application.aadharNumber}
            </BodyText>
          </View>
        </View>

        {/* Address Information */}
        <View style={styles.detailSection}>
          <BodyText color={COLORS.text.primary} size='xs' weight='semiBold' style={styles.sectionTitle}>
            ADDRESS
          </BodyText>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.text.tertiary} />
            <BodyText color={COLORS.text.secondary} size='xs' style={styles.detailText}>
              {application.correspondenceAddress}
            </BodyText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="map-outline" size={14} color={COLORS.text.tertiary} />
            <BodyText color={COLORS.text.secondary} size='xs' style={styles.detailText}>
              {application.district}, {application.state} - {application.pinCode}
            </BodyText>
          </View>
        </View>

        {/* Business Information */}
        <View style={styles.detailSection}>
          <BodyText color={COLORS.text.primary} size='xs' weight='semiBold' style={styles.sectionTitle}>
            BUSINESS DETAILS
          </BodyText>
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={14} color={COLORS.text.tertiary} />
            <BodyText color={COLORS.text.secondary} size='xs' style={styles.detailText}>
              Type: {application.typeOfWork}
            </BodyText>
          </View>
          {application.awardAchievement && (
            <View style={styles.detailRow}>
              <Ionicons name="trophy-outline" size={14} color={COLORS.text.tertiary} />
              <BodyText color={COLORS.text.secondary} size='xs' style={styles.detailText}>
                Awards: {application.awardAchievement}
              </BodyText>
            </View>
          )}
          {application.otherRemarks && (
            <View style={styles.detailRow}>
              <Ionicons name="chatbubble-outline" size={14} color={COLORS.text.tertiary} />
              <BodyText color={COLORS.text.secondary} size='xs' style={styles.detailText}>
                Remarks: {application.otherRemarks}
              </BodyText>
            </View>
          )}
        </View>

        {/* Document Status */}
        <View style={styles.detailSection}>
          <BodyText color={COLORS.text.primary} size='xs' weight='semiBold' style={styles.sectionTitle}>
            DOCUMENTS
          </BodyText>
          <View style={styles.documentStatus}>
            <View style={styles.documentItem}>
              <Ionicons 
                name={application.aadharCardFile ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={application.aadharCardFile ? COLORS.success : COLORS.error} 
              />
              <BodyText 
                color={application.aadharCardFile ? COLORS.success : COLORS.error} 
                size='xs' 
                weight='medium'
                style={styles.documentText}
              >
                Aadhar Card
              </BodyText>
            </View>
            <View style={styles.documentItem}>
              <Ionicons 
                name={application.registrationCertificateFile ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={application.registrationCertificateFile ? COLORS.success : COLORS.error} 
              />
              <BodyText 
                color={application.registrationCertificateFile ? COLORS.success : COLORS.error} 
                size='xs' 
                weight='medium'
                style={styles.documentText}
              >
                Registration Certificate
              </BodyText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.applicationActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleViewDocuments(application)}
        >
          <Ionicons name="document-outline" size={16} color={COLORS.primary} />
          <BodyText color={COLORS.primary} size='xs' weight='medium'>
            View Documents
          </BodyText>
        </TouchableOpacity>

        {application.status === 'pending' && (
          <>
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.approveButton,
                processingApplicationId === application.id && styles.disabledButton
              ]}
              onPress={() => handleStatusChange(application.id, 'approved', application)}
              disabled={processingApplicationId === application.id}
            >
              <Ionicons 
                name={processingApplicationId === application.id ? "hourglass-outline" : "checkmark-outline"} 
                size={16} 
                color={processingApplicationId === application.id ? COLORS.text.tertiary : COLORS.success} 
              />
              <BodyText 
                color={processingApplicationId === application.id ? COLORS.text.tertiary : COLORS.success} 
                size='xs' 
                weight='medium'
              >
                {processingApplicationId === application.id ? 'Processing...' : 'Approve'}
              </BodyText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.rejectButton,
                processingApplicationId === application.id && styles.disabledButton
              ]}
              onPress={() => handleStatusChange(application.id, 'rejected', application)}
              disabled={processingApplicationId === application.id}
            >
              <Ionicons 
                name={processingApplicationId === application.id ? "hourglass-outline" : "close-outline"} 
                size={16} 
                color={processingApplicationId === application.id ? COLORS.text.tertiary : COLORS.error} 
              />
              <BodyText 
                color={processingApplicationId === application.id ? COLORS.text.tertiary : COLORS.error} 
                size='xs' 
                weight='medium'
              >
                {processingApplicationId === application.id ? 'Processing...' : 'Reject'}
              </BodyText>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const statusFilters = [
    { key: 'all', label: 'All', count: applications.length },
    { key: 'pending', label: 'Pending', count: applications.filter(app => app.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: applications.filter(app => app.status === 'approved').length },
    { key: 'rejected', label: 'Rejected', count: applications.filter(app => app.status === 'rejected').length },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <H1 color={COLORS.text.primary} weight='bold' size='lg'>
          Stall Applications
        </H1>
        <View style={styles.headerRight} />
      </View>

      {/* Status Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedStatus === filter.key && styles.filterButtonActive
            ]}
            onPress={() => setSelectedStatus(filter.key as any)}
          >
            <BodyText 
              color={selectedStatus === filter.key ? COLORS.primary : COLORS.text.secondary} 
              size='sm' 
              weight={selectedStatus === filter.key ? 'semiBold' : 'regular'}
            >
              {filter.label}
            </BodyText>
            <View style={styles.countBadge}>
              <BodyText 
                color={selectedStatus === filter.key ? COLORS.primary : COLORS.text.tertiary} 
                size='xs' 
                weight='medium'
              >
                {filter.count}
              </BodyText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Applications List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <BodyText color={COLORS.text.secondary}>Loading applications...</BodyText>
          </View>
        ) : filteredApplications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color={COLORS.text.tertiary} />
            <H3 color={COLORS.text.secondary} weight='medium' style={styles.emptyTitle}>
              No Applications Found
            </H3>
            <BodyText color={COLORS.text.tertiary} size='sm' style={styles.emptyText}>
              {selectedStatus === 'all' 
                ? 'No applications have been submitted yet.'
                : `No ${selectedStatus} applications found.`
              }
            </BodyText>
          </View>
        ) : (
          filteredApplications.map(renderApplicationCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.tertiary,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerRight: {
    width: 40,
  },
  filtersContainer: {
    maxHeight: 100,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.tertiary,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: COLORS.background.secondary,
    minWidth: 80,
    height: 50,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary + '20',
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: COLORS.background.tertiary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  applicationCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
    shadowColor: COLORS.text.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicationInfo: {
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 4,
  },
  applicationDetails: {
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  documentStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentText: {
    marginLeft: 6,
  },
  applicationActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewButton: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary + '30',
  },
  approveButton: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success + '30',
  },
  rejectButton: {
    backgroundColor: COLORS.error + '10',
    borderColor: COLORS.error + '30',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AdminApplicationsScreen;
