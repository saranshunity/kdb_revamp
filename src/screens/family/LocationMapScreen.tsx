import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
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
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Family Map</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Interactive Map */}
      <View style={styles.mapContainer}>
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
        
        {/* Map Controls */}
        <View style={styles.mapControls}>
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
      </View>

      {/* Family Members List */}
      <View style={styles.membersContainer}>
        <Text style={styles.sectionTitle}>Family Members</Text>
        <View style={styles.membersList}>
          {familyMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={[
                styles.memberCard,
                selectedMember?.id === member.id && styles.selectedMemberCard
              ]}
              onPress={() => handleMemberSelect(member)}
            >
              <View style={styles.memberInfo}>
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
              </View>
              <View style={styles.memberActions}>
                {member.isLocationShared && member.currentLocation && (
                  <TouchableOpacity style={styles.locationButton}>
                    <Ionicons name="location" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
                <Ionicons name="chevron-forward" size={16} color={COLORS.text.tertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Selected Member Info */}
      {selectedMember && selectedMember.isLocationShared && (
        <View style={styles.selectedMemberInfo}>
          <View style={styles.selectedMemberHeader}>
            <Text style={styles.selectedMemberTitle}>{selectedMember.name}</Text>
            <TouchableOpacity onPress={() => setSelectedMember(null)}>
              <Ionicons name="close" size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.selectedMemberDetails}>
            {selectedMember.relation} • {getStatusText(selectedMember)}
          </Text>
          {selectedMember.currentLocation && (
            <Text style={styles.coordinatesText}>
              {selectedMember.currentLocation.latitude.toFixed(6)}, {selectedMember.currentLocation.longitude.toFixed(6)}
            </Text>
          )}
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
  header: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.text.primary,
  },
  mapContainer: {
    height: height * 0.4,
    backgroundColor: COLORS.background.tertiary,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: COLORS.background.primary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  membersContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  membersList: {
    gap: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  selectedMemberCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.appColor + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.background.appColor,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZES.sm,
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
  memberStatus: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.medium,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationButton: {
    padding: 4,
  },
  selectedMemberInfo: {
    backgroundColor: COLORS.background.primary,
    margin: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedMemberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectedMemberTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
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
});

export default LocationMapScreen;
