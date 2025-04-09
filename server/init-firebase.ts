import { db } from './firebase';

async function initializeFirebasePins() {
  try {
    console.log('Checking Firebase pins collection...');
    
    // Check if the pins collection exists and if not, create it with initial data
    const pinsCollection = db.collection('pins');
    
    // Create the user passcode document if it doesn't exist
    const userPinQuery = await pinsCollection.where('pin', '==', '7796').get();
    if (userPinQuery.empty) {
      console.log('Adding user passcode (7796)...');
      await pinsCollection.add({
        pin: '7796',
        accessLevel: 'user',
        description: 'Property Owner Access',
        createdAt: new Date(),
      });
    }
    
    // Create the admin passcode document if it doesn't exist
    const adminPinQuery = await pinsCollection.where('pin', '==', '7799').get();
    if (adminPinQuery.empty) {
      console.log('Adding admin passcode (7799)...');
      await pinsCollection.add({
        pin: '7799',
        accessLevel: 'admin',
        description: 'Board Member Access',
        createdAt: new Date(),
      });
    }
    
    // Get all pins for logging
    const allPinsSnapshot = await pinsCollection.get();
    console.log(`Firebase has ${allPinsSnapshot.size} passcodes configured`);
    
    return true;
  } catch (error) {
    console.error('Error initializing Firebase pins:', error);
    // Don't throw, just log the error - this allows the server to start
    // even if Firebase is not properly configured yet
    return false;
  }
}

// Export the initialization function to be used in the server
export const initPins = initializeFirebasePins;