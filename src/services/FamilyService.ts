import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import SharingPreferencesService from './SharingPreferencesService';
import LocationService from './LocationService';

export interface FamilyMember {
  userId: string;
  role: 'admin' | 'member';
  addedAt: Date;
  addedBy: string;
  relation?: string;
  phoneNumber?: string;
  name?: string;
  photo?: string;
}

export interface Family {
  id: string;
  name: string;
  code: string; // 6-digit unique code
  createdBy: string;
  createdAt: Date;
  members: FamilyMember[];
  settings: {
    allowLocationSharing: boolean;
    defaultSharingDuration?: number;
  };
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  updatedAt: Date;
  isActive: boolean;
  userId: string;
}

export interface AddMemberResult {
  success: boolean;
  userId?: string;
  invitationId?: string;
  status: 'added' | 'invited' | 'already_member' | 'error';
  message?: string;
}

export interface JoinFamilyResult {
  success: boolean;
  familyId?: string;
  message?: string;
}

class FamilyService {
  private familiesCollection = firestore().collection('families');

  // Generate unique 6-digit alphanumeric code
  private async generateFamilyCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars like 0, O, I, 1
    let code = '';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if code already exists
      const existing = await this.familiesCollection
        .where('code', '==', code)
        .limit(1)
        .get();

      if (existing.empty) {
        return code;
      }

      attempts++;
    }

    // Fallback: use timestamp-based code if all attempts fail
    return Date.now().toString().slice(-6).toUpperCase();
  }

  // Create a new family group (Single-family model)
  async createFamily(
    name: string,
    userId: string,
    relation: string,
    phoneNumber: string
  ): Promise<string> {
    try {
      // Check if user already has a family
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData?.familyId) {
        throw new Error('You already belong to a family. Please leave your current family first.');
      }

      // Generate unique family code
      const code = await this.generateFamilyCode();

      const familyData = {
        name,
        code,
        createdBy: userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        members: [
          {
            userId,
            role: 'admin',
            addedAt: new Date().toISOString(),
            addedBy: userId,
          },
        ],
        settings: {
          allowLocationSharing: true,
          defaultSharingDuration: 24, // hours
        },
      };

      const docRef = await this.familiesCollection.add(familyData);
      const familyId = docRef.id;

      // Get user's name from users collection
      const adminUserDoc = await firestore().collection('users').doc(userId).get();
      const adminUserData = adminUserDoc.data();
      const adminUserName = adminUserData?.firstName || adminUserData?.name || '';

      // Create the member document in subcollection
      await this.familiesCollection
        .doc(familyId)
        .collection('members')
        .doc(userId)
        .set({
          userId,
          role: 'admin',
          addedAt: firestore.FieldValue.serverTimestamp(),
          addedBy: userId,
          relation,
          phoneNumber,
          name: adminUserName,
        });

      // Store familyId in user document for quick lookup
      await firestore().collection('users').doc(userId).update({
        familyId,
      });

      // Automatically enable location sharing for the creator
      try {
        await SharingPreferencesService.addSharingFamily(userId, familyId);
        await LocationService.startTracking(userId, {
          familyIds: [familyId],
        });
        console.log('Location sharing auto-enabled for family creator');
      } catch (error) {
        console.error('Error auto-enabling location sharing:', error);
        // Don't fail family creation if location sharing fails
      }

      console.log('Family created:', familyId, 'Code:', code);
      return familyId;
    } catch (error) {
      console.error('Error creating family:', error);
      throw error;
    }
  }

  // Join a family using code and admin phone number
  async joinFamily(
    code: string,
    adminPhoneNumber: string,
    userId: string,
    relation: string,
    phoneNumber: string
  ): Promise<JoinFamilyResult> {
    try {
      // Check if user already has a family
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData?.familyId) {
        return {
          success: false,
          message: 'You already belong to a family. Please leave your current family first.',
        };
      }

      // Normalize phone numbers
      const normalizedAdminPhone = this.normalizePhoneNumber(adminPhoneNumber);
      const normalizedUserPhone = this.normalizePhoneNumber(phoneNumber);

      // Find family by code
      const familyQuery = await this.familiesCollection
        .where('code', '==', code.toUpperCase())
        .limit(1)
        .get();

      if (familyQuery.empty) {
        return {
          success: false,
          message: 'Invalid family code. Please check and try again.',
        };
      }

      const familyDoc = familyQuery.docs[0];
      const familyData = familyDoc.data();
      const familyId = familyDoc.id;

      // Verify admin phone number matches createdBy user's phone
      const adminUserDoc = await firestore()
        .collection('users')
        .doc(familyData.createdBy)
        .get();

      const adminUserData = adminUserDoc.data();
      const adminUserPhone = this.normalizePhoneNumber(adminUserData?.phone || '');

      if (adminUserPhone !== normalizedAdminPhone) {
        return {
          success: false,
          message: 'Invalid admin phone number. Please verify with the family admin.',
        };
      }

      // Check if user is already a member
      const existingMember = await this.familiesCollection
        .doc(familyId)
        .collection('members')
        .doc(userId)
        .get();

      if (existingMember.exists) {
        return {
          success: false,
          message: 'You are already a member of this family.',
        };
      }

      // Get user's name from users collection
      const joiningUserDoc = await firestore().collection('users').doc(userId).get();
      const joiningUserData = joiningUserDoc.data();
      const joiningUserName = joiningUserData?.firstName || joiningUserData?.name || '';

      // Add user as member
      await this.familiesCollection
        .doc(familyId)
        .collection('members')
        .doc(userId)
        .set({
          userId,
          role: 'member',
          addedAt: firestore.FieldValue.serverTimestamp(),
          addedBy: familyData.createdBy,
          relation,
          phoneNumber: normalizedUserPhone,
          name: joiningUserName,
        });

      // Update family members array
      await this.familiesCollection.doc(familyId).update({
        members: firestore.FieldValue.arrayUnion({
          userId,
          role: 'member',
          addedAt: new Date().toISOString(),
          addedBy: familyData.createdBy,
        }),
      });

      // Store familyId in user document
      await firestore().collection('users').doc(userId).update({
        familyId,
      });

      // Automatically enable location sharing for the new member
      try {
        await SharingPreferencesService.addSharingFamily(userId, familyId);
        await LocationService.startTracking(userId, {
          familyIds: [familyId],
        });
        console.log('Location sharing auto-enabled for new family member');
      } catch (error) {
        console.error('Error auto-enabling location sharing:', error);
        // Don't fail family join if location sharing fails
      }

      console.log('User joined family:', familyId);
      return {
        success: true,
        familyId,
        message: 'Successfully joined the family!',
      };
    } catch (error) {
      console.error('Error joining family:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to join family. Please try again.',
      };
    }
  }

  // Get user's family (single-family model)
  async getUserFamily(userId: string): Promise<Family | null> {
    try {
      // Quick lookup from user document
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      const familyId = userData?.familyId;

      if (!familyId) {
        return null;
      }

      return await this.getFamilyById(familyId);
    } catch (error) {
      console.error('Error getting user family:', error);
      return null;
    }
  }

  // Get family by ID
  async getFamilyById(familyId: string): Promise<Family | null> {
    try {
      const familyDoc = await this.familiesCollection.doc(familyId).get();

      if (!familyDoc.exists) {
        return null;
      }

      const data = familyDoc.data();
      const membersSnapshot = await familyDoc.ref.collection('members').get();
      const members: FamilyMember[] = membersSnapshot.docs.map((memberDoc) => {
        const memberData = memberDoc.data();
        return {
          userId: memberData.userId,
          role: memberData.role,
          addedAt: memberData.addedAt?.toDate() || new Date(),
          addedBy: memberData.addedBy,
          relation: memberData.relation,
          phoneNumber: memberData.phoneNumber,
          name: memberData.name,
          photo: memberData.photo,
        };
      });

      return {
        id: familyDoc.id,
        name: data?.name || '',
        code: data?.code || '',
        createdBy: data?.createdBy || '',
        createdAt: data?.createdAt?.toDate() || new Date(),
        members,
        settings: data?.settings || {
          allowLocationSharing: true,
        },
      };
    } catch (error) {
      console.error('Error getting family by ID:', error);
      return null;
    }
  }

  // Get all members in a family
  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    try {
      const snapshot = await this.familiesCollection
        .doc(familyId)
        .collection('members')
        .get();

      // Fetch user names for all members
      const membersWithNames = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          let memberName = data.name;
          
          // If name is not stored in member doc, fetch from users collection
          if (!memberName && data.userId) {
            try {
              const memberUserDoc = await firestore().collection('users').doc(data.userId).get();
              const memberUserData = memberUserDoc.data();
              memberName = memberUserData?.firstName || memberUserData?.name || '';
              
              // Update member doc with name if we found it
              if (memberName) {
                await this.familiesCollection
                  .doc(familyId)
                  .collection('members')
                  .doc(data.userId)
                  .update({ name: memberName });
              }
            } catch (error) {
              console.error(`Error fetching name for user ${data.userId}:`, error);
            }
          }
          
          return {
            userId: data.userId,
            role: data.role,
            addedAt: data.addedAt?.toDate() || new Date(),
            addedBy: data.addedBy,
            relation: data.relation,
            phoneNumber: data.phoneNumber,
            name: memberName || '',
            photo: data.photo,
          };
        })
      );

      return membersWithNames;
    } catch (error) {
      console.error('Error getting family members:', error);
      throw error;
    }
  }

  // Add member to family (via phone number) - Invite flow
  async addMember(
    familyId: string,
    phoneNumber: string,
    relation: string,
    addedBy: string,
    memberName?: string
  ): Promise<AddMemberResult> {
    try {
      // Normalize phone number
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

      // Check if user already exists
      const userQuery = await firestore()
        .collection('users')
        .where('phone', '==', normalizedPhone)
        .limit(1)
        .get();

      if (!userQuery.empty) {
        // User exists - add directly
        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data();

        // Check if already a member
        const memberDoc = await this.familiesCollection
          .doc(familyId)
          .collection('members')
          .doc(userId)
          .get();

        if (memberDoc.exists) {
          return {
            success: false,
            status: 'already_member',
            message: 'User is already a member of this family',
          };
        }

        // Add to members subcollection
        await this.familiesCollection
          .doc(familyId)
          .collection('members')
          .doc(userId)
          .set({
            userId,
            role: 'member',
            addedAt: firestore.FieldValue.serverTimestamp(),
            addedBy,
            relation,
            phoneNumber: normalizedPhone,
            name: memberName || userData.firstName || userData.name || '',
          });

        // Update family members array
        await this.familiesCollection.doc(familyId).update({
          members: firestore.FieldValue.arrayUnion({
            userId,
            role: 'member',
            addedAt: new Date().toISOString(),
            addedBy,
          }),
        });

        // Update user's familyId
        await firestore().collection('users').doc(userId).update({
          familyId,
        });

        // Automatically enable location sharing for the added member
        try {
          await SharingPreferencesService.addSharingFamily(userId, familyId);
          await LocationService.startTracking(userId, {
            familyIds: [familyId],
          });
          console.log('Location sharing auto-enabled for added member');
        } catch (error) {
          console.error('Error auto-enabling location sharing:', error);
          // Don't fail member addition if location sharing fails
        }

        console.log('Member added to family:', userId);
        return {
          success: true,
          userId,
          status: 'added',
          message: 'Member added successfully',
        };
      } else {
        // User doesn't exist - create pending invitation
        const invitationRef = this.familiesCollection
          .doc(familyId)
          .collection('invitations')
          .doc();

        const addedByName = await this.getUserName(addedBy);

        await invitationRef.set({
          phoneNumber: normalizedPhone,
          invitedByName: addedByName || 'Family Member',
          relation,
          invitedAt: firestore.FieldValue.serverTimestamp(),
          invitedBy: addedBy,
          status: 'pending',
          expiresAt: firestore.Timestamp.fromDate(
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          ), // 30 days
        });

        console.log('Invitation created:', invitationRef.id);
        return {
          success: true,
          invitationId: invitationRef.id,
          status: 'invited',
          message: 'Invitation sent. Member will be added when they register.',
        };
      }
    } catch (error) {
      console.error('Error adding member:', error);
      return {
        success: false,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to add member',
      };
    }
  }

  // Remove member from family
  async removeMember(familyId: string, memberId: string, removedBy: string): Promise<void> {
    try {
      // Check if remover is admin
      const removerMember = await this.familiesCollection
        .doc(familyId)
        .collection('members')
        .doc(removedBy)
        .get();

      if (!removerMember.exists || removerMember.data()?.role !== 'admin') {
        throw new Error('Only admins can remove members');
      }

      // Remove from subcollection
      await this.familiesCollection
        .doc(familyId)
        .collection('members')
        .doc(memberId)
        .delete();

      // Remove from members array
      const familyDoc = await this.familiesCollection.doc(familyId).get();
      const familyData = familyDoc.data();
      const updatedMembers = (familyData?.members || []).filter(
        (m: any) => m.userId !== memberId
      );

      await this.familiesCollection.doc(familyId).update({
        members: updatedMembers,
      });

      // Remove from liveLocations if exists
      await this.familiesCollection
        .doc(familyId)
        .collection('liveLocations')
        .doc(memberId)
        .delete()
        .catch(() => {
          // Ignore if doesn't exist
        });

      // Clear familyId from user document
      await firestore().collection('users').doc(memberId).update({
        familyId: firestore.FieldValue.delete(),
      });

      console.log('Member removed from family:', memberId);
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  // Leave family (handles both admin and regular members)
  async leaveFamily(familyId: string, userId: string): Promise<void> {
    try {
      const memberDoc = await this.familiesCollection
        .doc(familyId)
        .collection('members')
        .doc(userId)
        .get();

      if (!memberDoc.exists) {
        throw new Error('You are not a member of this family');
      }

      const memberData = memberDoc.data();
      const isAdmin = memberData?.role === 'admin';

      // Get all members count
      const allMembersSnapshot = await this.familiesCollection
        .doc(familyId)
        .collection('members')
        .get();

      const totalMembers = allMembersSnapshot.size;

      // If admin is leaving and there are other members, auto-promote first member
      if (isAdmin && totalMembers > 1) {
        // Find the oldest member (by addedAt) who is not the leaving admin
        const otherMembers = allMembersSnapshot.docs
          .filter(doc => doc.id !== userId)
          .map(doc => ({
            userId: doc.id,
            data: doc.data(),
            addedAt: doc.data().addedAt?.toDate() || new Date(0),
          }))
          .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());

        if (otherMembers.length > 0) {
          const newAdminId = otherMembers[0].userId;
          
          // Promote first member to admin
          await this.familiesCollection
            .doc(familyId)
            .collection('members')
            .doc(newAdminId)
            .update({
              role: 'admin',
            });

          // Update family createdBy to new admin
          await this.familiesCollection.doc(familyId).update({
            createdBy: newAdminId,
          });

          console.log('Admin left, promoted member to admin:', newAdminId);
        }
      }

      // If only 1 member left (or everyone left), delete the family
      if (totalMembers <= 1) {
        // Delete all members subcollection
        const membersSnapshot = await this.familiesCollection
          .doc(familyId)
          .collection('members')
          .get();
        
        const deleteMemberPromises = membersSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deleteMemberPromises);

        // Delete liveLocations subcollection
        const locationsSnapshot = await this.familiesCollection
          .doc(familyId)
          .collection('liveLocations')
          .get();
        
        const deleteLocationPromises = locationsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deleteLocationPromises);

        // Delete invitations subcollection
        const invitationsSnapshot = await this.familiesCollection
          .doc(familyId)
          .collection('invitations')
          .get();
        
        const deleteInvitationPromises = invitationsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deleteInvitationPromises);

        // Clear familyId from all user documents
        for (const memberDoc of membersSnapshot.docs) {
          await firestore().collection('users').doc(memberDoc.id).update({
            familyId: firestore.FieldValue.delete(),
          });
        }

        // Delete the family document
        await this.familiesCollection.doc(familyId).delete();

        console.log('Family deleted as all members left:', familyId);
        return;
      }

      // Remove leaving member from subcollection
      await this.familiesCollection
        .doc(familyId)
        .collection('members')
        .doc(userId)
        .delete();

      // Remove from members array
      const familyDoc = await this.familiesCollection.doc(familyId).get();
      const familyData = familyDoc.data();
      const updatedMembers = (familyData?.members || []).filter(
        (m: any) => m.userId !== userId
      );

      await this.familiesCollection.doc(familyId).update({
        members: updatedMembers,
      });

      // Remove from liveLocations if exists
      await this.familiesCollection
        .doc(familyId)
        .collection('liveLocations')
        .doc(userId)
        .delete()
        .catch(() => {
          // Ignore if doesn't exist
        });

      // Clear familyId from user document
      await firestore().collection('users').doc(userId).update({
        familyId: firestore.FieldValue.delete(),
      });

      console.log('User left family:', familyId);
    } catch (error) {
      console.error('Error leaving family:', error);
      throw error;
    }
  }

  // Subscribe to family member locations (real-time) - OPTIMIZED VERSION
  subscribeToMemberLocations(
    familyId: string,
    callback: (locations: Map<string, LocationData>) => void
  ): () => void {
    // Use aggregated liveLocations feed (single listener)
    const unsubscribe = this.familiesCollection
      .doc(familyId)
      .collection('liveLocations')
      .onSnapshot(
        (snapshot) => {
          const locations = new Map<string, LocationData>();

          snapshot.forEach((doc) => {
            const data = doc.data();
            locations.set(doc.id, {
              latitude: data.latitude,
              longitude: data.longitude,
              accuracy: data.accuracy,
              timestamp: data.timestamp?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              isActive: true,
              userId: data.userId || doc.id,
            });
          });

          callback(locations);
        },
        (error) => {
          console.error('Error subscribing to member locations:', error);
          callback(new Map());
        }
      );

    return unsubscribe;
  }

  // Accept invitation (when user registers/logs in)
  async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    try {
      const user = auth().currentUser;
      if (!user || !user.phoneNumber) {
        throw new Error('User phone number not available');
      }

      const normalizedPhone = this.normalizePhoneNumber(user.phoneNumber);

      // Search for invitation with this phone number
      const invitationsSnapshot = await firestore()
        .collectionGroup('invitations')
        .where('phoneNumber', '==', normalizedPhone)
        .where('status', '==', 'pending')
        .get();

      for (const invitationDoc of invitationsSnapshot.docs) {
        const invitationData = invitationDoc.data();
        const familyId = invitationDoc.ref.parent.parent?.id;

        if (!familyId) continue;

        // Add user to family
        await this.familiesCollection
          .doc(familyId)
          .collection('members')
          .doc(userId)
          .set({
            userId,
            role: 'member',
            addedAt: firestore.FieldValue.serverTimestamp(),
            addedBy: invitationData.invitedBy,
            relation: invitationData.relation,
            phoneNumber: normalizedPhone,
          });

        // Update invitation status
        await invitationDoc.ref.update({
          status: 'accepted',
          acceptedAt: firestore.FieldValue.serverTimestamp(),
        });

        // Update family members array
        await this.familiesCollection.doc(familyId).update({
          members: firestore.FieldValue.arrayUnion({
            userId,
            role: 'member',
            addedAt: new Date().toISOString(),
            addedBy: invitationData.invitedBy,
          }),
        });

        // Store familyId in user document
        await firestore().collection('users').doc(userId).update({
          familyId,
        });

        console.log('Invitation accepted, user added to family:', familyId);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  // Helper: Normalize phone number
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let normalized = phone.replace(/[^\d+]/g, '');

    // If doesn't start with +, assume +91 (India)
    if (!normalized.startsWith('+')) {
      // Remove leading 0 if present
      if (normalized.startsWith('0')) {
        normalized = normalized.substring(1);
      }
      normalized = '+91' + normalized;
    }

    return normalized;
  }

  // Helper: Get user name
  private async getUserName(userId: string): Promise<string | null> {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      const data = userDoc.data();
      return data?.firstName || data?.name || null;
    } catch (error) {
      console.error('Error getting user name:', error);
      return null;
    }
  }
}

export default new FamilyService();
