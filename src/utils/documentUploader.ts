import ReactNativeBlobUtil from 'react-native-blob-util';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { NativeModules} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import '../types/nativeModules';

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
 * Alternative: Pick using native DocumentPicker module
 */
export const pickDocumentFromFileSystem = async (): Promise<FileData | null> => {
  try {
    // Use native DocumentPicker module
    const { DocumentPicker } = NativeModules;
    
    if (!DocumentPicker) {
      throw new Error('DocumentPicker native module not found');
    }

    const result = await DocumentPicker.pick();

    if (!result) {
      return null;
    }

    return {
      uri: result.uri,
      name: result.name || `document_${Date.now()}`,
      type: result.type || 'application/octet-stream',
      size: result.size || 0,
    };
  } catch (error: any) {
    if (error.message === 'User cancelled' || error.message === 'CANCELLED') {
      return null;
    }
    console.error('Error picking document:', error);
    throw error;
  }
};

/**
 * Ensure user is authenticated (using anonymous auth if needed) for Firebase Storage
 * This is optional - if Storage rules allow unauthenticated access, this won't be needed
 */
const ensureAuthenticated = async (): Promise<void> => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      // Try to sign in anonymously to allow Storage uploads
      // This is a fallback if Storage rules require authentication
      console.log('No user authenticated, attempting anonymous sign-in for Storage access...');
      try {
        await auth().signInAnonymously();
        console.log('Anonymous authentication successful');
      } catch (anonError: any) {
        console.log('Anonymous auth not available or not needed:', anonError.message);
        // Continue without auth - Storage rules should allow unauthenticated access
      }
    }
  } catch (error: any) {
    console.log('Auth check skipped - proceeding with upload:', error.message);
    // Don't throw - allow upload to proceed
    // The Storage rules should allow unauthenticated access for tirthMitra folder
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
    // Ensure authentication for Storage (use anonymous if needed)
    await ensureAuthenticated();

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
