import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { BodyText } from './Text';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface FileUploadProps {
  label: string;
  fileName?: string;
  onFileSelect: (file: any) => void;
  error?: string;
  required?: boolean;
  maxSize?: number; // in MB
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  fileName,
  onFileSelect,
  error,
  required = false,
  maxSize = 10,
}) => {
  const handleFileSelect = () => {
    // In a real app, this would open a file picker
    // For now, we'll simulate file selection
    Alert.alert(
      'File Upload',
      'File upload functionality will be implemented with react-native-document-picker or similar library.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Upload',
          onPress: () => {
            // Simulate file upload
            const mockFile = {
              name: 'document.pdf',
              size: 1024 * 1024 * 2, // 2MB
              type: 'application/pdf',
            };
            onFileSelect(mockFile);
          },
        },
      ]
    );
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
  };

  return (
    <View style={styles.container}>
      <BodyText color={COLORS.text.primary} size='sm' weight='medium' style={styles.label}>
        {label} {required && '*'}
      </BodyText>
      
      {fileName ? (
        <View style={styles.fileContainer}>
          <View style={styles.fileInfo}>
            <Ionicons name="document-outline" size={20} color={COLORS.primary} />
            <BodyText color={COLORS.text.primary} size='sm' style={styles.fileName}>
              {fileName}
            </BodyText>
          </View>
          <TouchableOpacity onPress={handleRemoveFile} style={styles.removeButton}>
            <Ionicons name="close-circle" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, error && styles.uploadButtonError]}
          onPress={handleFileSelect}
        >
          <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
          <BodyText color={COLORS.primary} size='sm' weight='medium' style={styles.uploadText}>
            Upload File
          </BodyText>
        </TouchableOpacity>
      )}
      
      <BodyText color={COLORS.text.tertiary} size='xs' style={styles.helpText}>
        Upload 1 supported file. Max {maxSize} MB.
      </BodyText>
      
      {error && (
        <BodyText color={COLORS.error} size='xs' style={styles.errorText}>
          {error}
        </BodyText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
  },
  uploadButtonError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '10',
  },
  uploadText: {
    marginTop: 8,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.secondary,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileName: {
    marginLeft: 8,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  helpText: {
    marginTop: 4,
  },
  errorText: {
    marginTop: 4,
  },
});

export default FileUpload;
