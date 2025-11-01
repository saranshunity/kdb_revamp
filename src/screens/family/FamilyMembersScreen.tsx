import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Clipboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";
import FamilyService, { FamilyMember, LocationData } from '../../services/FamilyService';
import { useAuth } from '../../contexts/AuthContext';
import LocationService from '../../services/LocationService';
import SharingPreferencesService from '../../services/SharingPreferencesService';

type FamilyMembersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FamilyDashboard'>;

interface MemberWithLocation extends FamilyMember {
  location?: LocationData;
  lastSeen?: string;
  isLocationShared: boolean;
}

const FamilyMembersScreen = () => {
  const [familyMembers, setFamilyMembers] = useState<MemberWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [family, setFamily] = useState<any>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [isTogglingLocation, setIsTogglingLocation] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FamilyMembersScreenNavigationProp>();
  const route = useRoute();
  const { user } = useAuth();

  // Get familyId from route params (required)
  useEffect(() => {
    const routeFamilyId = (route.params as any)?.familyId;
    if (routeFamilyId) {
      setFamilyId(routeFamilyId);
    } else {
      // No familyId - redirect to launch screen
      navigation.replace('FamilyLaunch' as any);
    }
  }, [route.params, navigation]);

  // Check if user is sharing location
  const checkSharingStatus = useCallback(async () => {
    if (!user?.id || !familyId) return;

    try {
      const isSharing = await SharingPreferencesService.isSharingWithFamily(user.id, familyId);
      const isTracking = LocationService.isTrackingActive();
      setIsSharingLocation(isSharing && isTracking);
    } catch (error) {
      console.error('Error checking sharing status:', error);
    }
  }, [user?.id, familyId]);

  // Load family data and members
  const loadFamilyData = useCallback(async () => {
    if (!familyId) return;

    try {
      setIsLoading(true);
      
      // Load family info
      const familyData = await FamilyService.getFamilyById(familyId);
      if (familyData) {
        setFamily(familyData);
      }
      
      // Load members
      const members = await FamilyService.getFamilyMembers(familyId);
      
      // Convert to MemberWithLocation format
      const membersWithDefaults: MemberWithLocation[] = members.map(member => ({
        ...member,
        isLocationShared: false,
        lastSeen: undefined,
        location: undefined,
      }));

      setFamilyMembers(membersWithDefaults);

      // Check sharing status
      await checkSharingStatus();
    } catch (error) {
      console.error('Error loading family data:', error);
      Alert.alert('Error', 'Failed to load family data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [familyId, checkSharingStatus]);

  // Subscribe to real-time location updates
  useEffect(() => {
    if (!familyId || !user?.id) return;

    // Check if current user is sharing (for their own member item)
    const checkCurrentUserSharing = async () => {
      try {
        const isSharing = await SharingPreferencesService.isSharingWithFamily(user.id, familyId);
        const isTracking = LocationService.isTrackingActive();
        setIsSharingLocation(isSharing && isTracking);
      } catch (error) {
        console.error('Error checking sharing status:', error);
      }
    };

    checkCurrentUserSharing();

    const unsubscribe = FamilyService.subscribeToMemberLocations(
      familyId,
      async (locations: Map<string, LocationData>) => {
        // Re-check sharing status for current user
        await checkCurrentUserSharing();

        setFamilyMembers(prevMembers => {
          return prevMembers.map(member => {
            const location = locations.get(member.userId);
            const isCurrentUser = member.userId === user.id;
            
            if (location) {
              const now = new Date();
              const updatedAt = location.updatedAt;
              const diffMs = now.getTime() - updatedAt.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              
              let lastSeen = '';
              if (diffMins < 1) {
                lastSeen = 'Just now';
              } else if (diffMins < 60) {
                lastSeen = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
              } else {
                const diffHours = Math.floor(diffMins / 60);
                lastSeen = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
              }

              // For current user, prefer toggle state if it's on (even if location.isActive is false)
              // For others, use location.isActive
              const memberIsSharing = isCurrentUser 
                ? (isSharingLocation || location.isActive)
                : location.isActive;
              
              return {
                ...member,
                location,
                isLocationShared: memberIsSharing,
                lastSeen,
              };
            } else {
              // No location data in liveLocations yet
              if (isCurrentUser) {
                // For current user, use toggle state - location might not be synced yet
                return {
                  ...member,
                  isLocationShared: isSharingLocation,
                  lastSeen: isSharingLocation ? 'Sharing...' : 'Not sharing',
                };
              } else {
                // For other members, no location means not sharing
                return {
                  ...member,
                  isLocationShared: false,
                  lastSeen: member.lastSeen || 'Not sharing',
                };
              }
            }
          });
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [familyId, user?.id, isSharingLocation]);

  // Load family data when familyId changes
  useEffect(() => {
    loadFamilyData();
  }, [loadFamilyData]);


  const handleAddMember = () => {
    if (!familyId) {
      return;
    }
    navigation.navigate('AddFamilyMember', { familyId } as any);
  };

  const handleViewMap = () => {
    if (!familyId) {
      return;
    }
    navigation.navigate('LocationMap', { familyId } as any);
  };

  const handleToggleLocationSharing = async () => {
    if (!user?.id || !familyId || isTogglingLocation) return;

    try {
      setIsTogglingLocation(true);

      if (isSharingLocation) {
        // Stop sharing
        await LocationService.stopTracking();
        await SharingPreferencesService.removeSharingFamily(user.id, familyId);
        setIsSharingLocation(false);
        Alert.alert('Location Sharing Stopped', 'Your location is no longer being shared with family members.');
      } else {
        // Start sharing
        // First, add family to sharing preferences
        await SharingPreferencesService.addSharingFamily(user.id, familyId);
        
        // Start location tracking
        await LocationService.startTracking(user.id, {
          familyIds: [familyId],
        });
        
        setIsSharingLocation(true);
        Alert.alert('Location Sharing Started', 'Your location is now being shared with family members.');
      }
    } catch (error: any) {
      console.error('Error toggling location sharing:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to toggle location sharing. Please check location permissions.'
      );
    } finally {
      setIsTogglingLocation(false);
    }
  };

  const handleMemberPress = (member: MemberWithLocation) => {
    if (!familyId) return;
    
    // If member has shared location, navigate to map with focus on them
    if (member.isLocationShared && member.location) {
      navigation.navigate('LocationMap', { 
        familyId,
        selectedMemberId: member.userId 
      } as any);
    } else {
      // Otherwise, just navigate to map (they can see other members)
      navigation.navigate('LocationMap', { 
        familyId
      } as any);
    }
  };

  const handleRefreshMemberLocation = async (member: MemberWithLocation) => {
    if (!user?.id || !familyId) return;

    try {
      // If current user is not sharing location, enable it
      if (!isSharingLocation) {
        await SharingPreferencesService.addSharingFamily(user.id, familyId);
        await LocationService.startTracking(user.id, {
          familyIds: [familyId],
        });
        setIsSharingLocation(true);
        
        // Get current location and update it immediately
        try {
          await LocationService.getCurrentLocation();
        } catch (locError) {
          console.error('Error getting current location:', locError);
        }
        
        Alert.alert('Location Sharing Enabled', 'Your location is now being shared with family members.');
      } else {
        // Already sharing - force get current location to update immediately
        try {
          await LocationService.getCurrentLocation();
          Alert.alert('Location Updated', 'Your location has been refreshed.');
        } catch (locError) {
          Alert.alert('Location Updated', 'Location tracking is active and will update automatically.');
        }
      }
    } catch (error: any) {
      console.error('Error refreshing location:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update location. Please check location permissions.'
      );
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadFamilyData();
  };

  const handleLeaveFamily = () => {
    if (!familyId || !user?.id) return;

    const currentMember = familyMembers.find(m => m.userId === user.id);
    const isAdmin = currentMember?.role === 'admin' || family?.createdBy === user.id;
    const totalMembers = familyMembers.length;

    let message = 'Are you sure you want to leave this family?';
    
    if (isAdmin) {
      if (totalMembers === 1) {
        message = 'You are the only member. Leaving will delete this family group permanently. Are you sure?';
      } else {
        message = 'As admin, leaving will automatically promote another member to admin. Are you sure you want to leave?';
      }
    } else {
      message = 'Are you sure you want to leave this family? You will need to join again using the family code.';
    }

    Alert.alert(
      'Leave Family',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await FamilyService.leaveFamily(familyId, user.id);
              navigation.replace('FamilyLaunch' as any);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to leave family');
            }
          },
        },
      ]
    );
  };

  const handleCopyCode = () => {
    if (family?.code) {
      // Copy to clipboard functionality would go here
      Alert.alert('Family Code', `Share this code: ${family.code}`, [
        { text: 'OK' }
      ]);
    }
  };

  const getStatusColor = (member: MemberWithLocation) => {
    if (!member.isLocationShared) return COLORS.text.tertiary;
    
    if (!member.lastSeen) return COLORS.text.tertiary;
    
    // Check if recent (less than 5 minutes)
    if (member.lastSeen.includes('Just now') || member.lastSeen.includes('minute')) {
      const minsMatch = member.lastSeen.match(/(\d+)\s+minute/);
      if (minsMatch && parseInt(minsMatch[1]) <= 5) {
        return COLORS.success;
      }
    }
    
    return COLORS.warning;
  };

  const getStatusText = (member: MemberWithLocation) => {
    if (!member.isLocationShared) return "Location sharing off";
    if (!member.lastSeen) return "Location not available";
    return `Last seen ${member.lastSeen}`;
  };

  if (isLoading && familyMembers.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading family members...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.header}>{family?.name || 'Family'}</Text>
        </View>
        {familyId && user?.id && (
          <TouchableOpacity
            style={styles.headerLocationToggle}
            onPress={handleToggleLocationSharing}
            disabled={isTogglingLocation}
          >
            <View style={styles.headerToggleContent}>
              {isTogglingLocation ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <View style={[
                  styles.headerToggleSwitch,
                  isSharingLocation && styles.headerToggleSwitchActive
                ]}>
                  <View style={[
                    styles.headerToggleCircle,
                    isSharingLocation && styles.headerToggleCircleActive
                  ]} />
                </View>
              )}
              <Text style={styles.headerToggleLabel}>Location Sharing</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Family Code Button */}
      {family?.code && (
        <View style={styles.familyCodeContainer}>
          <TouchableOpacity 
            style={styles.familyCodeButton}
            onPress={() => {
              Clipboard.setString(family.code);
              Alert.alert('Copied!', `Family code "${family.code}" copied to clipboard`);
            }}
          >
            <View style={styles.familyCodeLeft}>
              <Ionicons name="key-outline" size={18} color={COLORS.primary} />
              <Text style={styles.familyCodeLabel}>Family Code:</Text>
              <Text style={styles.familyCodeValue}>{family.code}</Text>
            </View>
            <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddMember}
          disabled={!familyId}
        >
          <Ionicons name="person-add" size={20} color={COLORS.white} />
          <Text style={styles.addButtonText}>Invite Members</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.mapButton} 
          onPress={handleViewMap}
          disabled={!familyId}
        >
          <Ionicons name="map-outline" size={20} color={COLORS.primary} />
          <Text style={styles.mapButtonText}>Track / View Map</Text>
        </TouchableOpacity>
      </View>

      {/* Family Members List */}
      <ScrollView 
        style={styles.membersList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {familyMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyTitle}>No family members found</Text>
            <Text style={styles.emptySubtitle}>
              Add your first family member to get started
            </Text>
            {!familyId && (
              <TouchableOpacity 
                style={styles.createFamilyButton}
                onPress={() => navigation.replace('FamilyLaunch' as any)}
              >
                <Text style={styles.createFamilyButtonText}>Create or Join Family</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          familyMembers.map((member) => (
            <TouchableOpacity
              key={member.userId}
              style={styles.memberItem}
              onPress={() => handleMemberPress(member)}
            >
              <View style={styles.memberLeft}>
                <View style={styles.photoContainer}>
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoText}>
                      {(member.name || 'F')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(member) }
                  ]} />
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>
                    {member.name || member.phoneNumber || 'Family Member'}
                  </Text>
                  {member.relation && (
                    <Text style={styles.memberRelation}>{member.relation}</Text>
                  )}
                  {member.phoneNumber && (
                    <Text style={styles.memberPhone}>{member.phoneNumber}</Text>
                  )}
                  <Text style={[styles.memberStatus, { color: getStatusColor(member) }]}>
                    {getStatusText(member)}
                  </Text>
                </View>
              </View>
              <View style={styles.memberRight}>
                {member.isLocationShared && member.location && (
                  <Ionicons
                    name="location"
                    size={20}
                    color={COLORS.primary}
                  />
                )}
                {member.userId === user?.id && (
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRefreshMemberLocation(member);
                    }}
                  >
                    <Ionicons
                      name="refresh"
                      size={18}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                )}
                <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Family Code Modal */}
      <Modal
        visible={showCodeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.codeModalContent}>
            <View style={styles.codeModalHeader}>
              <Text style={styles.codeModalTitle}>Family Code</Text>
              <TouchableOpacity onPress={() => setShowCodeModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.codeModalBody}>
              <Text style={styles.codeLabel}>Share this code with family members:</Text>
              <View style={styles.codeDisplay}>
                <Text style={styles.codeValue}>{family?.code || 'N/A'}</Text>
              </View>
              <Text style={styles.codeHint}>
                Members need this code and your phone number to join the family.
              </Text>
            </View>
            <View style={styles.codeModalFooter}>
              <TouchableOpacity
                style={styles.codeCopyButton}
                onPress={() => {
                  handleCopyCode();
                  setShowCodeModal(false);
                }}
              >
                <Ionicons name="copy" size={20} color={COLORS.white} />
                <Text style={styles.codeCopyText}>Copy Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Leave Family Button (at bottom) - Show for all members including admin */}
      {family && user?.id && (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveFamily}
          >
            <Ionicons name="exit-outline" size={20} color={COLORS.error} />
            <Text style={styles.leaveButtonText}>Leave Family</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
    fontFamily: FONTS.gilroy.bold,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.text.primary,
  },
  headerLocationToggle: {
    alignItems: 'flex-end',
  },
  headerToggleContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  headerToggleSwitch: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  headerToggleSwitchActive: {
    backgroundColor: COLORS.success,
  },
  headerToggleCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },
  headerToggleCircleActive: {
    alignSelf: 'flex-end',
  },
  headerToggleLabel: {
    fontSize: 9,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.background.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
  },
  familyCodeContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: COLORS.background.primary,
  },
  familyCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  familyCodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  familyCodeLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
  },
  familyCodeValue: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
    letterSpacing: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.background.primary,
    gap: 12,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.appColor,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.white,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  mapButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.primary,
  },
  shareLocationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.background.primary,
  },
  shareLocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  shareLocationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  shareLocationText: {
    flex: 1,
    marginLeft: 12,
  },
  shareLocationTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  shareLocationSubtitle: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    lineHeight: 16,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.success,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  membersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.background.primary,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.appColor + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.background.appColor,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  memberRelation: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.tertiary,
    marginBottom: 4,
  },
  memberStatus: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.medium,
  },
  memberRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createFamilyButton: {
    backgroundColor: COLORS.background.appColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFamilyButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.white,
  },
  footerContainer: {
    padding: 20,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  leaveButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  codeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  codeModalTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.text.primary,
  },
  codeModalBody: {
    padding: 20,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  codeDisplay: {
    backgroundColor: COLORS.background.appColor + '20',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  codeValue: {
    fontSize: FONT_SIZES['2xl'],
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  codeModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  codeCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.appColor,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  codeCopyText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.white,
  },
});

export default FamilyMembersScreen;
