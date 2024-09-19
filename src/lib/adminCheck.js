import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from './firebase';

export async function isAdmin() {
  const user = auth.currentUser;
  if (!user) return false;

  const db = getFirestore(); // No need to pass app instance here
  const adminRef = doc(db, 'admins', user.uid);
  const adminSnap = await getDoc(adminRef);

  return adminSnap.exists();
}
