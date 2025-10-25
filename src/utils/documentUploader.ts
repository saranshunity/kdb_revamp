import ReactNativeBlobUtil from 'react-native-blob-util';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {Alert, Platform} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

export interface DocumentUploadResult {
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface FileData {
  name: string;
  uri: string;
  size: number;
  type: string;
}

/**
 * Pick a document/file using image picker (supports all file types)
 */
export const pickDocument = async (): Promise<FileData | null> => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'mixed', // Allows images, videos, and files
      selectionLimit: 1,
      includeBase64: false,
    });

    if (result.didCancel) {
      return null;
    }

    if (result.errorCode) {
      throw new Error(result.errorMessage || 'Failed to pick document');
    }

    const asset = result.assets?.[0];
    if (!asset || !asset.uri) {
      return null;
    }

    return {
      uri: asset.uri,
      name: asset.fileName || `document_${Date.now()}`,
      type: asset.type || 'application/octet-stream',
      size: asset.fileSize || 0,
    };
  } catch (error) {
    console.error('Error picking document:', error);
    throw error;
  }
};

/**
 * Alternative: Pick using file system (PDF, DOC, etc.)
 */
export const pickDocumentFromFileSystem = async (): Promise<FileData | null> => {
  try {
    // Use react-native-image-picker with mixed media type for better file support
    const result = await launchImageLibrary({
      mediaType: 'mixed', // Allows images, videos, and files
      selectionLimit: 1,
      includeBase64: false,
    });

    if (result.didCancel) {
      return null;
    }

    if (result.errorCode) {
      throw new Error(result.errorMessage || 'Failed to pick document');
    }

    const asset = result.assets?.[0];
    if (!asset || !asset.uri) {
      return null;
    }

    return {
      uri: asset.uri,
      name: asset.fileName || `document_${Date.now()}`,
      type: asset.type || 'application/octet-stream',
      size: asset.fileSize || 0,
    };
  } catch (error: any) {
    if (error.message === 'User canceled') {
      return null;
    }
    console.error('Error picking document:', error);
    throw error;
  }
};

/**
 * Upload document to Firebase Storage with progress tracking
 */
export const uploadDocumentToFirebase = async (
  document: FileData,
  folder: string = 'stallApplications',
  onProgress?: (progress: number) => void,
): Promise<DocumentUploadResult> => {
  try {
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (document.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${document.name}`;
    const storagePath = `${folder}/${fileName}`;

    // Convert URI to path for upload
    const filePath = document.uri.replace('file://', '');

    // Create storage reference
    const reference = storage().ref(storagePath);

    // Upload file
    const task = reference.putFile(filePath);

    // Track progress
    if (onProgress) {
      task.on('state_changed', snapshot => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      });
    }

    // Wait for completion
    await task;

    // Get download URL
    const downloadURL = await reference.getDownloadURL();

    return {
      name: document.name,
      url: downloadURL,
      size: document.size,
      type: document.type,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Save document metadata to Firestore
 */
export const saveDocumentMetadata = async (
  uploadResult: DocumentUploadResult,
  additionalData?: Record<string, any>,
): Promise<void> => {
  try {
    await firestore()
      .collection('stallApplications')
      .add({
        ...uploadResult,
        ...additionalData,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('Error saving metadata:', error);
    throw error;
  }
};

/**
 * Complete upload flow for stall applications
 */
export const handleStallDocumentUpload = async (
  onProgress?: (progress: number) => void,
): Promise<DocumentUploadResult> => {
  // Pick document using file system picker for better PDF support
  const document = await pickDocumentFromFileSystem();
  
  if (!document) {
    throw new Error('No document selected');
  }

  // Upload to Firebase
  const uploadResult = await uploadDocumentToFirebase(
    document,
    'stallApplications',
    onProgress,
  );

  return uploadResult;
};
