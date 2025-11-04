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

export interface TirthMitraApplication {
  id: string;
  fullName: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  photoUri: string;
  selectedDistrict: string;
  selectedTirth: string;
  selectedTirthName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface MahotsavHulchal {
  id: string;
  title: string;
  image: string;
  categories: string[];
  description: string;
  rating: number;
  time: string;
  price: number;
  location: string;
  organizer: string;
  contactInfo: string;
  additionalInfo: string;
}

export interface EventItem {
  id: string;
  title: string;
  image?: string;
  time: string;
  location: string;
  description?: string;
  categories?: string[];
  isFavorite?: boolean;
  hasReminder?: boolean;
  date: string; // Format: "DD-MM-YYYY" or "DD/MM/YYYY"
}

// Firebase Storage URL for mahotsavHulchul.json
// Make sure the file is set to public access in Firebase Storage so no token is needed
// Format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{filename}?alt=media
const MAHOTSAV_HULCHAL_STORAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavHulchul.json?alt=media';

// Firebase Storage URL for events.json
const EVENTS_STORAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/events.json?alt=media&token=a2fdf0b3-47ca-4860-a3c0-f58e92c6e210';

class FirebaseService {
  private applicationsCollection = firestore().collection('stallApplications');
  private categoriesCollection = firestore().collection('stallCategories');
  private tirthMitraApplicationsCollection = firestore().collection('tirthMitraApplications');

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

  // ==================== TIRTH MITRA APPLICATION METHODS ====================

  // Submit a new Tirth Mitra application
  async submitTirthMitraApplication(applicationData: Omit<TirthMitraApplication, 'id' | 'submittedAt' | 'status'>): Promise<string> {
    try {
      const docRef = await this.tirthMitraApplicationsCollection.add({
        ...applicationData,
        submittedAt: firestore.FieldValue.serverTimestamp(),
        status: 'pending',
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting Tirth Mitra application:', error);
      throw error;
    }
  }

  // Get all Tirth Mitra applications (for admin)
  async getAllTirthMitraApplications(): Promise<TirthMitraApplication[]> {
    try {
      const snapshot = await this.tirthMitraApplicationsCollection
        .orderBy('submittedAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate(),
      })) as TirthMitraApplication[];
    } catch (error) {
      console.error('Error fetching Tirth Mitra applications:', error);
      throw error;
    }
  }

  // Get Tirth Mitra applications by status
  async getTirthMitraApplicationsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<TirthMitraApplication[]> {
    try {
      const snapshot = await this.tirthMitraApplicationsCollection
        .where('status', '==', status)
        .orderBy('submittedAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate(),
      })) as TirthMitraApplication[];
    } catch (error) {
      console.error('Error fetching Tirth Mitra applications by status:', error);
      throw error;
    }
  }

  // Get Tirth Mitra application by ID
  async getTirthMitraApplicationById(applicationId: string): Promise<TirthMitraApplication | null> {
    try {
      const doc = await this.tirthMitraApplicationsCollection.doc(applicationId).get();
      if (doc.exists) {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          submittedAt: data?.submittedAt?.toDate() || new Date(),
          reviewedAt: data?.reviewedAt?.toDate(),
        } as TirthMitraApplication;
      }
      return null;
    } catch (error) {
      console.error('Error fetching Tirth Mitra application by ID:', error);
      throw error;
    }
  }

  // Update Tirth Mitra application status
  async updateTirthMitraApplicationStatus(applicationId: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
      // Update the application status
      await this.tirthMitraApplicationsCollection.doc(applicationId).update({
        status: status,
        reviewedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Get the application details for notification
      const applicationDoc = await this.tirthMitraApplicationsCollection.doc(applicationId).get();
      const applicationData = applicationDoc.data();
      
      if (applicationData) {
        // Log the status change for admin tracking
        console.log(`Tirth Mitra Application ${applicationId} status changed to ${status} for ${applicationData.fullName}`);
        
        // In a real app, you would send push notifications or emails here
        console.log(`Notification would be sent to: ${applicationData.email}`);
        console.log(`Message: Your Tirth Mitra application has been ${status}.`);
      }
    } catch (error) {
      console.error('Error updating Tirth Mitra application status:', error);
      throw error;
    }
  }

  // Get Tirth Mitra application statistics
  async getTirthMitraApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byDistrict: { [district: string]: number };
  }> {
    try {
      const snapshot = await this.tirthMitraApplicationsCollection.get();
      const applications = snapshot.docs.map(doc => doc.data());
      
      const stats = {
        total: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        approved: applications.filter(app => app.status === 'approved').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        byDistrict: {} as { [district: string]: number },
      };

      // Count by district
      applications.forEach(app => {
        const district = app.selectedDistrict || 'Unknown';
        stats.byDistrict[district] = (stats.byDistrict[district] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting Tirth Mitra application stats:', error);
      throw error;
    }
  }

  // Get all Mahotsav Hulchal items from Firebase Storage JSON file
  async getMahotsavHulchal(): Promise<MahotsavHulchal[]> {
    try {
      const response = await fetch(MAHOTSAV_HULCHAL_STORAGE_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch mahotsav hulchal: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle both array and object with array property
      const items: MahotsavHulchal[] = Array.isArray(data) 
        ? data 
        : (data.items || data.data || []);
      
      // Ensure each item has an id field (use array index if missing)
      const itemsWithIds = items.map((item, index) => ({
        ...item,
        id: item.id || String(index + 1),
      })) as MahotsavHulchal[];
      
      // Sort by order field if it exists, otherwise by id
      return itemsWithIds.sort((a, b) => {
        const orderA = (a as any).order ?? parseInt(a.id) ?? 0;
        const orderB = (b as any).order ?? parseInt(b.id) ?? 0;
        return orderA - orderB;
      });
    } catch (error) {
      console.error('Error fetching mahotsav hulchal:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  // Subscribe to Mahotsav Hulchal changes (polling-based for JSON file)
  subscribeToMahotsavHulchal(
    onChange: (items: MahotsavHulchal[]) => void,
  ): () => void {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let isSubscribed = true;

    // Fetch immediately
    this.getMahotsavHulchal().then(items => {
      if (isSubscribed) {
        onChange(items);
      }
    });

    // Poll every 5 minutes for updates
    intervalId = setInterval(async () => {
      if (isSubscribed) {
        try {
          const items = await this.getMahotsavHulchal();
          onChange(items);
        } catch (error) {
          console.error('Error polling mahotsav hulchal:', error);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Return unsubscribe function
    return () => {
      isSubscribed = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }

  // Get all events from Firebase Storage JSON file
  async getEvents(): Promise<EventItem[]> {
    try {
      const response = await fetch(EVENTS_STORAGE_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle both array and object with array property
      const items: EventItem[] = Array.isArray(data) 
        ? data 
        : (data.events || data.items || data.data || []);
      
      // Ensure each item has an id field (use array index if missing)
      const itemsWithIds = items.map((item, index) => ({
        ...item,
        id: item.id || String(index + 1),
      })) as EventItem[];
      
      return itemsWithIds;
    } catch (error) {
      console.error('Error fetching events:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  // Subscribe to Events changes (polling-based for JSON file)
  subscribeToEvents(
    onChange: (items: EventItem[]) => void,
  ): () => void {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let isSubscribed = true;

    // Fetch immediately
    this.getEvents().then(items => {
      if (isSubscribed) {
        onChange(items);
      }
    });

    // Poll every 5 minutes for updates
    intervalId = setInterval(async () => {
      if (isSubscribed) {
        try {
          const items = await this.getEvents();
          onChange(items);
        } catch (error) {
          console.error('Error polling events:', error);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Return unsubscribe function
    return () => {
      isSubscribed = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }
}

export default new FirebaseService();

