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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";
import FamilyService from '../../services/FamilyService';
import { useAuth } from '../../contexts/AuthContext';

type JoinFamilyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'JoinFamily'>;

const RELATION_OPTIONS = [
  "Father", "Mother", "Son", "Daughter", 
  "Brother", "Sister", "Grandfather", "Grandmother", 
  "Uncle", "Aunt", "Cousin", "Other"
];

const JoinFamilyScreen = () => {
  const [formData, setFormData] = useState({
    familyCode: "",
    adminPhone: "",
    relation: "",
    customRelation: "",
  });
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isJoining, setIsJoining] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<JoinFamilyScreenNavigationProp>();
  const { user } = useAuth();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.familyCode.trim()) {
      newErrors.familyCode = "Family code is required";
    } else if (formData.familyCode.trim().length !== 6) {
      newErrors.familyCode = "Family code must be 6 characters";
    }

    if (!formData.adminPhone.trim()) {
      newErrors.adminPhone = "Admin phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.adminPhone)) {
      newErrors.adminPhone = "Please enter a valid phone number";
    }

    if (!formData.relation) {
      newErrors.relation = "Please select your relation";
    }

    if (formData.relation === "Other" && !formData.customRelation.trim()) {
      newErrors.customRelation = "Please specify your relation";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoin = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id || !user?.phoneNumber) {
      Alert.alert('Error', 'Please log in to join a family');
      return;
    }

    setIsJoining(true);

    try {
      const relation = formData.relation === 'Other' ? formData.customRelation : formData.relation;
      
      const result = await FamilyService.joinFamily(
        formData.familyCode.trim().toUpperCase(),
        formData.adminPhone.trim(),
        user.id,
        relation,
        user.phoneNumber
      );

      if (result.success && result.familyId) {
        Alert.alert(
          'Success!',
          'You have successfully joined the family!',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('FamilyDashboard', { familyId: result.familyId } as any)
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          result.message || 'Failed to join family. Please check the code and admin phone number.'
        );
      }
    } catch (error: any) {
      console.error('Error joining family:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to join family. Please try again.'
      );
    } finally {
      setIsJoining(false);
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
    // Auto-uppercase family code
    if (field === 'familyCode') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Join Family</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Join an Existing Family</Text>
            <Text style={styles.infoText}>
              Ask the family admin for the 6-digit family code and their phone number. Enter both to join the family group.
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Family Code Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Family Code *</Text>
            <TextInput
              style={[styles.textInput, styles.codeInput, errors.familyCode && styles.errorInput]}
              placeholder="ABC123"
              placeholderTextColor={COLORS.text.tertiary}
              value={formData.familyCode}
              onChangeText={(value) => handleInputChange('familyCode', value)}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {errors.familyCode && <Text style={styles.errorText}>{errors.familyCode}</Text>}
            <Text style={styles.hintText}>Enter the 6-digit code shared by the family admin</Text>
          </View>

          {/* Admin Phone Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Admin Phone Number *</Text>
            <TextInput
              style={[styles.textInput, errors.adminPhone && styles.errorInput]}
              placeholder="+91 98765 43210"
              placeholderTextColor={COLORS.text.tertiary}
              value={formData.adminPhone}
              onChangeText={(value) => handleInputChange('adminPhone', value)}
              keyboardType="phone-pad"
            />
            {errors.adminPhone && <Text style={styles.errorText}>{errors.adminPhone}</Text>}
            <Text style={styles.hintText}>Enter the phone number of the family admin</Text>
          </View>

          {/* Relation Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Your Relation *</Text>
            <TouchableOpacity
              style={[styles.relationButton, errors.relation && styles.errorInput]}
              onPress={() => setShowRelationPicker(true)}
            >
              <Text style={[
                styles.relationButtonText,
                !formData.relation && styles.placeholderText
              ]}>
                {formData.relation || "Select your relation"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
            {errors.relation && <Text style={styles.errorText}>{errors.relation}</Text>}

            {/* Custom Relation Field */}
            {formData.relation === "Other" && (
              <TextInput
                style={[styles.textInput, styles.customRelationInput, errors.customRelation && styles.errorInput]}
                placeholder="Specify your relation"
                placeholderTextColor={COLORS.text.tertiary}
                value={formData.customRelation}
                onChangeText={(value) => handleInputChange('customRelation', value)}
              />
            )}
            {errors.customRelation && <Text style={styles.errorText}>{errors.customRelation}</Text>}
          </View>
        </View>

        {/* Join Button */}
        <TouchableOpacity
          style={[
            styles.joinButton,
            (!formData.familyCode.trim() || !formData.adminPhone.trim() || !formData.relation || isJoining) && styles.joinButtonDisabled
          ]}
          onPress={handleJoin}
          disabled={!formData.familyCode.trim() || !formData.adminPhone.trim() || !formData.relation || isJoining}
        >
          {isJoining ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="people-circle" size={20} color={COLORS.white} />
              <Text style={styles.joinButtonText}>Join Family</Text>
            </>
          )}
        </TouchableOpacity>
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
    </KeyboardAvoidingView>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.appColor + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
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
  formSection: {
    marginBottom: 24,
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
  codeInput: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    letterSpacing: 4,
    textAlign: 'center',
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
  hintText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.tertiary,
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
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.appColor,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 32,
    gap: 8,
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.white,
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

export default JoinFamilyScreen;




