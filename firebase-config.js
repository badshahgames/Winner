import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence,
  signInWithPopup 
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBci1YLe6TGuv9NHFRf1ljBnLH-ULj8jWs",
  authDomain: "color-trado.firebaseapp.com",
  projectId: "color-trado",
  storageBucket: "color-trado.appspot.com",
  messagingSenderId: "960118997572",
  appId: "1:960118997572:web:4d533860f2daa609b3b211"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

// Set persistence (important for login to work properly)
setPersistence(auth, browserLocalPersistence);

// Export Firestore functions
export { doc, setDoc, getDoc, updateDoc };

// Export auth functions
export { signInWithPopup };
