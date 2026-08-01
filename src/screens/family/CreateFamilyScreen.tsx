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

type CreateFamilyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateFamily'>;

const RELATION_OPTIONS = [
  "Father", "Mother", "Self", "Spouse", "Son", "Daughter", 
  "Brother", "Sister", "Grandfather", "Grandmother", 
  "Uncle", "Aunt", "Cousin", "Other"
];

const CreateFamilyScreen = () => {
  const [formData, setFormData] = useState({
    familyName: "",
    relation: "",
    customRelation: "",
  });
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isCreating, setIsCreating] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<CreateFamilyScreenNavigationProp>();
  const { user } = useAuth();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.familyName.trim()) {
      newErrors.familyName = "Family name is required";
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

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id || !user?.phoneNumber) {
      Alert.alert('Error', 'Please log in to create a family');
      return;
    }

    setIsCreating(true);

    try {
      const relation = formData.relation === 'Other' ? formData.customRelation : formData.relation;
      
      const familyId = await FamilyService.createFamily(
        formData.familyName.trim(),
        user.id,
        relation,
        user.phoneNumber
      );

      // Get the created family to show code
      const family = await FamilyService.getFamilyById(familyId);

      Alert.alert(
        'Family Created!',
        `Your family "${formData.familyName.trim()}" has been created!\n\nFamily Code: ${family?.code}\n\nShare this code with family members so they can join.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('FamilyDashboard', { familyId } as any)
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating family:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create family. Please try again.'
      );
    } finally {
      setIsCreating(false);
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
        <Text style={styles.header}>Create Your Family</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Create a Family Group</Text>
            <Text style={styles.infoText}>
              You'll receive a unique 6-digit code that you can share with family members. They can use this code to join your family group.
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Family Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Family Name *</Text>
            <TextInput
              style={[styles.textInput, errors.familyName && styles.errorInput]}
              placeholder="e.g., Sharma Family"
              placeholderTextColor={COLORS.text.tertiary}
              value={formData.familyName}
              onChangeText={(value) => handleInputChange('familyName', value)}
            />
            {errors.familyName && <Text style={styles.errorText}>{errors.familyName}</Text>}
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

        {/* Create Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (!formData.familyName.trim() || !formData.relation || isCreating) && styles.createButtonDisabled
          ]}
          onPress={handleCreate}
          disabled={!formData.familyName.trim() || !formData.relation || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color={COLORS.white} />
              <Text style={styles.createButtonText}>Create Family</Text>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.appColor,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 32,
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
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

export default CreateFamilyScreen;




