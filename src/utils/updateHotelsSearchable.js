// C:\Users\sefan\Desktop\AE1\AE1\src\utils\updateHotelsSearchable.js
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function updateHotelsSearchable() {
  const db = getFirestore();
  const hotelsRef = collection(db, 'hotels');
  const snapshot = await getDocs(hotelsRef);

  const updatePromises = snapshot.docs.map(async (document) => {
    const hotel = document.data();
    const searchable = generateSearchable(hotel);
    
    await updateDoc(doc(db, 'hotels', document.id), { searchable });
  });

  await Promise.all(updatePromises);
  console.log('All hotel documents have been updated with the searchable field.');
}

// Function to generate searchable field for new hotel documents
export function generateSearchable(hotel) {
  const searchableString = `${hotel.name} ${hotel.address.city} ${hotel.address.region} ${hotel.address.country} ${hotel.accommodationType}`.toLowerCase();
  
  // Split the string into an array of words and remove duplicates
  const searchableArray = [...new Set(searchableString.split(/\s+/).filter(word => word.length > 0))];
  
  return searchableArray;
}

// Function to update all existing hotels in the database
export async function updateAllHotelsSearchable() {
  const db = getFirestore();
  const hotelsRef = collection(db, 'hotels');
  const snapshot = await getDocs(hotelsRef);

  const updatePromises = snapshot.docs.map(async (document) => {
    const hotel = document.data();
    const searchable = generateSearchable(hotel);
    
    await updateDoc(doc(db, 'hotels', document.id), { searchable });
  });

  await Promise.all(updatePromises);
  console.log('All existing hotel documents have been updated with the new searchable field.');
}