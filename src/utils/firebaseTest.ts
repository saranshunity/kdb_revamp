import FirebaseService from '../services/FirebaseService';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test 1: Fetch stall categories
    console.log('📋 Testing stall categories fetch...');
    const categories = await FirebaseService.getStallCategories();
    console.log('✅ Categories fetched successfully:', categories.length, 'categories');
    
    // Test 2: Test application submission with mock data
    console.log('📝 Testing application submission...');
    const testApplication = {
      categoryId: categories[0]?.id || 'test-category',
      categoryName: categories[0]?.name || 'Test Category',
      email: 'test@example.com',
      firmName: 'Test Firm',
      ownerName: 'Test Owner',
      fatherName: 'Test Father',
      aadharNumber: '123456789012',
      correspondenceAddress: 'Test Address',
      district: 'Test District',
      pinCode: '123456',
      state: 'Test State',
      mobileNumber: '9876543210',
      alternateMobileNumber: '9876543211',
      typeOfWork: 'Test Work',
      awardAchievement: 'Test Achievement',
      otherRemarks: 'Test Remarks',
      aadharCardFile: 'https://mock-storage.com/test-aadhar.pdf',
      registrationCertificateFile: 'https://mock-storage.com/test-registration.pdf',
    };
    
    const applicationId = await FirebaseService.submitApplication(testApplication);
    console.log('✅ Application submitted successfully with ID:', applicationId);
    
    // Test 3: Fetch all applications
    console.log('📊 Testing applications fetch...');
    const applications = await FirebaseService.getAllApplications();
    console.log('✅ Applications fetched successfully:', applications.length, 'applications');
    
    console.log('🎉 All Firebase tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
};

export const testStallCategories = async () => {
  try {
    console.log('📋 Testing stall categories...');
    const categories = await FirebaseService.getStallCategories();
    console.log('✅ Categories loaded:', categories);
    return categories;
  } catch (error) {
    console.error('❌ Failed to load categories:', error);
    throw error;
  }
};
