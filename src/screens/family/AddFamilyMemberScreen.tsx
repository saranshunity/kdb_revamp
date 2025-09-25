import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";

type AddFamilyMemberScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddFamilyMember'>;

const RELATION_OPTIONS = [
  "Spouse", "Son", "Daughter", "Father", "Mother", 
  "Brother", "Sister", "Grandfather", "Grandmother", 
  "Uncle", "Aunt", "Cousin", "Other"
];

const AddFamilyMemberScreen = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    relation: "",
    customRelation: "",
  });
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AddFamilyMemberScreenNavigationProp>();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.relation) {
      newErrors.relation = "Please select a relation";
    }

    if (formData.relation === "Other" && !formData.customRelation.trim()) {
      newErrors.customRelation = "Please specify the relation";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // In real app, save to Firebase
      Alert.alert(
        "Success",
        "Family member added successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  const handleRelationSelect = (relation: string) => {
    setFormData(prev => ({ ...prev, relation }));
    setShowRelationPicker(false);
    if (errors.relation) {
      setErrors(prev => ({ ...prev, relation: "" }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
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
        <Text style={styles.header}>Add Family Member</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={32} color={COLORS.text.tertiary} />
            </View>
            <TouchableOpacity style={styles.photoButton}>
              <Text style={styles.photoButtonText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Full Name *</Text>
            <TextInput
              style={[styles.textInput, errors.name && styles.errorInput]}
              placeholder="Enter full name"
              placeholderTextColor={COLORS.text.tertiary}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Phone Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone Number *</Text>
            <TextInput
              style={[styles.textInput, errors.phone && styles.errorInput]}
              placeholder="+91 98765 43210"
              placeholderTextColor={COLORS.text.tertiary}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Relation Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Relation *</Text>
            <TouchableOpacity
              style={[styles.relationButton, errors.relation && styles.errorInput]}
              onPress={() => setShowRelationPicker(true)}
            >
              <Text style={[
                styles.relationButtonText,
                !formData.relation && styles.placeholderText
              ]}>
                {formData.relation || "Select relation"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
            {errors.relation && <Text style={styles.errorText}>{errors.relation}</Text>}

            {/* Custom Relation Field */}
            {formData.relation === "Other" && (
              <TextInput
                style={[styles.textInput, styles.customRelationInput, errors.customRelation && styles.errorInput]}
                placeholder="Specify relation"
                placeholderTextColor={COLORS.text.tertiary}
                value={formData.customRelation}
                onChangeText={(value) => handleInputChange('customRelation', value)}
              />
            )}
            {errors.customRelation && <Text style={styles.errorText}>{errors.customRelation}</Text>}
          </View>

          {/* Location Sharing Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Location Sharing</Text>
              <Text style={styles.infoText}>
                This member will be able to share their live location with you. 
                They can control their privacy settings after being added.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Relation Picker Modal */}
      {showRelationPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.relationPicker}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Relation</Text>
              <TouchableOpacity onPress={() => setShowRelationPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.relationList}>
              {RELATION_OPTIONS.map((relation) => (
                <TouchableOpacity
                  key={relation}
                  style={styles.relationOption}
                  onPress={() => handleRelationSelect(relation)}
                >
                  <Text style={styles.relationOptionText}>{relation}</Text>
                  {formData.relation === relation && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
  saveButton: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background.appColor,
    borderRadius: 20,
  },
  photoButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.white,
  },
  formSection: {
    paddingBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.error,
    marginTop: 4,
  },
  relationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background.primary,
  },
  relationButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
  },
  placeholderText: {
    color: COLORS.text.tertiary,
  },
  customRelationInput: {
    marginTop: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.appColor + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relationPicker: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    margin: 20,
    maxHeight: 400,
    width: '90%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  pickerTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
  },
  relationList: {
    maxHeight: 300,
  },
  relationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  relationOptionText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
  },
});

export default AddFamilyMemberScreen;
