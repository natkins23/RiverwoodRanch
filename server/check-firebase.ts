import { bucket } from './firebase';

// Function to list files from a specific path
async function listFiles(prefix = 'documents/') {
  try {
    console.log(`Trying to list files with prefix ${prefix}`);
    
    const [files] = await bucket.getFiles({ prefix });
    
    console.log('Firebase Storage files:');
    if (files.length === 0) {
      console.log('No files found.');
    } else {
      files.forEach(file => {
        console.log(`- ${file.name} (${file.metadata.size} bytes)`);
      });
    }
    
    return files;
  } catch (error) {
    console.error('Error listing files from Firebase Storage:', error);
    throw error;
  }
}

// Execute immediately
listFiles().catch(console.error);