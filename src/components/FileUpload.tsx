import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BodyText } from './Text';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface FileData {
  name: string;
  uri: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  label: string;
  fileName?: string;
  onFileSelect: (file: FileData | null) => void;
  error?: string;
  required?: boolean;
  maxSize?: number; // in MB
  allowedTypes?: string[]; // MIME types
  showPreview?: boolean;
  isUploading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  fileName,
  onFileSelect,
  error,
  required = false,
  maxSize = 10,
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
  showPreview = true,
  isUploading = false,
}) => {
  const [isPicking, setIsPicking] = useState(false);


  const handleFileSelect = async () => {
    if (isPicking || isUploading) return;

    try {
      setIsPicking(true);
      
      // Simple file selection using Alert for now
      Alert.alert(
        'Select File Type',
        'Choose the type of file you want to upload:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'PDF Document',
            onPress: () => {
              const mockFile: FileData = {
                name: 'document.pdf',
                uri: 'file:///tmp/mock_document.pdf',
                size: 1024 * 1024 * 2, // 2MB
                type: 'application/pdf',
              };
              onFileSelect(mockFile);
            },
          },
          {
            text: 'Image File',
            onPress: () => {
              const mockFile: FileData = {
                name: 'image.jpg',
                uri: 'file:///tmp/mock_image.jpg',
                size: 1024 * 1024 * 1, // 1MB
                type: 'image/jpeg',
              };
              onFileSelect(mockFile);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('File selection error:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    } finally {
      setIsPicking(false);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'document-text-outline';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image-outline';
      case 'doc':
      case 'docx':
        return 'document-outline';
      default:
        return 'document-outline';
    }
  };

  return (
    <View style={styles.container}>
      <BodyText color={COLORS.text.primary} size='sm' weight='medium' style={styles.label}>
        {label} {required && '*'}
      </BodyText>
      
      {fileName ? (
        <View style={styles.fileContainer}>
          <View style={styles.fileInfo}>
            <Ionicons name={getFileIcon(fileName)} size={20} color={COLORS.primary} />
            <View style={styles.fileDetails}>
              <BodyText color={COLORS.text.primary} size='sm' style={styles.fileName} numberOfLines={1}>
                {fileName}
              </BodyText>
              {showPreview && (
                <BodyText color={COLORS.text.tertiary} size='xs' style={styles.fileSize}>
                  {fileName.length > 0 ? '2.0 MB' : '0 Bytes'} {/* Mock size for now */}
                </BodyText>
              )}
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleRemoveFile} 
            style={styles.removeButton}
            disabled={isUploading}
          >
            <Ionicons name="close-circle" size={20} color={isUploading ? COLORS.text.tertiary : COLORS.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.uploadButton, 
            error && styles.uploadButtonError,
            (isPicking || isUploading) && styles.uploadButtonDisabled
          ]}
          onPress={handleFileSelect}
          disabled={isPicking || isUploading}
        >
          {isPicking || isUploading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
          )}
          <BodyText color={COLORS.primary} size='sm' weight='medium' style={styles.uploadText}>
            {isPicking ? 'Selecting File...' : isUploading ? 'Uploading...' : 'Upload File'}
          </BodyText>
        </TouchableOpacity>
      )}
      
      <BodyText color={COLORS.text.tertiary} size='xs' style={styles.helpText}>
        Upload 1 supported file. Max {maxSize} MB. Allowed: {allowedTypes.map(type => type.split('/')[1]).join(', ')}
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
  uploadButtonDisabled: {
    borderColor: COLORS.text.tertiary,
    backgroundColor: COLORS.background.tertiary,
    opacity: 0.6,
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
  fileDetails: {
    marginLeft: 8,
    flex: 1,
  },
  fileName: {
    flex: 1,
  },
  fileSize: {
    marginTop: 2,
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

