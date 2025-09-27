import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

type LocationMapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LocationMap'>;

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  photo?: string;
  isLocationShared: boolean;
  lastSeen?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

const { width, height } = Dimensions.get('window');

const LocationMapScreen = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<LocationMapScreenNavigationProp>();

  // Sample data - in real app, this would come from Firebase
  const sampleMembers: FamilyMember[] = [
    {
      id: "1",
      name: "Aarav Sharma",
      relation: "Son",
      photo: "https://picsum.photos/100/100",
      isLocationShared: true,
      lastSeen: "2 minutes ago",
      currentLocation: {
        latitude: 21.0285,
        longitude: 105.8542
      }
    },
    {
      id: "2",
      name: "Priya Sharma",
      relation: "Wife",
      photo: "https://picsum.photos/101/100",
      isLocationShared: true,
      lastSeen: "5 minutes ago",
      currentLocation: {
        latitude: 21.0290,
        longitude: 105.8545
      }
    },
    {
      id: "3",
      name: "Rajesh Kumar",
      relation: "Brother",
      photo: "https://picsum.photos/102/100",
      isLocationShared: false,
      lastSeen: "1 hour ago"
    }
  ];

  useEffect(() => {
    setFamilyMembers(sampleMembers);
  }, []);

  const handleMemberSelect = (member: FamilyMember) => {
    if (!member.isLocationShared) {
      Alert.alert(
        "Location Not Available",
        `${member.name} has not shared their location.`,
        [{ text: "OK" }]
      );
      return;
    }
    setSelectedMember(member);
  };

  const handleRefresh = () => {
    // In real app, refresh locations from Firebase
    Alert.alert("Refreshing", "Updating family member locations...");
  };

  const getStatusColor = (member: FamilyMember) => {
    if (!member.isLocationShared) return COLORS.text.tertiary;
    if (member.lastSeen === "2 minutes ago" || member.lastSeen === "5 minutes ago") return COLORS.success;
    return COLORS.warning;
  };

  const getStatusText = (member: FamilyMember) => {
    if (!member.isLocationShared) return "Location sharing off";
    return `Last seen ${member.lastSeen}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='light-content' backgroundColor="transparent" translucent />
      
      {/* Full Screen Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType={mapType}
        initialRegion={{
          latitude: 21.0285,
          longitude: 105.8542,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {familyMembers
          .filter(member => member.isLocationShared && member.currentLocation)
          .map((member) => (
            <Marker
              key={member.id}
              coordinate={member.currentLocation!}
              title={member.name}
              description={`${member.relation} • ${getStatusText(member)}`}
              pinColor={selectedMember?.id === member.id ? COLORS.primary : COLORS.background.appColor}
            />
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
        <Text style={styles.header}>Family Map</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <View style={styles.refreshButtonContainer}>
            <Ionicons name="refresh" size={20} color={COLORS.text.primary} />
          </View>
        </TouchableOpacity>
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
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.membersScrollContent}
        >
          {familyMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={[
                styles.memberCard,
                selectedMember?.id === member.id && styles.selectedMemberCard
              ]}
              onPress={() => handleMemberSelect(member)}
            >
              <View style={styles.memberCardContent}>
                <View style={styles.photoContainer}>
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoText}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(member) }
                  ]} />
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRelation}>{member.relation}</Text>
                  <Text style={[styles.memberStatus, { color: getStatusColor(member) }]}>
                    {getStatusText(member)}
                  </Text>
                </View>
                {member.isLocationShared && member.currentLocation && (
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
      {selectedMember && selectedMember.isLocationShared && (
        <View style={styles.selectedMemberOverlay}>
          <View style={styles.selectedMemberCard}>
            <View style={styles.selectedMemberHeader}>
              <View style={styles.selectedMemberInfo}>
                <Text style={styles.selectedMemberTitle}>{selectedMember.name}</Text>
                <Text style={styles.selectedMemberDetails}>
                  {selectedMember.relation} • {getStatusText(selectedMember)}
                </Text>
                {selectedMember.currentLocation && (
                  <Text style={styles.coordinatesText}>
                    {selectedMember.currentLocation.latitude.toFixed(6)}, {selectedMember.currentLocation.longitude.toFixed(6)}
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
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
  header: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.text.primary,
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
    top: 120,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    paddingTop: 16,
    paddingBottom: 20,
    zIndex: 1000,
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
  selectedMemberCard: {
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
