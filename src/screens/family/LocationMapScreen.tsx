import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import FamilyService, { FamilyMember, LocationData } from '../../services/FamilyService';
import { useAuth } from '../../contexts/AuthContext';

type LocationMapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LocationMap'>;

interface MemberWithLocation extends FamilyMember {
  location?: LocationData;
  lastSeen?: string;
  isLocationShared: boolean;
}

const { width, height } = Dimensions.get('window');

const LocationMapScreen = () => {
  const [familyMembers, setFamilyMembers] = useState<MemberWithLocation[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberWithLocation | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [isLoading, setIsLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<LocationMapScreenNavigationProp>();
  const route = useRoute();
  const { user } = useAuth();

  // Get familyId from route params or get user's first family
  useEffect(() => {
    const loadFamily = async () => {
      try {
        const routeFamilyId = (route.params as any)?.familyId;
        const selectedMemberId = (route.params as any)?.selectedMemberId;
        
        if (routeFamilyId) {
          setFamilyId(routeFamilyId);
        } else if (user?.id) {
          const family = await FamilyService.getUserFamily(user.id);
          if (family) {
            setFamilyId(family.id);
          } else {
            setIsLoading(false);
            Alert.alert('No Family', 'Please create or join a family first.');
            navigation.goBack();
            return;
          }
        }
      } catch (error) {
        console.error('Error loading family:', error);
        setIsLoading(false);
      }
    };

    loadFamily();
  }, [route.params, user?.id, navigation]);

  // Load family members
  const loadMembers = useCallback(async () => {
    if (!familyId) return;

    try {
      setIsLoading(true);
      const members = await FamilyService.getFamilyMembers(familyId);
      
      const membersWithDefaults: MemberWithLocation[] = members.map(member => ({
        ...member,
        isLocationShared: false,
        lastSeen: undefined,
        location: undefined,
      }));

      setFamilyMembers(membersWithDefaults);
    } catch (error) {
      console.error('Error loading family members:', error);
      Alert.alert('Error', 'Failed to load family members');
    } finally {
      setIsLoading(false);
    }
  }, [familyId]);

  // Subscribe to real-time location updates using optimized liveLocations feed
  useEffect(() => {
    if (!familyId) return;

    const unsubscribe = FamilyService.subscribeToMemberLocations(
      familyId,
      (locations: Map<string, LocationData>) => {
        setFamilyMembers(prevMembers => {
          const updated = prevMembers.map(member => {
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
              return {
                ...member,
                isLocationShared: false,
                lastSeen: member.lastSeen || 'Not sharing',
              };
            }
          });

          // Auto-fit map to show all members with locations
          const membersWithLocations = updated.filter(m => m.location);
          if (membersWithLocations.length > 0 && mapRef.current) {
            const coordinates = membersWithLocations.map(m => ({
              latitude: m.location!.latitude,
              longitude: m.location!.longitude,
            }));

            mapRef.current.fitToCoordinates(coordinates, {
              edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
              animated: true,
            });
          }

          return updated;
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [familyId]);

  // Load members when familyId changes
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Handle selected member from route params
  useEffect(() => {
    const selectedMemberId = (route.params as any)?.selectedMemberId;
    if (selectedMemberId && familyMembers.length > 0) {
      const member = familyMembers.find(m => m.userId === selectedMemberId);
      if (member && member.location) {
        setSelectedMember(member);
        // Focus map on selected member
        if (mapRef.current && member.location) {
          mapRef.current.animateToRegion({
            latitude: member.location.latitude,
            longitude: member.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 500);
        }
      }
    }
  }, [route.params, familyMembers]);

  const handleMemberSelect = (member: MemberWithLocation) => {
    if (!member.isLocationShared || !member.location) {
      Alert.alert(
        "Location Not Available",
        `${member.name || 'Member'} has not shared their location.`,
        [{ text: "OK" }]
      );
      return;
    }
    setSelectedMember(member);
    
    // Focus map on selected member
    if (mapRef.current && member.location) {
      mapRef.current.animateToRegion({
        latitude: member.location.latitude,
        longitude: member.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handleRefresh = () => {
    loadMembers();
  };

  const getStatusColor = (member: MemberWithLocation) => {
    if (!member.isLocationShared) return COLORS.text.tertiary;
    
    if (!member.lastSeen) return COLORS.text.tertiary;
    
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

  // Calculate initial region from members with locations
  const getInitialRegion = (): Region => {
    const membersWithLocations = familyMembers.filter(m => m.location);
    
    if (membersWithLocations.length > 0) {
      const latitudes = membersWithLocations.map(m => m.location!.latitude);
      const longitudes = membersWithLocations.map(m => m.location!.longitude);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(maxLat - minLat, 0.01) * 1.5,
        longitudeDelta: Math.max(maxLng - minLng, 0.01) * 1.5,
      };
    }
    
    // Default to India center if no locations
    return {
      latitude: 20.5937,
      longitude: 78.9629,
      latitudeDelta: 10,
      longitudeDelta: 10,
    };
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  const membersWithLocations = familyMembers.filter(m => m.isLocationShared && m.location);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='light-content' backgroundColor="transparent" translucent />
      
      {/* Full Screen Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType={mapType}
        initialRegion={getInitialRegion()}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        onMapReady={() => {
          // Fit to all members when map is ready
          if (membersWithLocations.length > 0) {
            const coordinates = membersWithLocations.map(m => ({
              latitude: m.location!.latitude,
              longitude: m.location!.longitude,
            }));

            setTimeout(() => {
              mapRef.current?.fitToCoordinates(coordinates, {
                edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                animated: true,
              });
            }, 500);
          }
        }}
      >
        {membersWithLocations.map((member) => (
          <Marker
            key={member.userId}
            coordinate={{
              latitude: member.location!.latitude,
              longitude: member.location!.longitude,
            }}
            title={member.name || member.phoneNumber || 'Family Member'}
            description={`${member.relation || 'Member'} • ${getStatusText(member)}`}
            onPress={() => handleMemberSelect(member)}
          >
            <View style={[
              styles.markerContainer,
              selectedMember?.userId === member.userId && styles.selectedMarkerContainer
            ]}>
              <View style={styles.markerCircle}>
                <Text style={styles.markerText}>
                  {(member.name || 'F')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
              <View style={[
                styles.markerDot,
                { backgroundColor: getStatusColor(member) }
              ]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text.primary} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      {/* Map Controls Overlay */}
      <View style={styles.mapControlsOverlay}>
        <TouchableOpacity
          style={[styles.controlButton, mapType === 'standard' && styles.activeControl]}
          onPress={() => setMapType('standard')}
        >
          <Text style={[styles.controlText, mapType === 'standard' && styles.activeControlText]}>
            Standard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, mapType === 'satellite' && styles.activeControl]}
          onPress={() => setMapType('satellite')}
        >
          <Text style={[styles.controlText, mapType === 'satellite' && styles.activeControlText]}>
            Satellite
          </Text>
        </TouchableOpacity>
      </View>

      {/* Family Members Horizontal Cards Overlay */}
      <View style={styles.membersOverlay}>
        <View style={styles.membersHeader}>
          <View style={styles.membersSpacer} />
          <TouchableOpacity onPress={handleRefresh}>
            <View style={styles.refreshButtonContainer}>
              <Ionicons name="refresh" size={20} color={COLORS.text.primary} />
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.membersScrollContent}
        >
          {familyMembers.map((member) => (
            <TouchableOpacity
              key={member.userId}
              style={[
                styles.memberCard,
                selectedMember?.userId === member.userId && styles.selectedMemberCard
              ]}
              onPress={() => handleMemberSelect(member)}
            >
              <View style={styles.memberCardContent}>
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
                  <Text style={[styles.memberStatus, { color: getStatusColor(member) }]}>
                    {getStatusText(member)}
                  </Text>
                </View>
                {member.isLocationShared && member.location && (
                  <View style={styles.locationIndicator}>
                    <Ionicons name="location" size={16} color={COLORS.primary} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selected Member Info Overlay */}
      {selectedMember && selectedMember.isLocationShared && selectedMember.location && (
        <View style={styles.selectedMemberOverlay}>
          <View style={styles.selectedMemberInfoCard}>
            <View style={styles.selectedMemberHeader}>
              <View style={styles.selectedMemberInfo}>
                <Text style={styles.selectedMemberTitle}>
                  {selectedMember.name || selectedMember.phoneNumber || 'Family Member'}
                </Text>
                <Text style={styles.selectedMemberDetails}>
                  {selectedMember.relation || 'Member'} • {getStatusText(selectedMember)}
                </Text>
                <Text style={styles.coordinatesText}>
                  {selectedMember.location.latitude.toFixed(6)}, {selectedMember.location.longitude.toFixed(6)}
                </Text>
                {selectedMember.location.accuracy && (
                  <Text style={styles.accuracyText}>
                    Accuracy: {Math.round(selectedMember.location.accuracy)}m
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedMember(null)}
              >
                <Ionicons name="close" size={20} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingText: {
    marginTop: 16,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarkerContainer: {
    transform: [{ scale: 1.2 }],
  },
  markerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.appColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  markerText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.white,
  },
  markerDot: {
    position: 'absolute',
    bottom: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  backButton: {
    padding: 8,
  },
  backButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSpacer: {
    flex: 1,
  },
  refreshButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControlsOverlay: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'row',
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  activeControl: {
    backgroundColor: COLORS.background.appColor,
  },
  controlText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
  },
  activeControlText: {
    color: COLORS.white,
  },
  membersOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: 20,
    zIndex: 1000,
  },
  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  membersSpacer: {
    flex: 1,
  },
  membersScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  memberCard: {
    width: 200,
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMemberCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
  },
  memberCardContent: {
    alignItems: 'center',
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  photoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  memberName: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  memberRelation: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  memberStatus: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.medium,
    textAlign: 'center',
  },
  locationIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedMemberOverlay: {
    position: 'absolute',
    top: 180,
    left: 20,
    right: 20,
    zIndex: 1001,
  },
  selectedMemberInfoCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedMemberHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  selectedMemberInfo: {
    flex: 1,
    marginRight: 12,
  },
  selectedMemberTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  selectedMemberDetails: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.tertiary,
    marginBottom: 2,
  },
  accuracyText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.tertiary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationMapScreen;
