import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../path/to/your/firebaseConfig';

// Initialize Firebase
initializeApp(firebaseConfig);

(async () => {
  const db = getFirestore();
  const hotelsRef = collection(db, 'hotels');
  const snapshot = await getDocs(hotelsRef);

  const updatePromises = snapshot.docs.map(async (document) => {
    const hotel = document.data();
    const searchable = `${hotel.name} ${hotel.address.city} ${hotel.address.country}`.toLowerCase();
    
    await updateDoc(doc(db, 'hotels', document.id), { searchable });
  });

  await Promise.all(updatePromises);
  console.log('All hotel documents have been updated with the searchable field.');
})();