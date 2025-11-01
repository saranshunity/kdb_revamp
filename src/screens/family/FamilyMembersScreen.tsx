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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";
import FamilyService, { FamilyMember, LocationData } from '../../services/FamilyService';
import { useAuth } from '../../contexts/AuthContext';

type FamilyMembersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FamilyDashboard'>;

interface MemberWithLocation extends FamilyMember {
  location?: LocationData;
  lastSeen?: string;
  isLocationShared: boolean;
}

const FamilyMembersScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [familyMembers, setFamilyMembers] = useState<MemberWithLocation[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [family, setFamily] = useState<any>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
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
      setFilteredMembers(membersWithDefaults);
    } catch (error) {
      console.error('Error loading family data:', error);
      Alert.alert('Error', 'Failed to load family data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [familyId]);

  // Subscribe to real-time location updates
  useEffect(() => {
    if (!familyId) return;

    const unsubscribe = FamilyService.subscribeToMemberLocations(
      familyId,
      (locations: Map<string, LocationData>) => {
        setFamilyMembers(prevMembers => {
          return prevMembers.map(member => {
            const location = locations.get(member.userId);
            
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

              return {
                ...member,
                location,
                isLocationShared: location.isActive,
                lastSeen,
              };
            } else {
              // No location data - check if was sharing before
              return {
                ...member,
                isLocationShared: false,
                lastSeen: member.lastSeen || 'Not sharing',
              };
            }
          });
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [familyId]);

  // Load family data when familyId changes
  useEffect(() => {
    loadFamilyData();
  }, [loadFamilyData]);

  // Filter members based on search query
  useEffect(() => {
    const filtered = familyMembers.filter(member =>
      (member.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.relation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.phoneNumber || '').includes(searchQuery)
    );
    setFilteredMembers(filtered);
  }, [searchQuery, familyMembers]);

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

  const handleMemberPress = (member: MemberWithLocation) => {
    if (member.location) {
      navigation.navigate('LocationMap', { 
        familyId,
        selectedMemberId: member.userId 
      } as any);
    } else {
      // Show member details or options
      console.log("Member pressed:", member.name);
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
          {family?.code && (
            <TouchableOpacity 
              style={styles.codeButton}
              onPress={() => setShowCodeModal(true)}
            >
              <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
              <Text style={styles.codeText}>Code: {family.code}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleViewMap}>
          <Ionicons name="map" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search family members..."
            placeholderTextColor={COLORS.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

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
        {filteredMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyTitle}>No family members found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? "Try adjusting your search" 
                : "Add your first family member to get started"}
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
          filteredMembers.map((member) => (
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
  codeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  codeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.primary,
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
