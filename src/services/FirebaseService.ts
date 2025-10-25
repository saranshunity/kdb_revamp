import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export interface StallApplication {
  id: string;
  categoryId: string;
  categoryName: string;
  email: string;
  firmName: string;
  ownerName: string;
  fatherName: string;
  aadharNumber: string;
  correspondenceAddress: string;
  district: string;
  pinCode: string;
  state: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  typeOfWork: string;
  awardAchievement: string;
  otherRemarks?: string;
  aadharCardFile?: string;
  registrationCertificateFile?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface StallCategory {
  id: string;
  name: string;
  description: string;
  totalShops: number;
  availableShops: number;
  icon: string;
  color: string;
}

class FirebaseService {
  private applicationsCollection = firestore().collection('stallApplications');
  private categoriesCollection = firestore().collection('stallCategories');

  // Submit a new stall application
  async submitApplication(applicationData: Omit<StallApplication, 'id' | 'submittedAt' | 'status'>): Promise<string> {
    try {
      const docRef = await this.applicationsCollection.add({
        ...applicationData,
        submittedAt: firestore.FieldValue.serverTimestamp(),
        status: 'pending',
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  // Get all applications (for admin)
  async getAllApplications(): Promise<StallApplication[]> {
    try {
      const snapshot = await this.applicationsCollection
        .orderBy('submittedAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate(),
      })) as StallApplication[];
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  // Get applications by category
  async getApplicationsByCategory(categoryId: string): Promise<StallApplication[]> {
    try {
      const snapshot = await this.applicationsCollection
        .where('categoryId', '==', categoryId)
        .orderBy('submittedAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate(),
      })) as StallApplication[];
    } catch (error) {
      console.error('Error fetching applications by category:', error);
      throw error;
    }
  }

  // Get applications by status
  async getApplicationsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<StallApplication[]> {
    try {
      const snapshot = await this.applicationsCollection
        .where('status', '==', status)
        .orderBy('submittedAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate(),
      })) as StallApplication[];
    } catch (error) {
      console.error('Error fetching applications by status:', error);
      throw error;
    }
  }


  // Get application by ID
  async getApplicationById(applicationId: string): Promise<StallApplication | null> {
    try {
      const doc = await this.applicationsCollection.doc(applicationId).get();
      if (doc.exists) {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          submittedAt: data?.submittedAt?.toDate() || new Date(),
          reviewedAt: data?.reviewedAt?.toDate(),
        } as StallApplication;
      }
      return null;
    } catch (error) {
      console.error('Error fetching application by ID:', error);
      throw error;
    }
  }

  // Get stall categories
  async getStallCategories(): Promise<StallCategory[]> {
    try {
      const snapshot = await this.categoriesCollection.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as StallCategory[];
    } catch (error) {
      console.error('Error fetching stall categories:', error);
      throw error;
    }
  }

  // Upload file to Firebase Storage
  async uploadFile(fileUri: string, fileName: string, folder: string = 'stallApplications'): Promise<string> {
    try {
      // Handle mock files for testing - always return mock URL for development
      console.log('Using mock file upload for development:', fileName);
      return `https://mock-storage.com/${folder}/${fileName}`;
      
      // Uncomment below for production with real file uploads
      /*
      const reference = storage().ref(`${folder}/${fileName}`);
      await reference.putFile(fileUri);
      const downloadURL = await reference.getDownloadURL();
      return downloadURL;
      */
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Get download URL for a file
  async getFileDownloadURL(filePath: string): Promise<string> {
    try {
      const reference = storage().ref(filePath);
      return await reference.getDownloadURL();
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }

  // Update application status
  async updateApplicationStatus(applicationId: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
      // Update the application status
      await this.applicationsCollection.doc(applicationId).update({
        status: status,
        reviewedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Get the application details for notification
      const applicationDoc = await this.applicationsCollection.doc(applicationId).get();
      const applicationData = applicationDoc.data();
      
      if (applicationData) {
        // Log the status change for admin tracking
        console.log(`Application ${applicationId} status changed to ${status} for ${applicationData.firmName}`);
        
        // In a real app, you would send push notifications or emails here
        // For now, we'll just log the notification details
        console.log(`Notification would be sent to: ${applicationData.email}`);
        console.log(`Message: Your stall application for "${applicationData.firmName}" has been ${status}.`);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  // Get application statistics
  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byCategory: { [categoryId: string]: number };
  }> {
    try {
      const snapshot = await this.applicationsCollection.get();
      const applications = snapshot.docs.map(doc => doc.data());
      
      const stats = {
        total: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        approved: applications.filter(app => app.status === 'approved').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        byCategory: {} as { [categoryId: string]: number },
      };

      // Count by category
      applications.forEach(app => {
        const categoryId = app.categoryId;
        stats.byCategory[categoryId] = (stats.byCategory[categoryId] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting application stats:', error);
      throw error;
    }
  }
}

export default new FirebaseService();

