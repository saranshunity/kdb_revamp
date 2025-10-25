import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText, ButtonTextPrimary } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FirebaseService, { StallApplication } from '../../services/FirebaseService';

type CheckApplicationStatusScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CheckApplicationStatus'>;

const CheckApplicationStatusScreen = () => {
  const navigation = useNavigation<CheckApplicationStatusScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [searchType, setSearchType] = useState<'phone' | 'applicationId'>('phone');
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundApplication, setFoundApplication] = useState<StallApplication | null>(null);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      Alert.alert('Required Field', 'Please enter a phone number or application ID.');
      return;
    }

    try {
      setIsLoading(true);
      setFoundApplication(null);

      // Get all applications and filter by search criteria
      const allApplications = await FirebaseService.getAllApplications();
      
      let application: StallApplication | undefined;
      
      if (searchType === 'phone') {
        // Search by phone number
        application = allApplications.find(app => 
          app.mobileNumber === searchValue || 
          app.alternateMobileNumber === searchValue
        );
      } else {
        // Search by application ID
        application = allApplications.find(app => app.id === searchValue);
      }

      if (application) {
        setFoundApplication(application);
      } else {
        Alert.alert(
          'Application Not Found',
          `No application found with the provided ${searchType === 'phone' ? 'phone number' : 'application ID'}. Please check and try again.`
        );
      }
    } catch (error) {
      console.error('Error searching application:', error);
      Alert.alert('Error', 'Failed to search application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewApplication = () => {
    if (foundApplication) {
      navigation.navigate('StallApplicationStatus', {
        applicationId: foundApplication.id,
        category: { id: foundApplication.categoryId, name: foundApplication.categoryName },
        formData: foundApplication,
        status: foundApplication.status as 'pending' | 'approved' | 'rejected'
      });
    }
  };

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
          Check Status
        </H1>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <H3 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
            Search Application
          </H3>
          
          {/* Search Type Toggle */}
          <View style={styles.searchTypeContainer}>
            <TouchableOpacity
              style={[
                styles.searchTypeButton,
                searchType === 'phone' && styles.searchTypeButtonActive
              ]}
              onPress={() => setSearchType('phone')}
            >
              <Ionicons 
                name="call-outline" 
                size={16} 
                color={searchType === 'phone' ? COLORS.primary : COLORS.text.secondary} 
              />
              <BodyText 
                color={searchType === 'phone' ? COLORS.primary : COLORS.text.secondary} 
                size='sm' 
                weight={searchType === 'phone' ? 'semiBold' : 'regular'}
                style={styles.searchTypeText}
              >
                Phone Number
              </BodyText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.searchTypeButton,
                searchType === 'applicationId' && styles.searchTypeButtonActive
              ]}
              onPress={() => setSearchType('applicationId')}
            >
              <Ionicons 
                name="document-text-outline" 
                size={16} 
                color={searchType === 'applicationId' ? COLORS.primary : COLORS.text.secondary} 
              />
              <BodyText 
                color={searchType === 'applicationId' ? COLORS.primary : COLORS.text.secondary} 
                size='sm' 
                weight={searchType === 'applicationId' ? 'semiBold' : 'regular'}
                style={styles.searchTypeText}
              >
                Application ID
              </BodyText>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.inputContainer}>
            <Ionicons 
              name={searchType === 'phone' ? 'call-outline' : 'document-text-outline'} 
              size={20} 
              color={COLORS.text.tertiary} 
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder={searchType === 'phone' ? 'Enter phone number' : 'Enter application ID'}
              placeholderTextColor={COLORS.text.tertiary}
              value={searchValue}
              onChangeText={setSearchValue}
              keyboardType={searchType === 'phone' ? 'phone-pad' : 'default'}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            <ButtonTextPrimary size='md' weight='semiBold'>
              {isLoading ? 'Searching...' : 'Search Application'}
            </ButtonTextPrimary>
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {foundApplication && (
          <View style={styles.resultsSection}>
            <H3 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
              Application Found
            </H3>
            
            <View style={styles.applicationCard}>
              <View style={styles.applicationHeader}>
                <View style={styles.applicationInfo}>
                  <H3 color={COLORS.text.primary} weight='semiBold' size='md'>
                    {foundApplication.firmName}
                  </H3>
                  <BodyText color={COLORS.text.secondary} size='sm'>
                    {foundApplication.categoryName}
                  </BodyText>
                  <BodyText color={COLORS.text.tertiary} size='xs'>
                    Applied: {foundApplication.submittedAt ? new Date(foundApplication.submittedAt).toLocaleDateString() : 'N/A'}
                  </BodyText>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(foundApplication.status) + '20' }
                ]}>
                  <Ionicons 
                    name={getStatusIcon(foundApplication.status)} 
                    size={16} 
                    color={getStatusColor(foundApplication.status)} 
                  />
                  <BodyText 
                    color={getStatusColor(foundApplication.status)} 
                    size='xs' 
                    weight='medium'
                    style={styles.statusText}
                  >
                    {foundApplication.status.toUpperCase()}
                  </BodyText>
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={handleViewApplication}
              >
                <BodyText color={COLORS.primary} size='sm' weight='medium'>
                  View Full Details
                </BodyText>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Help Section */}
        <View style={styles.helpSection}>
          <View style={styles.helpCard}>
            <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
            <View style={styles.helpContent}>
              <BodyText color={COLORS.text.primary} size='sm' weight='medium' style={styles.helpTitle}>
                Need Help?
              </BodyText>
              <BodyText color={COLORS.text.tertiary} size='xs' style={styles.helpText}>
                If you can't find your application, please check the phone number or application ID you used during registration. Contact support if you need assistance.
              </BodyText>
            </View>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchSection: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  searchTypeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  searchTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchTypeButtonActive: {
    backgroundColor: COLORS.primary + '20',
  },
  searchTypeText: {
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
    marginBottom: 20,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.primary,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.text.tertiary,
  },
  resultsSection: {
    marginTop: 30,
  },
  applicationCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 16,
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
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.background.tertiary,
  },
  helpSection: {
    marginTop: 40,
    marginBottom: 20,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
  },
  helpContent: {
    flex: 1,
    marginLeft: 12,
  },
  helpTitle: {
    marginBottom: 4,
  },
  helpText: {
    lineHeight: 16,
  },
});

export default CheckApplicationStatusScreen;
