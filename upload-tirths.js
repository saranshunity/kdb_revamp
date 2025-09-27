/**
 * Firebase Firestore Upload Script for 48 Kos Tirths
 * 
 * This script uploads tirths data to Firebase Firestore
 * 
 * Prerequisites:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Place the key file in the project root
 * 4. Update the path to your service account key below
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuration
const SERVICE_ACCOUNT_PATH = './path/to/your/serviceAccountKey.json'; // Update this path
const TIRTHS_DATA_PATH = './sample-tirths-data.json'; // Path to your tirths data

// Initialize Firebase Admin SDK
function initializeFirebase() {
  try {
    // Check if service account file exists
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      console.error('❌ Service account key file not found!');
      console.log('📝 Please:');
      console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
      console.log('2. Click "Generate new private key"');
      console.log('3. Download the JSON file');
      console.log('4. Place it in your project root');
      console.log('5. Update SERVICE_ACCOUNT_PATH in this script');
      process.exit(1);
    }

    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });

    console.log('✅ Firebase Admin SDK initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    return false;
  }
}

// Load tirths data from JSON file
function loadTirthsData() {
  try {
    if (!fs.existsSync(TIRTHS_DATA_PATH)) {
      console.error('❌ Tirths data file not found!');
      console.log('📝 Please ensure sample-tirths-data.json exists in the project root');
      process.exit(1);
    }

    const data = fs.readFileSync(TIRTHS_DATA_PATH, 'utf8');
    const tirths = JSON.parse(data);
    
    console.log(`📊 Loaded ${tirths.length} tirths from ${TIRTHS_DATA_PATH}`);
    return tirths;
  } catch (error) {
    console.error('❌ Failed to load tirths data:', error.message);
    process.exit(1);
  }
}

// Upload tirths to Firestore
async function uploadTirths(tirths) {
  const db = admin.firestore();
  const batch = db.batch();
  
  console.log('🔄 Starting upload to Firestore...');
  
  try {
    for (let i = 0; i < tirths.length; i++) {
      const tirth = tirths[i];
      
      // Add timestamps
      const tirthData = {
        ...tirth,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        lastSyncedAt: admin.firestore.Timestamp.now()
      };

      // Add to batch
      const docRef = db.collection('tirths').doc(tirth.id);
      batch.set(docRef, tirthData);
      
      console.log(`📝 Added ${tirth.name} to batch (${i + 1}/${tirths.length})`);
    }

    // Commit the batch
    await batch.commit();
    console.log('✅ All tirths uploaded successfully to Firestore!');
    
    // Verify upload
    const snapshot = await db.collection('tirths').get();
    console.log(`📊 Verification: ${snapshot.size} documents in Firestore`);
    
  } catch (error) {
    console.error('❌ Failed to upload tirths:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Firebase Firestore upload process...\n');
  
  // Step 1: Initialize Firebase
  if (!initializeFirebase()) {
    process.exit(1);
  }
  
  // Step 2: Load tirths data
  const tirths = loadTirthsData();
  
  // Step 3: Upload to Firestore
  try {
    await uploadTirths(tirths);
    console.log('\n🎉 Upload completed successfully!');
    console.log('📱 Your app should now be able to download the tirths data');
  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
    process.exit(1);
  }
  
  // Step 4: Cleanup
  process.exit(0);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { initializeFirebase, loadTirthsData, uploadTirths };
