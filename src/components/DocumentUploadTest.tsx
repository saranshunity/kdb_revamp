import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BodyText, ButtonTextPrimary } from './Text';
import { COLORS } from '../constants/colors';
import { handleStallDocumentUpload } from '../utils/documentUploader';

export const DocumentUploadTest: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleUpload = async () => {
    try {
      setUploading(true);
      setProgress(0);

      const result = await handleStallDocumentUpload(setProgress);

      setUploadResult(result);
      Alert.alert('Success', `Document "${result.name}" uploaded successfully!`);
      setProgress(0);
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={handleUpload}
        disabled={uploading}>
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            <ButtonTextPrimary size='sm'>
              Uploading... {Math.round(progress)}%
            </ButtonTextPrimary>
          </View>
        ) : (
          <ButtonTextPrimary size='sm'>📄 Upload Document</ButtonTextPrimary>
        )}
      </TouchableOpacity>

      {uploadResult && (
        <View style={styles.resultContainer}>
          <BodyText color={COLORS.text.primary} size='sm' weight='medium'>
            Upload Result:
          </BodyText>
          <BodyText color={COLORS.text.secondary} size='xs'>
            Name: {uploadResult.name}
          </BodyText>
          <BodyText color={COLORS.text.secondary} size='xs'>
            Size: {(uploadResult.size / (1024 * 1024)).toFixed(1)} MB
          </BodyText>
          <BodyText color={COLORS.text.secondary} size='xs'>
            Type: {uploadResult.type}
          </BodyText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.text.tertiary,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
});
