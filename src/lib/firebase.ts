/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use the databaseId given in the config
export const db = getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-novelcraft-276ca21a-93ed-46fd-9e19-f3ba640ca296");

export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

// Types
export interface NovelConcept {
  id?: string;
  userId: string;
  theme: string;
  content: string; // The markdown response from Gemini
  twists?: string;
  createdAt: Timestamp;
}

export const saveConcept = async (concept: Omit<NovelConcept, 'id' | 'createdAt'>) => {
  try {
    const conceptsRef = collection(db, "concepts");
    const docRef = await addDoc(conceptsRef, {
      ...concept,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving concept", error);
    throw error;
  }
};

export const getUserConcepts = async (userId: string) => {
  try {
    const conceptsRef = collection(db, "concepts");
    const q = query(
      conceptsRef, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NovelConcept[];
  } catch (error) {
    console.error("Error getting concepts", error);
    throw error;
  }
};
