import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { updateAllHotelsSearchable } from '../src/utils/updateHotelsSearchable.js';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC9teLhei5TYNoZSTr0Fj4zAdqf-DIr1Yg",
    authDomain: "myhotel-b8350.firebaseapp.com",
    projectId: "myhotel-b8350",
    storageBucket: "myhotel-b8350.appspot.com",
    messagingSenderId: "856297594954",
    appId: "1:856297594954:web:7b2827169c34856085c6b3"
};

// Initialize Firebase
let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(firebase_app);
const db = getFirestore(firebase_app);

async function main() {
  try {
    await updateAllHotelsSearchable(db);  // Pass db as an argument
    console.log('All existing hotels have been updated successfully.');
  } catch (error) {
    console.error('An error occurred while updating hotels:', error);
  } finally {
    process.exit();
  }
}

main();