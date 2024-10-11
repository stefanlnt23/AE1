// C:\Users\sefan\Desktop\AE1\AE1\src\app\auth\utils\firebaseAuth.js
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from "@/lib/firebase";

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export async function signInWithGoogle() {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in with Google:', error);
    throw error;
  }
}

export async function registerUser(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      email,
      username
    });

    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

export async function sendPasswordResetEmailUtil(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

export async function resetPassword(password, resetCode) {
  try {
    await confirmPasswordReset(auth, resetCode, password);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

export function getErrorMessage(error) {
  switch (error.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'Email is already in use';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completing sign in';  
    default:
      return 'An error occurred. Please try again.';
  }
}