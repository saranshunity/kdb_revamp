import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";

type FamilyMembersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FamilyMembers'>;

interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  relation: string;
  photo?: string;
  isLocationShared: boolean;
  lastSeen?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

const FamilyMembersScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<FamilyMember[]>([]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FamilyMembersScreenNavigationProp>();

  // Sample data - in real app, this would come from Firebase
  const sampleMembers: FamilyMember[] = [
    {
      id: "1",
      name: "Aarav Sharma",
      phone: "+91 98765 43210",
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
      phone: "+91 87654 32109",
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
      phone: "+91 76543 21098",
      relation: "Brother",
      photo: "https://picsum.photos/102/100",
      isLocationShared: false,
      lastSeen: "1 hour ago"
    }
  ];

  useEffect(() => {
    setFamilyMembers(sampleMembers);
    setFilteredMembers(sampleMembers);
  }, []);

  useEffect(() => {
    const filtered = familyMembers.filter(member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.relation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery)
    );
    setFilteredMembers(filtered);
  }, [searchQuery, familyMembers]);

  const handleAddMember = () => {
    navigation.navigate('AddFamilyMember');
  };

  const handleViewMap = () => {
    navigation.navigate('LocationMap');
  };

  const handleMemberPress = (member: FamilyMember) => {
    // Navigate to member details or location
    console.log("Member pressed:", member.name);
  };

  const handleLocationToggle = (memberId: string) => {
    setFamilyMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, isLocationShared: !member.isLocationShared }
          : member
      )
    );
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
        <Text style={styles.header}>Family Members</Text>
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
        <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add Member</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapButton} onPress={handleViewMap}>
          <Ionicons name="map-outline" size={20} color={COLORS.primary} />
          <Text style={styles.mapButtonText}>View Map</Text>
        </TouchableOpacity>
      </View>

      {/* Family Members List */}
      <ScrollView style={styles.membersList} showsVerticalScrollIndicator={false}>
        {filteredMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyTitle}>No family members found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? "Try adjusting your search" : "Add your first family member to get started"}
            </Text>
          </View>
        ) : (
          filteredMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={styles.memberItem}
              onPress={() => handleMemberPress(member)}
            >
              <View style={styles.memberLeft}>
                <View style={styles.photoContainer}>
                  {member.photo ? (
                    <View style={styles.photoPlaceholder}>
                      <Text style={styles.photoText}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Text style={styles.photoText}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                  )}
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(member) }
                  ]} />
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRelation}>{member.relation}</Text>
                  <Text style={styles.memberPhone}>{member.phone}</Text>
                  <Text style={[styles.memberStatus, { color: getStatusColor(member) }]}>
                    {getStatusText(member)}
                  </Text>
                </View>
              </View>
              <View style={styles.memberRight}>
                <TouchableOpacity
                  style={styles.locationToggle}
                  onPress={() => handleLocationToggle(member.id)}
                >
                  <Ionicons
                    name={member.isLocationShared ? "location" : "location-outline"}
                    size={20}
                    color={member.isLocationShared ? COLORS.primary : COLORS.text.tertiary}
                  />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  locationToggle: {
    padding: 8,
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
  },
});

export default FamilyMembersScreen;
